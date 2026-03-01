/**
 * Orbify AI - AI Service
 * Main AI service for communicating with AI APIs (Claude, GPT, etc.)
 */

import { ERROR_MESSAGES } from '../../orbify-core/config/constants';

const env = typeof import.meta !== 'undefined' ? import.meta.env || {} : {};
const AI_SETTINGS_KEY = 'zo_ai_settings_v1';

export const AI_PROVIDERS = {
  ANTHROPIC: 'anthropic',
  OPENAI: 'openai',
  OLLAMA: 'ollama',
  CUSTOM: 'custom',
};

const PROVIDER_PRESETS = {
  [AI_PROVIDERS.ANTHROPIC]: {
    endpoint: 'https://api.anthropic.com/v1/messages',
    model: 'claude-3-5-sonnet-20241022',
    requiresApiKey: true,
    apiStyle: 'anthropic',
  },
  [AI_PROVIDERS.OPENAI]: {
    endpoint: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4o-mini',
    requiresApiKey: true,
    apiStyle: 'openai-compatible',
  },
  [AI_PROVIDERS.OLLAMA]: {
    endpoint: 'http://localhost:11434/v1/chat/completions',
    model: 'llama3.1:8b',
    requiresApiKey: false,
    apiStyle: 'openai-compatible',
  },
  [AI_PROVIDERS.CUSTOM]: {
    endpoint: '',
    model: '',
    requiresApiKey: false,
    apiStyle: 'openai-compatible',
  },
};

const getBaseAIConfig = () => {
  const envProvider = env.VITE_AI_PROVIDER || AI_PROVIDERS.ANTHROPIC;
  const preset = PROVIDER_PRESETS[envProvider] || PROVIDER_PRESETS[AI_PROVIDERS.ANTHROPIC];

  return {
    provider: envProvider,
    apiKey: env.VITE_AI_API_KEY || '',
    model: env.VITE_AI_MODEL || preset.model,
    endpoint: env.VITE_AI_ENDPOINT || preset.endpoint,
    temperature: 0.7,
    maxTokens: 2048,
    // For custom provider:
    apiStyle: env.VITE_AI_API_STYLE || preset.apiStyle,
    authHeaderName: env.VITE_AI_AUTH_HEADER || 'Authorization',
    authPrefix: env.VITE_AI_AUTH_PREFIX || 'Bearer ',
  };
};

const readStoredSettings = () => {
  try {
    return JSON.parse(localStorage.getItem(AI_SETTINGS_KEY) || '{}');
  } catch {
    return {};
  }
};

const writeStoredSettings = (settings) => {
  localStorage.setItem(AI_SETTINGS_KEY, JSON.stringify(settings));
};

export const getProviderPresets = () => PROVIDER_PRESETS;

export const getAISettings = () => {
  const base = getBaseAIConfig();
  const stored = readStoredSettings();
  const merged = { ...base, ...stored };
  const preset = PROVIDER_PRESETS[merged.provider] || PROVIDER_PRESETS[AI_PROVIDERS.CUSTOM];

  return {
    ...merged,
    endpoint: merged.endpoint || preset.endpoint,
    model: merged.model || preset.model,
    apiStyle: merged.apiStyle || preset.apiStyle,
  };
};

export const updateAISettings = (partial) => {
  const next = { ...getAISettings(), ...partial };
  writeStoredSettings(next);
  return next;
};

export const resetAISettings = (provider = AI_PROVIDERS.ANTHROPIC) => {
  const base = getBaseAIConfig();
  const preset = PROVIDER_PRESETS[provider] || PROVIDER_PRESETS[AI_PROVIDERS.ANTHROPIC];
  const next = {
    ...base,
    provider,
    endpoint: preset.endpoint,
    model: preset.model,
    apiStyle: preset.apiStyle,
    apiKey: '',
  };
  writeStoredSettings(next);
  return next;
};

/**
 * Make AI API request
 * @param {string} prompt - The prompt to send
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} AI response
 */
