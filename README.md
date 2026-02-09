# CommercePOS Plugin CLI

A command-line tool for creating and building plugins for CommercePOS. Build plugins using HTML, CSS, and JavaScript that integrate seamlessly with the POS app via WebView.

## Installation

### From npm (Recommended)

```bash
# Install globally
npm install -g cpos-plugin-cli

# Verify installation
cpos-plugin --version
```

### Using npx (No Installation)

```bash
# Run without installing
npx cpos-plugin-cli create my-plugin
```

### From GitHub Packages (Enterprise)

```bash
# Install from GitHub Packages
npm install -g @withcommmerce/pos-cli --registry=https://npm.pkg.github.com
```

### From Source

```bash
# Clone the repository
git clone https://github.com/withcommmerce/commmerce-pos-cli.git
cd commmerce-pos-cli

# Install dependencies
npm install

# Link globally
npm link
```

## Quick Start

```bash
# Create a new plugin
cpos-plugin create my-awesome-plugin

# Navigate to plugin directory
cd my-awesome-plugin

# Start development server
cpos-plugin serve

# Build for production
cpos-plugin build

# Package for distribution
cpos-plugin package
```

## Commands

### `cpos-plugin create <plugin-name>`

Creates a new plugin project with all necessary files.

**Options:**
| Option | Description | Default |
|--------|-------------|---------|
| `-t, --template <template>` | Template to use (basic, payment, report) | `basic` |
| `-d, --directory <dir>` | Directory to create plugin in | `.` |

**Examples:**
```bash
# Create basic plugin
cpos-plugin create my-plugin

# Create payment integration plugin
cpos-plugin create razorpay-gateway --template payment

# Create custom report plugin
cpos-plugin create sales-analytics --template report

# Create in specific directory
cpos-plugin create my-plugin --directory ./plugins
```

**Templates:**

| Template | Description | Use Case |
|----------|-------------|----------|
| `basic` | Simple plugin structure | General purpose plugins |
| `payment` | Payment gateway integration | Razorpay, Stripe, PayTM, etc. |
| `report` | Custom reporting | Sales reports, analytics |

---

### `cpos-plugin serve`

Starts a development server with hot reload.

**Options:**
| Option | Description | Default |
|--------|-------------|---------|
| `-p, --port <port>` | Port to run server on | `3000` |
| `--host <host>` | Host to bind to | `localhost` |

**Examples:**
```bash
# Start on default port
cpos-plugin serve

# Start on custom port
cpos-plugin serve --port 8080

# Bind to all interfaces
cpos-plugin serve --host 0.0.0.0
```

**Features:**
- Auto-refresh on file changes
- Live reload in browser
- Development mode mock data

---

### `cpos-plugin build`

Builds the plugin for production.

**Options:**
| Option | Description | Default |
|--------|-------------|---------|
| `-o, --output <dir>` | Output directory | `dist` |
| `--minify` | Minify output files | `true` |

**Examples:**
```bash
# Build with defaults
cpos-plugin build

# Build to custom directory
cpos-plugin build --output ./release

# Build without minification
cpos-plugin build --minify false
```

**Build process:**
1. Cleans output directory
2. Processes and minifies HTML
3. Processes and minifies CSS
4. Processes and minifies JavaScript
5. Copies assets
6. Creates production manifest

---

### `cpos-plugin package`

Packages the plugin as a `.cposplugin` file for distribution.

**Options:**
| Option | Description | Default |
|--------|-------------|---------|
| `-o, --output <file>` | Output file name | `<plugin-id>-<version>.cposplugin` |

**Examples:**
```bash
# Package with auto-generated name
cpos-plugin package

# Package with custom name
cpos-plugin package --output my-plugin-v1.cposplugin
```

**Output files:**
- `<plugin-name>-<version>.cposplugin` - Plugin package (ZIP)
- `<plugin-name>-<version>.json` - Package metadata

---

## Plugin Structure

