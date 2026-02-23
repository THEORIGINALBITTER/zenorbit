/**
 * Orbify AI - AI Service
 * Main AI service for communicating with AI APIs (Claude, GPT, etc.)
 */

import { API_ENDPOINTS, ERROR_MESSAGES } from '../../orbify-core/config/constants';

// Configuration - will be set by environment variables
const AI_CONFIG = {
  provider: 'anthropic', // 'anthropic' | 'openai' | 'custom'
  apiKey: process.env.REACT_APP_AI_API_KEY || '',
  model: process.env.REACT_APP_AI_MODEL || 'claude-3-5-sonnet-20241022',
  endpoint: process.env.REACT_APP_AI_ENDPOINT || 'https://api.anthropic.com/v1/messages',
  maxTokens: 4096,
  temperature: 0.7,
};

/**
 * Make AI API request
 * @param {string} prompt - The prompt to send
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} AI response
 */
export const makeAIRequest = async (prompt, options = {}) => {
  try {
    const {
      provider = AI_CONFIG.provider,
      model = AI_CONFIG.model,
      temperature = AI_CONFIG.temperature,
      maxTokens = AI_CONFIG.maxTokens,
    } = options;

    if (provider === 'anthropic') {
      return await makeAnthropicRequest(prompt, { model, temperature, maxTokens });
    } else if (provider === 'openai') {
      return await makeOpenAIRequest(prompt, { model, temperature, maxTokens });
    } else {
      throw new Error('Unsupported AI provider');
    }
  } catch (error) {
    console.error('AI Request Error:', error);
    throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
  }
};

/**
 * Make Anthropic Claude API request
 */
const makeAnthropicRequest = async (prompt, { model, temperature, maxTokens }) => {
  const response = await fetch(AI_CONFIG.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': AI_CONFIG.apiKey,
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
const makeOpenAIRequest = async (prompt, { model, temperature, maxTokens }) => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AI_CONFIG.apiKey}`,
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
    content: data.choices[0].message.content,
    usage: data.usage,
    model: data.model,
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
  return !!AI_CONFIG.apiKey && !!AI_CONFIG.endpoint;
};

/**
 * Get AI provider info
 * @returns {Object}
 */
export const getAIProviderInfo = () => {
  return {
    provider: AI_CONFIG.provider,
    model: AI_CONFIG.model,
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
  testAIConnection,
};