export const makeAIRequest = async (prompt, options = {}) => {
  try {
    const settings = { ...getAISettings(), ...options };
    const { provider } = settings;

    if (provider === AI_PROVIDERS.ANTHROPIC) {
      return await makeAnthropicRequest(prompt, settings);
    }

    if (provider === AI_PROVIDERS.OPENAI || provider === AI_PROVIDERS.OLLAMA) {
      return await makeOpenAICompatibleRequest(prompt, settings);
    }

    if (provider === AI_PROVIDERS.CUSTOM) {
      if (settings.apiStyle === 'anthropic') {
        return await makeAnthropicRequest(prompt, settings);
      }
      return await makeOpenAICompatibleRequest(prompt, settings);
    }

    throw new Error('Unsupported AI provider');
  } catch (error) {
    console.error('AI Request Error:', error);
    throw new Error(error.message || ERROR_MESSAGES.NETWORK_ERROR);
  }
};

/**
 * Make Anthropic Claude API request
 */
const makeAnthropicRequest = async (prompt, settings) => {
  const {
    endpoint,
    apiKey,
    model,
    temperature,
    maxTokens,
  } = settings;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      temperature,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'AI request failed');
  }

  const data = await response.json();
  return {
    content: data.content[0].text,
    usage: data.usage,
    model: data.model,
  };
};

/**
 * Make OpenAI API request
 */
const makeOpenAICompatibleRequest = async (prompt, settings) => {
  const {
    endpoint,
    apiKey,
    model,
    temperature,
    maxTokens,
    authHeaderName = 'Authorization',
    authPrefix = 'Bearer ',
  } = settings;

  const headers = {
    'Content-Type': 'application/json',
  };

  if (apiKey) {
    headers[authHeaderName] = `${authPrefix}${apiKey}`;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      temperature,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || 'AI request failed');
  }

  const data = await response.json();
  if (data.choices?.[0]?.message?.content) {
    return {
      content: data.choices[0].message.content,
      usage: data.usage,
      model: data.model || model,
    };
  }

  // Fallback for custom/ollama variants
  if (typeof data.response === 'string') {
    return {
      content: data.response,
      usage: data.usage || null,
      model: data.model || model,
    };
  }

  return {
    content: JSON.stringify(data),
    usage: data.usage || null,
    model: data.model || model,
  };
};

/**
 * Parse JSON from AI response
 * @param {string} response - AI response text
 * @returns {Object} Parsed JSON
 */
export const parseAIResponse = (response) => {
  try {
    // Try to extract JSON from markdown code blocks
    const jsonMatch = response.match(/```json\n?([\s\S]*?)\n?```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }

    // Try to parse directly
    return JSON.parse(response);
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    throw new Error('Invalid AI response format');
  }
};

/**
 * Check if AI service is configured
 * @returns {boolean}
 */
export const isAIConfigured = () => {
  const settings = getAISettings();
  const preset = PROVIDER_PRESETS[settings.provider] || PROVIDER_PRESETS[AI_PROVIDERS.CUSTOM];
  if (!settings.endpoint) return false;
  if (preset.requiresApiKey) return !!settings.apiKey;
  return true;
};

/**
 * Get AI provider info
 * @returns {Object}
 */
export const getAIProviderInfo = () => {
  const settings = getAISettings();
  return {
    provider: settings.provider,
    model: settings.model,
    endpoint: settings.endpoint,
    configured: isAIConfigured(),
  };
};

/**
 * Test AI connection
 * @returns {Promise<boolean>}
 */
export const testAIConnection = async () => {
  try {
    const response = await makeAIRequest('Test connection. Reply with "OK".');
    return response.content.toLowerCase().includes('ok');
  } catch (error) {
    console.error('AI Connection Test Failed:', error);
    return false;
  }
};

export default {
  makeAIRequest,
  parseAIResponse,
  isAIConfigured,
  getAIProviderInfo,
  getAISettings,
  updateAISettings,
  resetAISettings,
  getProviderPresets,
  testAIConnection,
};
