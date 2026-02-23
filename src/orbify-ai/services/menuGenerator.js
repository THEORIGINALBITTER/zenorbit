/**
 * Orbify AI - Menu Generator Service
 * AI-powered menu generation from natural language
 */

import { makeAIRequest, parseAIResponse } from './aiService';
import { validateMenuItems } from '../../orbify-core/utils/configValidator';
import {
  generateMenuPrompt,
  generateImprovementPrompt,
  generateFromSitemapPrompt,
  generateIndustryMenuPrompt,
  generateAccessibleMenuPrompt,
} from '../prompts/menuGeneratorPrompts';

/**
 * Generate menu from user description
 * @param {string} description - User's description of desired menu
 * @param {Object} options - Generation options
 * @returns {Promise<Object>} Generated menu configuration
 */
export const generateMenuFromDescription = async (description, options = {}) => {
  try {
    const prompt = generateMenuPrompt(description, options);

    console.log('🤖 Generating menu with AI...', { description, options });

    const response = await makeAIRequest(prompt, {
      temperature: 0.7,
      maxTokens: 2048,
    });

    const menuConfig = parseAIResponse(response.content);

    // Validate generated menu
    const validation = validateMenuItems(menuConfig.menuItems);
    if (!validation.valid) {
      console.warn('Generated menu has validation errors:', validation.errors);
      // Try to fix common issues
      menuConfig.menuItems = fixMenuItems(menuConfig.menuItems);
    }

    return {
      success: true,
      menu: menuConfig,
      usage: response.usage,
    };
  } catch (error) {
    console.error('Menu generation failed:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Improve existing menu with AI suggestions
 * @param {Object} currentMenu - Current menu configuration
 * @returns {Promise<Object>}
 */
export const improveExistingMenu = async (currentMenu) => {
  try {
    const prompt = generateImprovementPrompt(currentMenu);

    const response = await makeAIRequest(prompt, {
      temperature: 0.6,
    });

    const improvedMenu = parseAIResponse(response.content);

    return {
      success: true,
      menu: improvedMenu,
      improvements: improvedMenu.suggestions,
    };
  } catch (error) {
    console.error('Menu improvement failed:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Generate menu from sitemap/page list
 * @param {Array} pages - List of pages
 * @returns {Promise<Object>}
 */
export const generateFromSitemap = async (pages) => {
  try {
    const prompt = generateFromSitemapPrompt(pages);

    const response = await makeAIRequest(prompt);
    const menuConfig = parseAIResponse(response.content);

    return {
      success: true,
      menu: menuConfig,
    };
  } catch (error) {
    console.error('Sitemap menu generation failed:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Generate industry-specific menu
 * @param {string} industry - Industry type
 * @returns {Promise<Object>}
 */
export const generateIndustryMenu = async (industry) => {
  try {
    const prompt = generateIndustryMenuPrompt(industry);

    const response = await makeAIRequest(prompt);
    const menuConfig = parseAIResponse(response.content);

    return {
      success: true,
      menu: menuConfig,
    };
  } catch (error) {
    console.error('Industry menu generation failed:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Generate accessible menu
 * @param {string} description
 * @returns {Promise<Object>}
 */
export const generateAccessibleMenu = async (description) => {
  try {
    const prompt = generateAccessibleMenuPrompt(description);

    const response = await makeAIRequest(prompt);
    const menuConfig = parseAIResponse(response.content);

    return {
      success: true,
      menu: menuConfig,
    };
  } catch (error) {
    console.error('Accessible menu generation failed:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Fix common menu item issues
 * @param {Array} menuItems
 * @returns {Array} Fixed menu items
 */
const fixMenuItems = (menuItems) => {
  return menuItems.map((item, index) => {
    // Ensure ID exists
    if (!item.id) {
      item.id = `menu-item-${index}`;
    }

    // Ensure label exists
    if (!item.label) {
      item.label = `Item ${index + 1}`;
    }

    // Ensure angle exists and is valid
    if (item.angle === undefined || item.angle === null) {
      item.angle = -45 * index;
    }

    // Ensure action exists
    if (!item.action) {
      item.action = item.route ? 'route' : 'custom';
    }

    return item;
  });
};

/**
 * Get available industry templates
 * @returns {Array}
 */
export const getIndustryTemplates = () => {
  return [
    { id: 'e-commerce', name: 'E-Commerce', icon: '🛒' },
    { id: 'portfolio', name: 'Portfolio', icon: '💼' },
    { id: 'restaurant', name: 'Restaurant', icon: '🍽️' },
    { id: 'agency', name: 'Agency', icon: '🎨' },
    { id: 'blog', name: 'Blog', icon: '📝' },
    { id: 'saas', name: 'SaaS', icon: '☁️' },
    { id: 'education', name: 'Education', icon: '🎓' },
    { id: 'healthcare', name: 'Healthcare', icon: '🏥' },
    { id: 'real-estate', name: 'Real Estate', icon: '🏠' },
    { id: 'nonprofit', name: 'Nonprofit', icon: '💚' },
  ];
};

/**
 * Save AI generation to history
 * @param {Object} generation
 */
export const saveToHistory = (generation) => {
  try {
    const history = JSON.parse(localStorage.getItem('orbify_ai_history') || '[]');
    history.unshift({
      ...generation,
      timestamp: new Date().toISOString(),
    });

    // Keep only last 10
    const trimmed = history.slice(0, 10);
    localStorage.setItem('orbify_ai_history', JSON.stringify(trimmed));
  } catch (error) {
    console.error('Failed to save to history:', error);
  }
};

/**
 * Get AI generation history
 * @returns {Array}
 */
export const getHistory = () => {
  try {
    return JSON.parse(localStorage.getItem('orbify_ai_history') || '[]');
  } catch (error) {
    console.error('Failed to load history:', error);
    return [];
  }
};

export default {
  generateMenuFromDescription,
  improveExistingMenu,
  generateFromSitemap,
  generateIndustryMenu,
  generateAccessibleMenu,
  getIndustryTemplates,
  saveToHistory,
  getHistory,
};
