# CommercePOS Plugin Developer Guide

Complete guide for developers to create, build, test, and publish plugins for CommercePOS.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Installation](#installation)
3. [Creating Your First Plugin](#creating-your-first-plugin)
4. [Plugin Structure](#plugin-structure)
5. [Development Workflow](#development-workflow)
6. [POS SDK Reference](#pos-sdk-reference)
7. [UI Components](#ui-components)
8. [Testing Your Plugin](#testing-your-plugin)
9. [Building for Production](#building-for-production)
10. [Publishing Your Plugin](#publishing-your-plugin)
11. [Best Practices](#best-practices)
12. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Prerequisites

Before you begin, ensure you have:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Text Editor** (VS Code recommended)
- Basic knowledge of **HTML, CSS, and JavaScript**

### What You Can Build

CommercePOS plugins can:
- Add new features to the POS system
- Integrate with payment gateways
- Create custom reports and analytics
- Connect to third-party services
- Extend checkout functionality
- Add utility tools for staff

---

## Installation

### Step 1: Navigate to CLI Directory

```bash
cd /path/to/pos/tools/plugin-cli
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Link CLI Globally (Optional)

```bash
npm link
```

This makes `cpos-plugin` command available system-wide.

### Step 4: Verify Installation

```bash
cpos-plugin --version
```

Or if not linked globally:

```bash
node bin/cpos-plugin.js --version
```

---

## Creating Your First Plugin

### Quick Start

```bash
# Create a basic plugin
cpos-plugin create my-first-plugin

# Navigate to plugin directory
cd my-first-plugin

# Start development server
cpos-plugin serve

# Open http://localhost:3000 in your browser
```

### Using Templates

The CLI provides templates for common plugin types:

```bash
# Basic plugin (default)
cpos-plugin create my-plugin

# Payment integration plugin
cpos-plugin create razorpay-payment --template payment

# Report/Analytics plugin
cpos-plugin create sales-report --template report
```

### Template Comparison

| Template | Use Case | Includes |
|----------|----------|----------|
| `basic` | General purpose | Basic HTML/CSS/JS structure |
| `payment` | Payment gateways | Payment handler, transaction UI |
| `report` | Reports & Analytics | Chart templates, data processing |

---

## Plugin Structure

After creating a plugin, you'll have this structure:

```
my-plugin/
├── index.html          # Main entry point (required)
├── styles.css          # Plugin styles
├── main.js             # Main JavaScript logic
├── manifest.json       # Plugin configuration (required)
├── README.md           # Plugin documentation
├── assets/
│   ├── images/         # Image files
│   └── icons/          # Plugin icons
└── lib/
    ├── pos-sdk.js      # POS SDK for app communication
    └── pos-ui.css      # POS UI component library
```

### manifest.json Explained

```json
{
  "name": "My Plugin",           // Display name
  "id": "my-plugin",             // Unique identifier (lowercase, no spaces)
  "version": "1.0.0",            // Semantic version
  "description": "Description",   // Brief description
  "author": "Your Name",         // Developer name
  "email": "you@email.com",      // Support email
  "homepage": "https://...",     // Plugin website
  "license": "MIT",              // License type
  "minPosVersion": "1.0.0",      // Minimum POS version required
  "entryPoint": "index.html",    // Main HTML file
  "icon": "assets/icons/icon.png", // Plugin icon (256x256 PNG)
  "category": "utility",         // Category for store listing
  "permissions": [               // Required permissions
    "orders",
    "products"
  ],
  "settings": [                  // User-configurable settings
    {
      "key": "apiKey",
      "label": "API Key",
      "type": "password",
      "required": true
    }
  ]
}
```

### Available Permissions

| Permission | Description | When to Use |
|------------|-------------|-------------|
| `orders` | Access order data | Order management, reports |
| `products` | Access product/inventory | Product display, stock check |
| `customers` | Access customer data | Customer lookup, loyalty |
| `payments` | Process payments | Payment integrations |
| `reports` | Generate reports | Analytics, reporting |
| `settings` | Modify POS settings | Configuration plugins |
| `staff` | Access staff info | Staff management |
| `printer` | Use receipt printer | Custom receipts |
| `cashDrawer` | Control cash drawer | Cash management |
| `notifications` | Show notifications | Alerts, reminders |
| `storage` | Local data storage | Offline data |
| `network` | External API calls | Third-party integrations |

### Categories

- `payment` - Payment gateway integrations
- `report` - Reports and analytics
- `integration` - Third-party service integrations
- `utility` - Utility tools
- `other` - Other plugins

---

## Development Workflow

### 1. Start Development Server

```bash
cpos-plugin serve
```

Options:
```bash
cpos-plugin serve --port 8080        # Custom port
cpos-plugin serve --host 0.0.0.0     # Allow external access
```

### 2. Edit Your Files

The development server supports **hot reload** - changes are reflected instantly in the browser.

**index.html** - Your plugin's UI:
```html
<!DOCTYPE html>
<html>
<head>
  <title>My Plugin</title>
  <link rel="stylesheet" href="lib/pos-ui.css">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="pos-card">
    <h1>My Plugin</h1>
    <button class="pos-btn pos-btn-primary" onclick="doSomething()">
      Click Me
    </button>
  </div>

  <script src="lib/pos-sdk.js"></script>
  <script src="main.js"></script>
</body>
</html>
```

**main.js** - Your plugin's logic:
```javascript
// Wait for SDK to be ready
async function init() {
  await POS_SDK.ready();
  console.log('Plugin initialized!');

  // Get current order
  const order = await POS_SDK.getCurrentOrder();
  console.log('Current order:', order);
}

function doSomething() {
  POS_SDK.showToast({
    message: 'Button clicked!',
    type: 'success'
  });
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', init);
```

### 3. Test in Browser

Open `http://localhost:3000` to see your plugin. The SDK runs in **development mode** with mock data.

### 4. Test in POS App

1. Build your plugin: `cpos-plugin build`
2. Package it: `cpos-plugin package`
3. Install in CommercePOS app (Settings > Plugins > Install)

---

## POS SDK Reference

The POS SDK (`lib/pos-sdk.js`) bridges your plugin with the CommercePOS app.

### Initialization

```javascript
// Always wait for SDK to be ready first
await POS_SDK.ready();
```

### Orders & Cart

```javascript
// Get current order
const order = await POS_SDK.getCurrentOrder();
// Returns: { orderNumber, items, total, status, customer }

// Get shopping cart
const cart = await POS_SDK.getCart();
// Returns: { items, subtotal, tax, total }

// Add item to cart
await POS_SDK.addToCart({
  productId: 'PROD-001',
  name: 'Product Name',
  price: 299.99,
  quantity: 2
});

// Remove item
await POS_SDK.removeFromCart('item-id');

// Update quantity
await POS_SDK.updateCartItemQuantity('item-id', 5);
```

### Products

```javascript
// Get all products
const products = await POS_SDK.getProducts();

// With filters
const filtered = await POS_SDK.getProducts({
  category: 'electronics',
  limit: 50,
  offset: 0
});

// Search products
const results = await POS_SDK.searchProducts('laptop');

// Get categories
const categories = await POS_SDK.getCategories();
```

### Customers

```javascript
// Get current customer
const customer = await POS_SDK.getCustomer();

// Set customer for order
await POS_SDK.setCustomer({
  id: 'CUST-001',
  name: 'John Doe',
  phone: '+91 9876543210',
  email: 'john@example.com'
});
```

### Payments

```javascript
// Process payment
const result = await POS_SDK.processPayment(1500.00, {
  method: 'card',      // card, cash, upi
  orderId: 'ORD-001'
});

if (result.success) {
  console.log('Transaction ID:', result.transactionId);
} else {
  console.log('Payment failed:', result.error);
}
```

### Notifications

```javascript
// Show toast notification
POS_SDK.showToast({
  message: 'Order saved successfully!',
  type: 'success',    // success, error, warning, info
  duration: 3000      // milliseconds
});

// Show dialog
const result = await POS_SDK.showDialog({
  title: 'Confirm Action',
  message: 'Are you sure you want to proceed?',
  buttons: ['Cancel', 'Confirm']
});
// result = index of clicked button (0 or 1)
```

### Hardware

```javascript
// Print receipt
await POS_SDK.printReceipt({
  orderId: 'ORD-001',
  items: [...],
  total: 1500.00,
  paymentMethod: 'Cash'
});

// Open cash drawer
await POS_SDK.openCashDrawer();
```

### Settings & Storage

```javascript
// Get plugin settings (configured by user)
const settings = await POS_SDK.getSettings();
const apiKey = settings.apiKey;

// Save plugin settings
await POS_SDK.saveSettings({
  apiKey: 'new-key',
  enabled: true
});
```

### Events

```javascript
// Listen for order updates
POS_SDK.on('orderUpdated', (order) => {
  console.log('Order updated:', order);
  updateUI(order);
});

// Listen for cart changes
POS_SDK.on('cartChanged', (cart) => {
  console.log('Cart changed:', cart);
});

// Listen for customer changes
POS_SDK.on('customerChanged', (customer) => {
  console.log('Customer:', customer);
});

// Remove listener
POS_SDK.off('orderUpdated', myHandler);
```

### HTTP Requests

```javascript
// Make external API calls (requires 'network' permission)
const response = await POS_SDK.httpRequest({
  url: 'https://api.example.com/data',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token'
  },
  body: JSON.stringify({ key: 'value' })
});
```

### Navigation

```javascript
// Navigate to POS screen
await POS_SDK.navigateTo('orders');
await POS_SDK.navigateTo('products', { category: 'electronics' });

// Close plugin
await POS_SDK.close();
```

### Store & Staff Info

```javascript
// Get store information
const store = await POS_SDK.getStoreInfo();
// Returns: { name, address, phone, email, currency }

// Get current staff info
const staff = await POS_SDK.getStaffInfo();
// Returns: { id, name, role, permissions }
```

---

## UI Components

Use the POS UI library (`lib/pos-ui.css`) for consistent styling.

### Buttons

```html
<button class="pos-btn pos-btn-primary">Primary</button>
<button class="pos-btn pos-btn-secondary">Secondary</button>
<button class="pos-btn pos-btn-success">Success</button>
<button class="pos-btn pos-btn-danger">Danger</button>
<button class="pos-btn pos-btn-outline">Outline</button>

<!-- Sizes -->
<button class="pos-btn pos-btn-primary pos-btn-sm">Small</button>
<button class="pos-btn pos-btn-primary pos-btn-lg">Large</button>
<button class="pos-btn pos-btn-primary pos-btn-block">Full Width</button>
```

### Cards

```html
<div class="pos-card">
  <h2 class="pos-card-title">Title</h2>
  <p class="pos-text">Content</p>
</div>

<div class="pos-card pos-card-success">Success card</div>
<div class="pos-card pos-card-warning">Warning card</div>
<div class="pos-card pos-card-danger">Danger card</div>
```

### Forms

```html
<div class="pos-form-group">
  <label class="pos-label">Email</label>
  <input type="email" class="pos-input" placeholder="Enter email">
</div>

<select class="pos-input pos-select">
  <option>Option 1</option>
  <option>Option 2</option>
</select>

<textarea class="pos-input pos-textarea"></textarea>
```

### Tables

```html
<table class="pos-table">
  <thead>
    <tr>
      <th>Product</th>
      <th>Price</th>
      <th>Qty</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Item 1</td>
      <td>₹100</td>
      <td>2</td>
    </tr>
  </tbody>
</table>
```

### Badges

```html
<span class="pos-badge pos-badge-success">Active</span>
<span class="pos-badge pos-badge-warning">Pending</span>
<span class="pos-badge pos-badge-danger">Failed</span>
```

### Alerts

```html
<div class="pos-alert pos-alert-success">Success message</div>
<div class="pos-alert pos-alert-warning">Warning message</div>
<div class="pos-alert pos-alert-danger">Error message</div>
```

### Loading States

```html
<!-- Spinner -->
<div class="pos-spinner"></div>
<div class="pos-spinner pos-spinner-lg"></div>

<!-- Skeleton loader -->
<div class="pos-skeleton pos-skeleton-title"></div>
<div class="pos-skeleton pos-skeleton-text"></div>
```

### Layout

```html
<!-- Grid -->
<div class="pos-grid pos-grid-2">
  <div>Column 1</div>
  <div>Column 2</div>
</div>

<!-- Flex -->
<div class="pos-flex pos-items-center pos-justify-between">
  <span>Left</span>
  <span>Right</span>
</div>
```

---

## Testing Your Plugin

### Browser Testing

1. Run `cpos-plugin serve`
2. Open `http://localhost:3000`
3. SDK provides mock data in development mode

### Testing in POS App

1. Build: `cpos-plugin build`
2. Package: `cpos-plugin package`
3. Transfer `.cposplugin` file to device
4. Install via Settings > Plugins > Install Plugin

### Debug Tips

```javascript
// Enable verbose logging
console.log('[MyPlugin] Debug:', data);

// Check if running in POS or browser
if (window.POSBridge) {
  console.log('Running in POS app');
} else {
  console.log('Running in browser (dev mode)');
}
```

---

## Building for Production

### Build Command

```bash
cpos-plugin build
```

This creates a `dist/` folder with optimized files:
- Minified HTML, CSS, JavaScript
- Copied assets
- Production manifest

### Build Options

```bash
# Custom output directory
cpos-plugin build --output ./release

# Without minification (for debugging)
cpos-plugin build --minify false
```

### Package for Distribution

```bash
cpos-plugin package
```

Creates:
- `my-plugin-1.0.0.cposplugin` - Plugin package file
- `my-plugin-1.0.0.json` - Package metadata

### Package Options

```bash
# Custom output filename
cpos-plugin package --output my-awesome-plugin.cposplugin
```

---

## Publishing Your Plugin

### Option 1: Direct Distribution

Share your `.cposplugin` file directly:
1. Email to customers
2. Host on your website
3. Share via cloud storage

Users install by:
1. Opening CommercePOS app
2. Going to Settings > Plugins
3. Tapping "Install Plugin"
4. Selecting the `.cposplugin` file

### Option 2: CommercePOS Plugin Store (Coming Soon)

Submit your plugin to the official store:

1. **Prepare Your Plugin**
   - Ensure manifest.json is complete
   - Add clear description
   - Include screenshots
   - Test thoroughly

2. **Create Developer Account**
   - Visit developer.commercepos.com
   - Register as a developer
   - Verify your email

3. **Submit Plugin**
   - Upload `.cposplugin` file
   - Add store listing details:
     - Title & description
     - Screenshots (min 3)
     - Category
     - Pricing (Free or Paid)
   - Submit for review

4. **Review Process**
   - Security review
   - Functionality testing
   - Content guidelines check
   - Typically 2-5 business days

5. **After Approval**
   - Plugin appears in store
   - Users can discover and install
   - You receive analytics

### Plugin Store Guidelines

**Required:**
- Clear, accurate description
- Working functionality
- No malicious code
- Respect user privacy
- Handle errors gracefully

**Recommended:**
- Responsive design
- Offline support where possible
- Localization support
- User documentation

**Prohibited:**
- Collecting data without consent
- Interfering with other plugins
- Unauthorized network requests
- Misleading functionality

---

## Best Practices

### Code Quality

```javascript
// Use async/await properly
async function loadData() {
  try {
    await POS_SDK.ready();
    const data = await POS_SDK.getCurrentOrder();
    updateUI(data);
  } catch (error) {
    console.error('Error:', error);
    showError('Failed to load data');
  }
}

// Clean up event listeners
const handler = (data) => updateUI(data);
POS_SDK.on('orderUpdated', handler);

// When plugin closes
function cleanup() {
  POS_SDK.off('orderUpdated', handler);
}
```

### Performance

- Minimize external requests
- Use efficient DOM updates
- Lazy load heavy resources
- Cache data when appropriate

### User Experience

- Show loading states
- Provide error feedback
- Support keyboard navigation
- Make buttons large enough for touch

### Security

- Never store sensitive data in localStorage
- Validate all inputs
- Use HTTPS for external requests
- Request only needed permissions

---

## Troubleshooting

### Common Issues

**"cpos-plugin" command not found**
```bash
# Use npx
npx cpos-plugin create my-plugin

# Or run directly
node /path/to/plugin-cli/bin/cpos-plugin.js create my-plugin
```

**Port already in use**
```bash
cpos-plugin serve --port 3001
```

**Plugin not loading in POS app**
- Check manifest.json syntax
- Verify entryPoint file exists
- Check minPosVersion compatibility
- Look at POS app logs

**SDK methods returning null**
- Ensure `await POS_SDK.ready()` is called first
- Check if permission is granted in manifest
- Verify you're not in dev mode for real data

**Styles not applying**
- Check CSS file path in HTML
- Verify pos-ui.css is included
- Check for CSS specificity conflicts

### Getting Help

- GitHub Issues: [github.com/commercepos/plugin-cli](https://github.com/commercepos/plugin-cli)
- Developer Forum: [community.commercepos.com](https://community.commercepos.com)
- Email: developer-support@commercepos.com

---

## Version History

| Version | Changes |
|---------|---------|
| 1.0.0 | Initial release |

---

## License

MIT License - See LICENSE file for details.

---

**Happy Plugin Development!** 🚀
