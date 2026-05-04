import { AI_PROVIDERS } from './aiService';

const HELP = {
  [AI_PROVIDERS.ANTHROPIC]: {
    title: 'Claude Setup',
    level: 'cloud',
    steps: [
      'API Key in das Feld "API Key" eintragen.',
      'Model über das Dropdown wählen.',
      'Endpoint kann auf Standard bleiben.',
    ],
    commands: [],
  },
  [AI_PROVIDERS.OPENAI]: {
    title: 'OpenAI Setup',
    level: 'cloud',
    steps: [
      'API Key in das Feld "API Key" eintragen.',
      'Model über das Dropdown wählen.',
      'Endpoint kann auf Standard bleiben.',
    ],
    commands: [],
  },
  [AI_PROVIDERS.OLLAMA]: {
    title: 'Ollama Lokal Setup',
    level: 'local',
    steps: [
      'Öffne zuerst die App "Terminal".',
      'Lade ein Modell: "ollama pull llama3.1:8b".',
      'Starte Ollama: "ollama serve".',
      'Wähle im Builder das Modell "llama3.1:8b".',
      'Klicke danach auf "Test".',
    ],
    commands: ['ollama serve', 'ollama pull llama3.1:8b', 'OLLAMA_ORIGINS=* ollama serve'],
  },
  [AI_PROVIDERS.CUSTOM]: {
    title: 'Custom API Setup',
    level: 'custom',
    steps: [
      'Endpoint vollständig eintragen.',
      'API Style passend zum Anbieter wählen.',
      'Model-ID exakt wie beim Anbieter angeben.',
    ],
    commands: [],
  },
};

export function getProviderHelp(provider) {
  return HELP[provider] || HELP[AI_PROVIDERS.ANTHROPIC];
}
