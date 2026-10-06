import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createServer } from 'vite';
import { OFFERS } from '../src/config/offers.js';
import { checksum, getLicenseTier, getEntitlements, getExportRestriction, canUseTemplate } from '../src/config/licensePolicy.js';

const key = (prefix) => `${prefix}-AB12-CD34-${checksum((prefix === 'ZNPRO' ? '' : prefix) + 'AB12CD34')}`;
test('offers use the requested price architecture', () => {
  assert.deepEqual(OFFERS.map(({ id, amount }) => [id, amount]), [['explore',0],['creator',99],['studio',299],['signature',2500],['bespoke',6000]]);
});
test('new licenses distinguish Creator and Studio; existing Pro rights remain', () => {
  assert.equal(getLicenseTier(key('ZNCRT')), 'creator');
  assert.equal(getLicenseTier(key('ZNSTU')), 'studio');
  assert.equal(getLicenseTier(key('ZNPRO')), 'studio');
  assert.equal(getLicenseTier(key('ZNCRT').replace('ZNCRT', 'ZNSTU')), 'explore');
  assert.equal(getLicenseTier('garbage'), 'explore');
  assert.equal(getLicenseTier(key('ZNSTU') + '-EXTRA'), 'explore');
  for (const tier of ['creator', 'studio']) {
    const generated = execFileSync(process.execPath, ['scripts/generate-key.js', `--tier=${tier}`, 'AB12', 'CD34'], { encoding: 'utf8' }).trim();
    assert.equal(getLicenseTier(generated), tier);
  }
});
test('production export rights follow the selected tier', () => {
  const explore = getEntitlements('explore'), creator = getEntitlements('creator'), studio = getEntitlements('studio');
  for (const format of ['react','json','css','html']) assert.ok(getExportRestriction(explore,{format}));
  assert.equal(getExportRestriction(creator,{format:'react',itemCount:12}),null);
  assert.ok(getExportRestriction(creator,{format:'html'}));
  assert.ok(getExportRestriction(creator,{adaptive:true}));
  assert.ok(getExportRestriction(creator,{itemCount:13}));
  assert.equal(getExportRestriction(studio,{format:'html',itemCount:100,adaptive:true}),null);
  assert.equal(creator.canRemoveBranding,false);
  assert.equal(studio.canRemoveBranding,true);
  assert.equal(canUseTemplate('luxury','creator'),false);
  assert.equal(canUseTemplate('luxury','studio'),true);
  assert.equal(canUseTemplate('modern','explore'),false);
});
test('Grok settings, authentication, response and failure handling', async () => {
  const server = await createServer({ configFile: false, optimizeDeps: { noDiscovery: true, include: [] }, server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' });
  const originalFetch = globalThis.fetch;
  const originalStorage = globalThis.localStorage;
  const values = new Map();
  globalThis.localStorage = { getItem: (key) => values.get(key) ?? null, setItem: (key,value) => values.set(key,value) };
  try {
    const api = await server.ssrLoadModule('/src/orbify-ai/services/aiService.js');
    const preset = api.resetAISettings(api.AI_PROVIDERS.XAI);
    assert.equal(preset.endpoint, 'https://api.x.ai/v1/chat/completions');
    assert.equal(preset.model, 'grok-4.6');
    assert.equal(api.isAIConfigured(),false);
    api.updateAISettings({apiKey:'fixture-key'});
    assert.equal(api.isAIConfigured(),true);
    globalThis.fetch = async (url, options) => {
      assert.equal(url,preset.endpoint);
      assert.equal(options.headers.Authorization,'Bearer fixture-key');
      assert.equal(options.method,'POST');
      const body = JSON.parse(options.body);
      assert.equal(body.model,'grok-4.6');
      assert.deepEqual(body.messages,[{role:'user',content:'Create a menu'}]);
      return new Response(JSON.stringify({choices:[{message:{content:'{"menuItems":[]}'}}],model:'grok-4.6'}));
    };
    assert.equal((await api.makeAIRequest('Create a menu')).content,'{"menuItems":[]}');
    globalThis.fetch = async () => new Response(JSON.stringify({error:{message:'Invalid xAI API key'}}),{status:401});
    await assert.rejects(api.makeAIRequest('Create a menu'), /Invalid xAI API key/);
    const generator = await server.ssrLoadModule('/src/utils/codeGenerator.js');
    assert.match(generator.generateMenuConfig({}, [], '#fff'), /Generated with/);
    assert.doesNotMatch(generator.generateMenuConfig({}, [], '#fff', { includeBranding: false }), /Generated with/);
    const licenses = await server.ssrLoadModule('/src/orbify-ai/services/licenseService.js');
    assert.equal(licenses.getTierFeatures('creator').price,99);
    assert.equal(licenses.getTierFeatures('studio').price,299);
  } finally {
    globalThis.fetch = originalFetch;
    globalThis.localStorage = originalStorage;
    await server.close();
  }
});