```
my-plugin/
├── index.html          # Main entry point
├── styles.css          # Plugin styles
├── main.js             # Main JavaScript
├── manifest.json       # Plugin configuration
├── README.md           # Plugin documentation
├── assets/
│   ├── images/         # Image files
│   └── icons/          # Plugin icons
└── lib/
    ├── pos-sdk.js      # POS SDK bridge
    └── pos-ui.css      # POS UI components
```

---

## Manifest Configuration

The `manifest.json` file configures your plugin:

```json
{
  "name": "My Plugin",
  "id": "my-plugin",
  "version": "1.0.0",
  "description": "A great plugin for CommercePOS",
  "author": "Your Name",
  "email": "your@email.com",
  "homepage": "https://yoursite.com",
  "license": "MIT",
  "minPosVersion": "1.0.0",
  "entryPoint": "index.html",
  "icon": "assets/icons/plugin-icon.png",
  "category": "utility",
  "permissions": [
    "orders",
    "products",
    "payments"
  ],
  "settings": [
    {
      "key": "apiKey",
      "label": "API Key",
      "type": "password",
      "required": true
    }
  ]
}
```

**Available Permissions:**

| Permission | Description |
|------------|-------------|
| `orders` | Access and manage orders |
| `products` | Access products and inventory |
| `customers` | Access customer data |
| `payments` | Process payments and refunds |
| `reports` | Generate and view reports |
| `settings` | Modify POS settings |
| `staff` | Access staff information |
| `printer` | Use receipt printer |
| `cashDrawer` | Control cash drawer |
| `notifications` | Show notifications |
| `storage` | Store data locally |
| `network` | Make external requests |

**Categories:**
- `payment` - Payment integrations
- `report` - Reports and analytics
- `integration` - Third-party integrations
- `utility` - Utility tools
- `other` - Other plugins

---

## POS SDK

The POS SDK (`lib/pos-sdk.js`) provides communication between your plugin and CommercePOS.

### Initialization

```javascript
// Wait for SDK to be ready
await POS_SDK.ready();

// Check if connected
if (POS_SDK._ready) {
  console.log('Connected to POS!');
}
```

### Orders & Cart

```javascript
// Get current order
const order = await POS_SDK.getCurrentOrder();

// Get shopping cart
const cart = await POS_SDK.getCart();

// Add item to cart
await POS_SDK.addToCart({
  productId: 'PROD-001',
  quantity: 2,
  price: 99.99
});

// Remove item from cart
await POS_SDK.removeFromCart('item-id');

// Update quantity
await POS_SDK.updateCartItemQuantity('item-id', 5);
```

### Products

```javascript
// Get all products
const products = await POS_SDK.getProducts();

// Get products with filters
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
  phone: '+91 9876543210'
});
```

### Payments

```javascript
// Process payment
const result = await POS_SDK.processPayment(1500.00, {
  method: 'card',
  orderId: 'ORD-001'
});

if (result.success) {
  console.log('Payment successful:', result.transactionId);
}
```

### Notifications

```javascript
// Show toast notification
POS_SDK.showToast({
  message: 'Order saved successfully!',
  type: 'success',  // success, error, warning, info
  duration: 3000
});

// Show dialog
const result = await POS_SDK.showDialog({
  title: 'Confirm Action',
  message: 'Are you sure you want to proceed?',
  buttons: ['Cancel', 'Confirm']
});
```

### Hardware

```javascript
// Print receipt
await POS_SDK.printReceipt({
  orderId: 'ORD-001',
  items: [...],
  total: 1500.00
});

// Open cash drawer
await POS_SDK.openCashDrawer();
```

### Navigation

```javascript
// Navigate to POS screen
await POS_SDK.navigateTo('orders', { filter: 'pending' });

// Close plugin
await POS_SDK.close();
```

### Settings

```javascript
// Get plugin settings
const settings = await POS_SDK.getSettings();

// Save settings
await POS_SDK.saveSettings({
  apiKey: 'xxx-xxx-xxx',
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
  console.log('Customer changed:', customer);
});

// Remove listener
POS_SDK.off('orderUpdated', myHandler);
```

### HTTP Requests

```javascript
// Make HTTP request via POS proxy
const response = await POS_SDK.httpRequest({
  url: 'https://api.example.com/data',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ key: 'value' })
});
```

