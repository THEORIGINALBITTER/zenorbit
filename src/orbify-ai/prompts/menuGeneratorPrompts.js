/**
 * Orbify AI - Menu Generator Prompts
 * Prompt templates for AI menu generation
 */

/**
 * Base system prompt for menu generation
 */
export const SYSTEM_PROMPT = `You are an expert UI/UX designer specializing in creating intuitive navigation menus for websites.

Your task is to generate orbit/radial menu configurations based on user descriptions.

Rules:
1. Return ONLY valid JSON, no explanations
2. Menu items should be distributed evenly around the orbit (angles: 0, -45, -90, -135, -180)
3. Use clear, concise labels (max 12 characters)
4. Include logical groupings (use submenus for related items)
5. Always include a "Home" or "Main" item
6. Suggest appropriate routes based on common conventions
7. Consider user experience and accessibility

Output format:
{
  "menuItems": [
    {
      "id": "unique-id",
      "label": "Menu Label",
      "angle": -45,
      "action": "route" | "openSubmenu" | "openOverlay",
      "route": "/path" (if action is "route"),
      "submenu": "submenu-id" (if action is "openSubmenu"),
      "tooltip": "Helpful description"
    }
  ],
  "submenus": {
    "submenu-id": [
      {
        "id": "sub-id",
        "label": "Sub Item",
        "angle": -60,
        "action": "route",
        "route": "/path",
        "tooltip": "Description"
      }
    ]
  },
  "suggestions": {
    "colorScheme": "suggested color scheme name",
    "animationStyle": "fast|smooth|bouncy",
    "reasoning": "Brief explanation of design choices"
  }
}`;

/**
 * Generate menu prompt from user description
 * @param {string} userDescription - User's menu description
 * @param {Object} options - Additional options
 * @returns {string}
 */
export const generateMenuPrompt = (userDescription, options = {}) => {
  const {
    websiteType = 'general',
    existingPages = [],
    maxItems = 5,
    includeSubmenus = true,
  } = options;

  let prompt = `${SYSTEM_PROMPT}\n\n`;
  prompt += `Create an orbit menu for a ${websiteType} website.\n\n`;
  prompt += `User Description: "${userDescription}"\n\n`;

  if (existingPages.length > 0) {
    prompt += `Existing pages to include:\n`;
    existingPages.forEach(page => {
      prompt += `- ${page}\n`;
    });
    prompt += '\n';
  }

  prompt += `Constraints:\n`;
  prompt += `- Maximum ${maxItems} main menu items\n`;
  prompt += `- ${includeSubmenus ? 'Include' : 'Do not include'} submenus if appropriate\n\n`;

  prompt += `Generate the menu configuration now:`;

  return prompt;
};

/**
 * Generate menu improvement suggestions prompt
 * @param {Object} currentMenu - Current menu configuration
 * @returns {string}
 */
export const generateImprovementPrompt = (currentMenu) => {
  return `${SYSTEM_PROMPT}

Analyze this existing orbit menu and suggest improvements:

${JSON.stringify(currentMenu, null, 2)}

Provide suggestions for:
1. Better label wording
2. Improved angle distribution
3. Better grouping/hierarchy
4. Additional items that might be missing
5. Items that could be removed or combined

Return the improved configuration in the same JSON format.`;
};

/**
 * Generate menu from URL/sitemap prompt
 * @param {Array} pages - List of pages from sitemap
 * @returns {string}
 */
export const generateFromSitemapPrompt = (pages) => {
  return `${SYSTEM_PROMPT}

Create an orbit menu based on this sitemap:

${pages.map(p => `- ${p.title || p.path}: ${p.path}`).join('\n')}

Organize these pages into a logical orbit menu structure with appropriate grouping and submenus.

Return the menu configuration in JSON format.`;
};

/**
 * Generate menu for specific industry/type
 * @param {string} industry - Industry type
 * @returns {string}
 */
export const generateIndustryMenuPrompt = (industry) => {
  const industryTemplates = {
    'e-commerce': 'Shop, Products, Categories, Cart, Account, Contact',
    'portfolio': 'Home, About, Projects, Skills, Contact, Blog',
    'restaurant': 'Menu, Reservations, About, Locations, Gallery, Contact',
    'agency': 'Services, Portfolio, Team, About, Blog, Contact',
    'blog': 'Home, Articles, Categories, About, Archive, Contact',
    'saas': 'Features, Pricing, Docs, Blog, Login, Sign Up',
  };

  const template = industryTemplates[industry.toLowerCase()] || 'Home, About, Services, Contact';

  return `${SYSTEM_PROMPT}

Create an orbit menu for a ${industry} website.

Typical sections for this industry: ${template}

Create a professional, intuitive menu structure optimized for this industry.

Return the menu configuration in JSON format.`;
};

/**
 * Generate accessible menu prompt
 * @param {string} userDescription
 * @returns {string}
 */
export const generateAccessibleMenuPrompt = (userDescription) => {
  return `${SYSTEM_PROMPT}

Create an orbit menu with STRONG focus on accessibility:

User Description: "${userDescription}"

Additional accessibility requirements:
- Clear, descriptive labels
- Logical tab order
- Descriptive tooltips
- ARIA-friendly structure
- Keyboard navigation friendly

Return the menu configuration with enhanced accessibility features.`;
};

export default {
  SYSTEM_PROMPT,
  generateMenuPrompt,
  generateImprovementPrompt,
  generateFromSitemapPrompt,
  generateIndustryMenuPrompt,
  generateAccessibleMenuPrompt,
};
