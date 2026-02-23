# 🤖 Orbify AI - Premium AI Features

AI-powered orbit menu generation and optimization.

## 🎯 Features

### 1. AI Menu Generator
Generate complete menu structures from natural language descriptions.

```javascript
import { generateMenuFromDescription } from './services/menuGenerator';

const result = await generateMenuFromDescription(
  "Create a professional portfolio menu with projects, about, and contact sections"
);

console.log(result.menu);
// {
//   menuItems: [...],
//   submenus: {...},
//   suggestions: {...}
// }
```

### 2. Industry Templates
Quick menu generation for specific industries.

```javascript
import { generateIndustryMenu } from './services/menuGenerator';

const menu = await generateIndustryMenu('e-commerce');
// Generates: Shop, Products, Cart, Account, etc.
```

### 3. Menu Improvement Suggestions
AI analyzes and suggests improvements to existing menus.

```javascript
import { improveExistingMenu } from './services/menuGenerator';

const improved = await improveExistingMenu(currentMenu);
console.log(improved.improvements);
```

### 4. Sitemap Import
Generate menu from website sitemap.

```javascript
import { generateFromSitemap } from './services/menuGenerator';

const pages = [
  { title: 'Home', path: '/' },
  { title: 'About', path: '/about' },
  // ...
];

const menu = await generateFromSitemap(pages);
```

## 🔐 License & Feature Gating

### Check AI Access

```javascript
import { hasAIAccess, canUseAIGeneration } from './services/licenseService';

if (await canUseAIGeneration()) {
  // User can generate menus
} else {
  // Show upgrade prompt
}
```

### Get Current Tier

```javascript
import { getCurrentTier, getTierFeatures } from './services/licenseService';

const tier = getCurrentTier(); // 'free' | 'pro' | 'ai' | 'enterprise'
const features = getTierFeatures(tier);

console.log(features.limits.aiGenerations); // 50 for AI tier
```

## 🚀 Setup

### Environment Variables

Create `.env.local`:

```bash
# Anthropic Claude API
REACT_APP_AI_API_KEY=sk-ant-xxx
REACT_APP_AI_MODEL=claude-3-5-sonnet-20241022
REACT_APP_AI_ENDPOINT=https://api.anthropic.com/v1/messages

# Or OpenAI
# REACT_APP_AI_PROVIDER=openai
# REACT_APP_AI_API_KEY=sk-xxx
# REACT_APP_AI_MODEL=gpt-4
```

### Development Mode

For development, set a mock license:

```javascript
import { setMockLicense } from './services/licenseService';

// Set AI tier license for development
setMockLicense('ai');
```

## 📦 Components

### AIAssistantPanel

```jsx
import AIAssistantPanel from './components/AIAssistantPanel';

<AIAssistantPanel
  onMenuGenerated={(menu) => {
    console.log('Generated menu:', menu);
  }}
/>
```

### UpgradePrompt

```jsx
import UpgradePrompt from './components/UpgradePrompt';

{!hasAIAccess() && (
  <UpgradePrompt
    feature="AI Menu Generator"
    tier="ai"
  />
)}
```

## 🎨 Usage Examples

### Basic Generation

```javascript
const result = await generateMenuFromDescription(
  "Modern tech startup with features, pricing, docs, and blog"
);

if (result.success) {
  setMenuItems(result.menu.menuItems);
}
```

### With Options

```javascript
const result = await generateMenuFromDescription(
  "E-commerce store",
  {
    websiteType: 'e-commerce',
    maxItems: 6,
    includeSubmenus: true,
    existingPages: ['/shop', '/cart', '/account']
  }
);
```

### Industry Template

```javascript
// Quick generation for common industries
const industries = ['portfolio', 'restaurant', 'saas', 'blog'];

for (const industry of industries) {
  const menu = await generateIndustryMenu(industry);
  console.log(`${industry} menu:`, menu);
}
```

## 🔧 API Reference

### `generateMenuFromDescription(description, options)`
- **description** (string): Natural language menu description
- **options** (object):
  - `websiteType` (string): Type of website
  - `maxItems` (number): Max menu items
  - `includeSubmenus` (boolean): Include submenus
  - `existingPages` (array): Existing pages to include

### `improveExistingMenu(currentMenu)`
- **currentMenu** (object): Current menu configuration
- Returns improved menu with suggestions

### `generateIndustryMenu(industry)`
- **industry** (string): Industry type (e.g., 'e-commerce', 'portfolio')
- Returns industry-optimized menu

### `generateFromSitemap(pages)`
- **pages** (array): Array of page objects with `title` and `path`
- Returns menu generated from sitemap

## 💰 Pricing & Limits

| Tier | AI Generations/Month | Price |
|------|---------------------|-------|
| Free | 0 | $0 |
| Pro | 0 | $29 |
| AI | 50 | $79 |
| Enterprise | Unlimited | Custom |

## 🎯 Prompt Engineering Tips

The AI works best with:

1. **Clear descriptions**: "Portfolio site with home, projects, about, contact"
2. **Context**: "Tech startup SaaS with features, pricing, docs"
3. **Specific pages**: Include exact page names you want
4. **Structure hints**: "Group products into categories submenu"

Examples:

```javascript
// ✅ Good
"Professional photography portfolio with galleries organized by category,
about me section, pricing packages, and contact form"

// ❌ Too vague
"Make me a website menu"

// ✅ Good
"E-commerce fashion store: Shop (submenu: Women, Men, Kids),
New Arrivals, Sale, My Account"

// ❌ Missing details
"Online shop"
```

## 🐛 Troubleshooting

### AI Not Available

```javascript
import { isAIConfigured } from './services/aiService';

if (!isAIConfigured()) {
  console.error('AI service not configured. Check API keys.');
}
```

### Quota Exceeded

```javascript
import { getRemainingAIGenerations } from './services/licenseService';

const remaining = await getRemainingAIGenerations();
if (remaining === 0) {
  // Show upgrade prompt
}
```

### Invalid Response

The service automatically tries to parse and fix common issues.
If generation fails, check the error:

```javascript
const result = await generateMenuFromDescription("...");

if (!result.success) {
  console.error('Generation failed:', result.error);
}
```

## 🔮 Future Features

- **AI Color Palette Generator**
- **AI Animation Optimizer**
- **Smart A/B Testing Suggestions**
- **Accessibility AI Checker**
- **Multi-language Menu Translation**
- **Voice-to-Menu Generation**

## 📚 Related Files

- Core Config: `../orbify-core/config/`
- Core Utils: `../orbify-core/utils/`
- Basic Version: `../orbify-basic/`
- Main App Integration: See migration guide

---

**Built with ❤️ for Orbify**