### Store & Staff Info

```javascript
// Get store information
const store = await POS_SDK.getStoreInfo();

// Get current staff info
const staff = await POS_SDK.getStaffInfo();
```

### Analytics

```javascript
// Log custom event
await POS_SDK.logEvent('button_clicked', {
  button: 'checkout',
  value: 1500
});
```

---

## POS UI Components

Use the POS UI library (`lib/pos-ui.css`) to match CommercePOS design.

### Cards

```html
<div class="pos-card">
  <h2 class="pos-card-title">Card Title</h2>
  <p class="pos-text">Card content goes here.</p>
</div>

<div class="pos-card pos-card-success">
  <h3 class="pos-card-subtitle">Success Card</h3>
</div>
```

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

### Forms

```html
<div class="pos-form-group">
  <label class="pos-label">Email</label>
  <input type="email" class="pos-input" placeholder="Enter email">
</div>

<div class="pos-form-group">
  <label class="pos-label">Message</label>
  <textarea class="pos-input pos-textarea"></textarea>
</div>

<select class="pos-input pos-select">
  <option>Option 1</option>
  <option>Option 2</option>
</select>
```

### Badges

```html
<span class="pos-badge pos-badge-success">Active</span>
<span class="pos-badge pos-badge-warning">Pending</span>
<span class="pos-badge pos-badge-danger">Failed</span>
```

### Alerts

```html
<div class="pos-alert pos-alert-success">Success message!</div>
<div class="pos-alert pos-alert-warning">Warning message!</div>
<div class="pos-alert pos-alert-danger">Error message!</div>
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

### Loading States

```html
<!-- Spinner -->
<div class="pos-spinner"></div>
<div class="pos-spinner pos-spinner-lg"></div>

<!-- Skeleton -->
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

## Development Workflow

1. **Create plugin:**
   ```bash
   cpos-plugin create my-plugin
   cd my-plugin
   ```

2. **Start dev server:**
   ```bash
   cpos-plugin serve
   ```

3. **Edit files** - Changes auto-reload in browser

4. **Test in POS:**
   - Build: `cpos-plugin build`
   - Package: `cpos-plugin package`
   - Install in CommercePOS app

5. **Distribute:**
   - Share `.cposplugin` file
   - Users install via Settings > Plugins

---

## Troubleshooting

**Command not found after npm link:**
```bash
# Try with npx
npx cpos-plugin create my-plugin

# Or run directly
node ./bin/cpos-plugin.js create my-plugin
```

**Port already in use:**
```bash
cpos-plugin serve --port 3001
```

**Build fails:**
- Ensure you're in a plugin directory (has manifest.json)
- Check for syntax errors in HTML/CSS/JS

**Plugin not loading in POS:**
- Verify manifest.json is valid JSON
- Check minPosVersion compatibility
- Ensure entryPoint file exists

---

## Examples

### Basic Plugin

```javascript
// main.js
const Plugin = {
  async init() {
    await POS_SDK.ready();
    this.updateStatus('Connected');

    POS_SDK.on('cartChanged', (cart) => {
      this.updateCartDisplay(cart);
    });
  },

  updateStatus(status) {
    document.getElementById('status').textContent = status;
  },

  updateCartDisplay(cart) {
    const total = cart.items.reduce((sum, item) =>
      sum + (item.price * item.quantity), 0);
    document.getElementById('cart-total').textContent = `₹${total}`;
  }
};

document.addEventListener('DOMContentLoaded', () => Plugin.init());
```

### Payment Plugin

```javascript
// payment-handler.js
const PaymentGateway = {
  async processPayment(amount) {
    const order = await POS_SDK.getCurrentOrder();

    // Call your payment gateway API
    const result = await this.callGateway({
      amount,
      orderId: order.id,
      currency: 'INR'
    });

    if (result.success) {
      await POS_SDK.showToast({
        message: 'Payment successful!',
        type: 'success'
      });
    }

    return result;
  }
};
```

---

## Support

For issues and feature requests, create an issue at [github.com/withcommmerce/commmerce-pos-cli/issues](https://github.com/withcommmerce/commmerce-pos-cli/issues).
