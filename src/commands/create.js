/**
 * Create Command
 * Creates a new plugin project with the specified template
 */

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');
const inquirer = require('inquirer');

// Template configurations
const templates = {
  basic: {
    name: 'Basic Plugin',
    description: 'A simple plugin with basic structure',
    files: ['index.html', 'styles.css', 'main.js', 'manifest.json']
  },
  payment: {
    name: 'Payment Integration',
    description: 'Plugin template for payment gateway integration',
    files: ['index.html', 'styles.css', 'main.js', 'payment-handler.js', 'manifest.json']
  },
  report: {
    name: 'Report Plugin',
    description: 'Plugin template for custom reports',
    files: ['index.html', 'styles.css', 'main.js', 'report-generator.js', 'manifest.json']
  }
};

/**
 * Create a new plugin project
 */
async function createCommand(pluginName, options) {
  const spinner = ora();

  try {
    // Validate plugin name
    if (!pluginName || pluginName.trim() === '') {
      console.log(chalk.red('Error: Plugin name is required'));
      return;
    }

    // Sanitize plugin name
    const sanitizedName = pluginName.toLowerCase().replace(/[^a-z0-9-_]/g, '-');
    const template = options.template || 'basic';
    const targetDir = path.resolve(options.directory, sanitizedName);

    console.log(chalk.cyan(`\nCreating plugin: ${chalk.bold(pluginName)}`));
    console.log(chalk.gray(`Template: ${template}`));
    console.log(chalk.gray(`Location: ${targetDir}\n`));

    // Check if directory already exists
    if (await fs.pathExists(targetDir)) {
      const { overwrite } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'overwrite',
          message: `Directory ${sanitizedName} already exists. Overwrite?`,
          default: false
        }
      ]);

      if (!overwrite) {
        console.log(chalk.yellow('Operation cancelled'));
        return;
      }

      await fs.remove(targetDir);
    }

    // Create project directory
    spinner.start('Creating project structure...');
    await fs.ensureDir(targetDir);
    await fs.ensureDir(path.join(targetDir, 'assets'));
    await fs.ensureDir(path.join(targetDir, 'assets', 'images'));
    await fs.ensureDir(path.join(targetDir, 'assets', 'icons'));
    await fs.ensureDir(path.join(targetDir, 'lib'));
    spinner.succeed('Project structure created');

    // Create manifest.json
    spinner.start('Creating manifest...');
    const manifest = {
      name: pluginName,
      id: sanitizedName,
      version: '1.0.0',
      description: `${pluginName} plugin for CommercePOS`,
      author: '',
      homepage: '',
      minPosVersion: '1.0.0',
      permissions: [],
      entryPoint: 'index.html',
      icon: 'assets/icons/plugin-icon.png',
      template: template
    };
    await fs.writeJson(path.join(targetDir, 'manifest.json'), manifest, { spaces: 2 });
    spinner.succeed('Manifest created');

    // Create index.html
    spinner.start('Creating HTML entry point...');
    const htmlContent = generateHtmlTemplate(pluginName, template);
    await fs.writeFile(path.join(targetDir, 'index.html'), htmlContent);
    spinner.succeed('HTML entry point created');

    // Create styles.css
    spinner.start('Creating styles...');
    const cssContent = generateCssTemplate(template);
    await fs.writeFile(path.join(targetDir, 'styles.css'), cssContent);
    spinner.succeed('Styles created');

    // Create main.js
    spinner.start('Creating main script...');
    const jsContent = generateJsTemplate(pluginName, template);
    await fs.writeFile(path.join(targetDir, 'main.js'), jsContent);
    spinner.succeed('Main script created');

    // Create POS SDK bridge file
    spinner.start('Creating POS SDK bridge...');
    const sdkContent = generateSdkBridge();
    await fs.writeFile(path.join(targetDir, 'lib', 'pos-sdk.js'), sdkContent);
    spinner.succeed('POS SDK bridge created');

    // Copy POS UI component library
    spinner.start('Adding POS UI component library...');
    const posUiCssPath = path.join(__dirname, '..', 'templates', 'lib', 'pos-ui.css');
    if (await fs.pathExists(posUiCssPath)) {
      await fs.copy(posUiCssPath, path.join(targetDir, 'lib', 'pos-ui.css'));
    } else {
      // Generate inline if template not found
      const posUiCss = generatePosUiCss();
      await fs.writeFile(path.join(targetDir, 'lib', 'pos-ui.css'), posUiCss);
    }
    spinner.succeed('POS UI component library added');

    // Create template-specific files
    if (template === 'payment') {
      spinner.start('Creating payment handler...');
      const paymentContent = generatePaymentHandler();
      await fs.writeFile(path.join(targetDir, 'payment-handler.js'), paymentContent);
      spinner.succeed('Payment handler created');
    } else if (template === 'report') {
      spinner.start('Creating report generator...');
      const reportContent = generateReportGenerator();
      await fs.writeFile(path.join(targetDir, 'report-generator.js'), reportContent);
      spinner.succeed('Report generator created');
    }

    // Create README
    spinner.start('Creating documentation...');
    const readmeContent = generateReadme(pluginName, template);
    await fs.writeFile(path.join(targetDir, 'README.md'), readmeContent);
    spinner.succeed('Documentation created');

    // Success message
    console.log(chalk.green(`\n✓ Plugin "${pluginName}" created successfully!\n`));
    console.log(chalk.cyan('Next steps:'));
    console.log(chalk.gray(`  1. cd ${sanitizedName}`));
    console.log(chalk.gray('  2. Edit manifest.json with your plugin details'));
    console.log(chalk.gray('  3. Run: cpos-plugin serve'));
    console.log(chalk.gray('  4. When ready: cpos-plugin build && cpos-plugin package\n'));

  } catch (error) {
    spinner.fail('Failed to create plugin');
    console.error(chalk.red(`Error: ${error.message}`));
  }
}

/**
 * Generate HTML template
 */
function generateHtmlTemplate(pluginName, template) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pluginName}</title>
  <link rel="stylesheet" href="styles.css">
  <link rel="stylesheet" href="lib/pos-ui.css">
</head>
<body>
  <div id="plugin-root" class="pos-plugin-container">
    <!-- Header -->
    <div class="pos-header">
      <h1 class="pos-title">${pluginName}</h1>
    </div>

    <!-- Main Content -->
    <div class="pos-content">
      <div class="pos-card">
        <h2 class="pos-card-title">Welcome to ${pluginName}</h2>
        <p class="pos-text">Your plugin is ready to use. Start building amazing features!</p>

        <div class="pos-button-group">
          <button class="pos-btn pos-btn-primary" onclick="Plugin.showMessage()">
            Show Message
          </button>
          <button class="pos-btn pos-btn-secondary" onclick="Plugin.getData()">
            Get POS Data
          </button>
        </div>
      </div>

      <!-- Status Card -->
      <div class="pos-card pos-card-info">
        <h3 class="pos-card-subtitle">Plugin Status</h3>
        <div id="status-container">
          <p class="pos-text-muted">Initializing...</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Scripts -->
  <script src="lib/pos-sdk.js"></script>
  <script src="main.js"></script>
  ${template === 'payment' ? '<script src="payment-handler.js"></script>' : ''}
  ${template === 'report' ? '<script src="report-generator.js"></script>' : ''}
</body>
</html>`;
}

/**
 * Generate CSS template
 */
function generateCssTemplate(template) {
  return `/**
 * Plugin Styles
 * Extends the POS UI component library
 */

/* Plugin-specific variables */
:root {
  --plugin-primary: var(--pos-primary, #2196F3);
  --plugin-secondary: var(--pos-secondary, #607D8B);
  --plugin-success: var(--pos-success, #4CAF50);
  --plugin-warning: var(--pos-warning, #FF9800);
  --plugin-danger: var(--pos-danger, #F44336);
}

/* Plugin container */
.pos-plugin-container {
  min-height: 100vh;
  background: var(--pos-bg, #f5f5f5);
}

/* Custom header styling */
.pos-header {
  background: linear-gradient(135deg, var(--plugin-primary), var(--plugin-secondary));
  color: white;
  padding: 20px 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.pos-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

/* Content area */
.pos-content {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

/* Card styles */
.pos-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.pos-card-info {
  border-left: 4px solid var(--plugin-primary);
}

.pos-card-title {
  margin: 0 0 12px 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.pos-card-subtitle {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Text styles */
.pos-text {
  color: #555;
  line-height: 1.6;
  margin: 0 0 16px 0;
}

.pos-text-muted {
  color: #888;
  font-size: 14px;
}

/* Button group */
.pos-button-group {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

/* Button styles */
.pos-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pos-btn-primary {
  background: var(--plugin-primary);
  color: white;
}

.pos-btn-primary:hover {
  background: #1976D2;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
}

.pos-btn-secondary {
  background: #f0f0f0;
  color: #333;
}

.pos-btn-secondary:hover {
  background: #e0e0e0;
}

.pos-btn-success {
  background: var(--plugin-success);
  color: white;
}

.pos-btn-danger {
  background: var(--plugin-danger);
  color: white;
}

/* Status indicators */
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge.success {
  background: #E8F5E9;
  color: var(--plugin-success);
}

.status-badge.warning {
  background: #FFF3E0;
  color: var(--plugin-warning);
}

.status-badge.error {
  background: #FFEBEE;
  color: var(--plugin-danger);
}

/* Responsive design */
@media (max-width: 768px) {
  .pos-content {
    padding: 16px;
  }

  .pos-card {
    padding: 16px;
  }

  .pos-button-group {
    flex-direction: column;
  }

  .pos-btn {
    width: 100%;
  }
}
`;
}

/**
 * Generate JavaScript template
 */
function generateJsTemplate(pluginName, template) {
  return `/**
 * ${pluginName} - Main Plugin Script
 *
 * This is the main entry point for your plugin.
 * Use the POS SDK to communicate with the CommercePOS app.
 */

// Plugin namespace
const Plugin = {
  // Plugin state
  state: {
    initialized: false,
    posConnected: false,
    data: {}
  },

  /**
   * Initialize the plugin
   */
  async init() {
    console.log('[${pluginName}] Initializing...');

    try {
      // Wait for POS SDK to be ready
      await POS_SDK.ready();

      this.state.posConnected = true;
      this.state.initialized = true;

      // Get plugin info
      const pluginInfo = await POS_SDK.getPluginInfo();
      console.log('[${pluginName}] Plugin info:', pluginInfo);

      // Update status
      this.updateStatus('Connected to CommercePOS', 'success');

      // Register event listeners
      this.registerEventListeners();

      console.log('[${pluginName}] Initialized successfully');
    } catch (error) {
      console.error('[${pluginName}] Initialization failed:', error);
      this.updateStatus('Failed to connect', 'error');
    }
  },

  /**
   * Register POS event listeners
   */
  registerEventListeners() {
    // Listen for order updates
    POS_SDK.on('orderUpdated', (order) => {
      console.log('[${pluginName}] Order updated:', order);
      this.handleOrderUpdate(order);
    });

    // Listen for cart changes
    POS_SDK.on('cartChanged', (cart) => {
      console.log('[${pluginName}] Cart changed:', cart);
      this.handleCartChange(cart);
    });

    // Listen for POS events
    POS_SDK.on('posEvent', (event) => {
      console.log('[${pluginName}] POS event:', event);
    });
  },

  /**
   * Handle order updates
   */
  handleOrderUpdate(order) {
    // Override this method to handle order updates
    this.state.data.lastOrder = order;
  },

  /**
   * Handle cart changes
   */
  handleCartChange(cart) {
    // Override this method to handle cart changes
    this.state.data.currentCart = cart;
  },

  /**
   * Show a message (demo function)
   */
  showMessage() {
    POS_SDK.showToast({
      message: 'Hello from ${pluginName}!',
      type: 'success',
      duration: 3000
    });
  },

  /**
   * Get POS data (demo function)
   */
  async getData() {
    try {
      const data = await POS_SDK.getCurrentOrder();
      console.log('[${pluginName}] Current order:', data);

      if (data) {
        POS_SDK.showToast({
          message: \`Order: \${data.orderNumber || 'No active order'}\`,
          type: 'info'
        });
      } else {
        POS_SDK.showToast({
          message: 'No active order',
          type: 'info'
        });
      }
    } catch (error) {
      console.error('[${pluginName}] Failed to get data:', error);
      POS_SDK.showToast({
        message: 'Failed to get data',
        type: 'error'
      });
    }
  },

  /**
   * Update status display
   */
  updateStatus(message, type = 'info') {
    const container = document.getElementById('status-container');
    if (container) {
      container.innerHTML = \`
        <span class="status-badge \${type}">\${message}</span>
      \`;
    }
  }
};

// Initialize plugin when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  Plugin.init();
});
`;
}

/**
 * Generate POS SDK bridge
 */
function generateSdkBridge() {
  return `/**
 * POS SDK Bridge
 *
 * This SDK provides communication between your plugin and the CommercePOS app.
 * The methods are bridged to native Flutter code via WebView JavaScript channels.
 */

const POS_SDK = {
  // Event listeners
  _listeners: {},
  _ready: false,
  _readyPromise: null,

  /**
   * Wait for SDK to be ready
   */
  ready() {
    if (this._ready) {
      return Promise.resolve();
    }

    if (!this._readyPromise) {
      this._readyPromise = new Promise((resolve) => {
        // Check if running in POS WebView (native bridge is injected as window.POS)
        if (window.POS || window.flutter_inappwebview) {
          this._ready = true;
          console.log('[POS_SDK] Connected to CommercePOS');
          resolve();
        } else {
          // Development mode - simulate ready after short delay
          setTimeout(() => {
            this._ready = true;
            console.log('[POS_SDK] Running in development mode');
            resolve();
          }, 100);
        }
      });
    }

    return this._readyPromise;
  },

  /**
   * Register event listener
   */
  on(event, callback) {
    if (!this._listeners[event]) {
      this._listeners[event] = [];
    }
    this._listeners[event].push(callback);
  },

  /**
   * Remove event listener
   */
  off(event, callback) {
    if (this._listeners[event]) {
      this._listeners[event] = this._listeners[event].filter(cb => cb !== callback);
    }
  },

  /**
   * Emit event (called by POS app)
   */
  _emit(event, data) {
    if (this._listeners[event]) {
      this._listeners[event].forEach(callback => {
        try {
          callback(data);
        } catch (e) {
          console.error('[POS_SDK] Event handler error:', e);
        }
      });
    }
  },

  /**
   * Call native POS method
   */
  _callNative(method, params = {}) {
    return new Promise((resolve, reject) => {
      // Check for native POS bridge (injected by Flutter WebView)
      if (window.POS && typeof window.POS._call === 'function') {
        // Use the injected POS bridge
        window.POS._call(method, params)
          .then(result => {
            // Check for permission denied response
            if (result && result.error === 'Permission denied') {
              this._emit('permissionDenied', {
                method: method,
                permission: result.permission,
                message: result.message
              });
            }
            resolve(result);
          })
          .catch(reject);
      } else if (window.flutter_inappwebview) {
        // Fallback to direct InAppWebView handler
        window.flutter_inappwebview.callHandler('POS_BRIDGE', method, params || {})
          .then(result => {
            // Check for permission denied response
            if (result && result.error === 'Permission denied') {
              this._emit('permissionDenied', {
                method: method,
                permission: result.permission,
                message: result.message
              });
            }
            resolve(result);
          })
          .catch(reject);
      } else {
        // Development mode - return mock data
        console.log('[POS_SDK] Mock call:', method, params);
        resolve(this._getMockData(method, params));
      }
    });
  },

  /**
   * Check if a result indicates permission was denied
   * @param {Object} result - The API response
   * @returns {boolean}
   */
  isPermissionDenied(result) {
    return result && result.success === false && result.error === 'Permission denied';
  },

  /**
   * Get the required permission from a denied result
   * @param {Object} result - The API response
   * @returns {string|null}
   */
  getDeniedPermission(result) {
    if (this.isPermissionDenied(result)) {
      return result.permission || null;
    }
    return null;
  },

  /**
   * Get mock data for development
   */
  _getMockData(method, params) {
    const mockData = {
      getPluginInfo: {
        id: 'dev-plugin',
        name: 'Development Plugin',
        version: '1.0.0'
      },
      getCurrentOrder: {
        orderNumber: 'ORD-001',
        items: [],
        total: 0,
        status: 'pending'
      },
      getCart: {
        items: [],
        subtotal: 0,
        tax: 0,
        total: 0
      },
      getCustomer: null,
      getSettings: {},
      getDailySummary: {
        success: true,
        data: {
          totalSales: 12500,
          totalOrders: 15,
          avgOrder: 833,
          itemsSold: 42,
          hourlyData: [
            { hour: 9, label: '9AM', sales: 1500, orders: 2 },
            { hour: 10, label: '10AM', sales: 2200, orders: 3 },
            { hour: 11, label: '11AM', sales: 1800, orders: 2 },
            { hour: 12, label: '12PM', sales: 2500, orders: 4 },
            { hour: 13, label: '1PM', sales: 1500, orders: 2 },
            { hour: 14, label: '2PM', sales: 3000, orders: 2 }
          ],
          paymentMethods: [
            { name: 'Cash', icon: '💵', type: 'cash', amount: 5000, count: 6, percent: 40 },
            { name: 'Card', icon: '💳', type: 'card', amount: 4000, count: 5, percent: 32 },
            { name: 'UPI', icon: '📱', type: 'upi', amount: 2500, count: 3, percent: 20 },
            { name: 'Other', icon: '🔄', type: 'other', amount: 1000, count: 1, percent: 8 }
          ],
          topProducts: [
            { name: 'Product A', qty: 12, revenue: 3600 },
            { name: 'Product B', qty: 8, revenue: 2400 },
            { name: 'Product C', qty: 10, revenue: 2000 },
            { name: 'Product D', qty: 6, revenue: 1800 },
            { name: 'Product E', qty: 6, revenue: 1200 }
          ],
          recentOrders: [
            { id: 'ORD-015', time: '2:45 PM', amount: 850, status: 'completed' },
            { id: 'ORD-014', time: '2:20 PM', amount: 1200, status: 'completed' },
            { id: 'ORD-013', time: '1:55 PM', amount: 650, status: 'completed' }
          ],
          cashDrawer: 5000,
          taxCollected: 1125,
          discounts: 350
        }
      },
      getWeeklySummary: {
        success: true,
        data: {
          totalSales: 87500,
          totalOrders: 105,
          avgOrder: 833,
          lastWeekSales: 75000,
          lastWeekOrders: 90,
          percentageChange: 16.67,
          isPositive: true,
          dailyData: [
            { date: '2024-01-15', dayName: 'Monday', orderCount: 15, total: 12500 },
            { date: '2024-01-16', dayName: 'Tuesday', orderCount: 18, total: 15000 },
            { date: '2024-01-17', dayName: 'Wednesday', orderCount: 12, total: 10000 }
          ]
        }
      },
      getMonthlySummary: {
        success: true,
        data: {
          totalSales: 350000,
          totalOrders: 420,
          avgOrder: 833,
          lastMonthSales: 320000,
          lastMonthOrders: 385,
          percentageChange: 9.38,
          isPositive: true,
          dailyData: []
        }
      },
      getStockSummary: {
        success: true,
        data: {
          totalProducts: 150,
          lowStockCount: 12,
          outOfStockCount: 3,
          totalStockValue: 250000,
          totalQuantity: 5000,
          lowStockProducts: [
            { productCode: 'P001', productName: 'Product A', currentStock: 5, lowStockThreshold: 10 },
            { productCode: 'P002', productName: 'Product B', currentStock: 3, lowStockThreshold: 10 }
          ]
        }
      },
      getTopProducts: {
        success: true,
        data: [
          { productCode: 'P001', productName: 'Product A', quantitySold: 150, totalRevenue: 45000, averagePrice: 300 },
          { productCode: 'P002', productName: 'Product B', quantitySold: 120, totalRevenue: 36000, averagePrice: 300 },
          { productCode: 'P003', productName: 'Product C', quantitySold: 100, totalRevenue: 25000, averagePrice: 250 }
        ]
      },
      getOrders: {
        success: true,
        data: [
          { id: 1, code: 'ORD001', orderNo: 'ORD-001', customerName: 'John Doe', total: 1500, status: 1, addedDate: '2024-01-15T10:30:00' },
          { id: 2, code: 'ORD002', orderNo: 'ORD-002', customerName: 'Jane Smith', total: 2500, status: 1, addedDate: '2024-01-15T11:45:00' }
        ],
        total: 2
      }
    };

    return mockData[method] || null;
  },

  // ==================== API Methods ====================

  /**
   * Get plugin information
   */
  getPluginInfo() {
    return this._callNative('getPluginInfo');
  },

  /**
   * Get current order
   */
  getCurrentOrder() {
    return this._callNative('getCurrentOrder');
  },

  /**
   * Get shopping cart
   */
  getCart() {
    return this._callNative('getCart');
  },

  /**
   * Add item to cart
   */
  addToCart(item) {
    return this._callNative('addToCart', { item });
  },

  /**
   * Remove item from cart
   */
  removeFromCart(itemId) {
    return this._callNative('removeFromCart', { itemId });
  },

  /**
   * Update cart item quantity
   */
  updateCartItemQuantity(itemId, quantity) {
    return this._callNative('updateCartItemQuantity', { itemId, quantity });
  },

  /**
   * Get current customer
   */
  getCustomer() {
    return this._callNative('getCustomer');
  },

  /**
   * Set customer for current order
   */
  setCustomer(customer) {
    return this._callNative('setCustomer', { customer });
  },

  /**
   * Get products
   */
  getProducts(options = {}) {
    return this._callNative('getProducts', options);
  },

  /**
   * Search products
   */
  searchProducts(query) {
    return this._callNative('searchProducts', { query });
  },

  /**
   * Get categories
   */
  getCategories() {
    return this._callNative('getCategories');
  },

  /**
   * Get plugin settings
   */
  getSettings() {
    return this._callNative('getSettings');
  },

  /**
   * Save plugin settings
   */
  saveSettings(settings) {
    return this._callNative('saveSettings', { settings });
  },

  /**
   * Show toast notification
   */
  showToast(options) {
    if (window.POSBridge) {
      return this._callNative('showToast', options);
    } else {
      // Development mode - use console and alert
      console.log('[Toast]', options.message);
      return Promise.resolve();
    }
  },

  /**
   * Show dialog
   */
  showDialog(options) {
    return this._callNative('showDialog', options);
  },

  /**
   * Close plugin
   */
  close() {
    return this._callNative('closePlugin');
  },

  /**
   * Navigate to POS screen
   */
  navigateTo(screen, params = {}) {
    return this._callNative('navigateTo', { screen, params });
  },

  /**
   * Process payment
   */
  processPayment(amount, options = {}) {
    return this._callNative('processPayment', { amount, ...options });
  },

  /**
   * Print receipt
   */
  printReceipt(data) {
    return this._callNative('printReceipt', { data });
  },

  /**
   * Open cash drawer
   */
  openCashDrawer() {
    return this._callNative('openCashDrawer');
  },

  /**
   * Get store info
   */
  getStoreInfo() {
    return this._callNative('getStoreInfo');
  },

  /**
   * Get staff info
   */
  getStaffInfo() {
    return this._callNative('getStaffInfo');
  },

  /**
   * Get daily summary (sales, orders, payment methods, top products, etc.)
   */
  getDailySummary() {
    return this._callNative('getDailySummary');
  },

  /**
   * Get weekly summary (this week vs last week comparison)
   */
  getWeeklySummary() {
    return this._callNative('getWeeklySummary');
  },

  /**
   * Get monthly summary (this month vs last month comparison)
   */
  getMonthlySummary() {
    return this._callNative('getMonthlySummary');
  },

  /**
   * Get stock/inventory summary
   */
  getStockSummary() {
    return this._callNative('getStockSummary');
  },

  /**
   * Get top selling products
   * @param {Object} options - { limit: number, days: number }
   */
  getTopProducts(options = {}) {
    return this._callNative('getTopProducts', options);
  },

  /**
   * Get orders with filters
   * @param {Object} options - { limit, offset, startDate, endDate }
   */
  getOrders(options = {}) {
    return this._callNative('getOrders', options);
  },

  /**
   * Log analytics event
   */
  logEvent(eventName, params = {}) {
    return this._callNative('logEvent', { eventName, params });
  },

  /**
   * Make HTTP request (via POS proxy)
   */
  httpRequest(options) {
    return this._callNative('httpRequest', options);
  }
};

// Handle native callbacks
window._handlePOSCallback = function(callId, success, data) {
  if (window._pendingCalls && window._pendingCalls[callId]) {
    if (success) {
      window._pendingCalls[callId].resolve(data);
    } else {
      window._pendingCalls[callId].reject(new Error(data));
    }
    delete window._pendingCalls[callId];
  }
};

// Handle native events
window._handlePOSEvent = function(event, data) {
  POS_SDK._emit(event, data);
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = POS_SDK;
}
`;
}

/**
 * Generate payment handler for payment template
 */
function generatePaymentHandler() {
  return `/**
 * Payment Handler
 *
 * Template for integrating payment gateways with CommercePOS.
 */

const PaymentHandler = {
  // Payment gateway configuration
  config: {
    gatewayName: 'Custom Gateway',
    apiUrl: '',
    merchantId: '',
    apiKey: ''
  },

  /**
   * Initialize payment handler
   */
  async init(config = {}) {
    this.config = { ...this.config, ...config };
    console.log('[PaymentHandler] Initialized with config:', this.config.gatewayName);
  },

  /**
   * Process a payment
   */
  async processPayment(amount, options = {}) {
    console.log('[PaymentHandler] Processing payment:', amount);

    try {
      // Validate amount
      if (!amount || amount <= 0) {
        throw new Error('Invalid payment amount');
      }

      // Show processing UI
      this.showProcessingUI();

      // Call payment gateway API
      const result = await this.callGatewayAPI({
        action: 'charge',
        amount: amount,
        currency: options.currency || 'INR',
        orderId: options.orderId,
        customerId: options.customerId,
        metadata: options.metadata
      });

      // Hide processing UI
      this.hideProcessingUI();

      if (result.success) {
        // Notify POS of successful payment
        await POS_SDK.showToast({
          message: 'Payment successful!',
          type: 'success'
        });

        return {
          success: true,
          transactionId: result.transactionId,
          amount: amount,
          timestamp: new Date().toISOString()
        };
      } else {
        throw new Error(result.error || 'Payment failed');
      }

    } catch (error) {
      this.hideProcessingUI();
      console.error('[PaymentHandler] Payment error:', error);

      await POS_SDK.showToast({
        message: error.message || 'Payment failed',
        type: 'error'
      });

      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Refund a payment
   */
  async refundPayment(transactionId, amount, reason = '') {
    console.log('[PaymentHandler] Processing refund:', transactionId, amount);

    try {
      const result = await this.callGatewayAPI({
        action: 'refund',
        transactionId: transactionId,
        amount: amount,
        reason: reason
      });

      if (result.success) {
        await POS_SDK.showToast({
          message: 'Refund processed successfully',
          type: 'success'
        });

        return {
          success: true,
          refundId: result.refundId,
          amount: amount
        };
      } else {
        throw new Error(result.error || 'Refund failed');
      }

    } catch (error) {
      console.error('[PaymentHandler] Refund error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Check payment status
   */
  async checkStatus(transactionId) {
    try {
      const result = await this.callGatewayAPI({
        action: 'status',
        transactionId: transactionId
      });

      return result;
    } catch (error) {
      console.error('[PaymentHandler] Status check error:', error);
      return { success: false, status: 'unknown' };
    }
  },

  /**
   * Call payment gateway API
   * Override this method for your specific gateway
   */
  async callGatewayAPI(params) {
    // Simulate API call for development
    console.log('[PaymentHandler] API call:', params);

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          transactionId: 'TXN_' + Date.now(),
          refundId: params.action === 'refund' ? 'REF_' + Date.now() : null,
          status: 'completed'
        });
      }, 1500);
    });
  },

  /**
   * Show processing UI
   */
  showProcessingUI() {
    let overlay = document.getElementById('payment-processing-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'payment-processing-overlay';
      overlay.innerHTML = \`
        <div class="payment-processing-content">
          <div class="payment-spinner"></div>
          <p>Processing payment...</p>
        </div>
      \`;
      overlay.style.cssText = \`
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
      \`;
      document.body.appendChild(overlay);
    }
    overlay.style.display = 'flex';
  },

  /**
   * Hide processing UI
   */
  hideProcessingUI() {
    const overlay = document.getElementById('payment-processing-overlay');
    if (overlay) {
      overlay.style.display = 'none';
    }
  }
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PaymentHandler;
}
`;
}

/**
 * Generate report generator for report template
 */
function generateReportGenerator() {
  return `/**
 * Report Generator
 *
 * Template for creating custom reports in CommercePOS.
 */

const ReportGenerator = {
  // Report configuration
  config: {
    reportName: 'Custom Report',
    dateFormat: 'YYYY-MM-DD',
    currency: 'INR'
  },

  /**
   * Initialize report generator
   */
  init(config = {}) {
    this.config = { ...this.config, ...config };
    console.log('[ReportGenerator] Initialized');
  },

  /**
   * Generate sales report
   */
  async generateSalesReport(startDate, endDate, options = {}) {
    console.log('[ReportGenerator] Generating sales report:', startDate, '-', endDate);

    try {
      // Fetch orders from POS
      const orders = await this.fetchOrders(startDate, endDate, options);

      // Process data
      const report = this.processSalesData(orders);

      return {
        success: true,
        reportType: 'sales',
        dateRange: { startDate, endDate },
        generatedAt: new Date().toISOString(),
        data: report
      };
    } catch (error) {
      console.error('[ReportGenerator] Report error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Generate product performance report
   */
  async generateProductReport(startDate, endDate, options = {}) {
    console.log('[ReportGenerator] Generating product report');

    try {
      const orders = await this.fetchOrders(startDate, endDate, options);
      const products = this.processProductData(orders);

      return {
        success: true,
        reportType: 'product',
        dateRange: { startDate, endDate },
        generatedAt: new Date().toISOString(),
        data: products
      };
    } catch (error) {
      console.error('[ReportGenerator] Report error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Generate staff performance report
   */
  async generateStaffReport(startDate, endDate, options = {}) {
    console.log('[ReportGenerator] Generating staff report');

    try {
      const orders = await this.fetchOrders(startDate, endDate, options);
      const staffData = this.processStaffData(orders);

      return {
        success: true,
        reportType: 'staff',
        dateRange: { startDate, endDate },
        generatedAt: new Date().toISOString(),
        data: staffData
      };
    } catch (error) {
      console.error('[ReportGenerator] Report error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Fetch orders from POS
   */
  async fetchOrders(startDate, endDate, options) {
    // Try to get real data from POS SDK
    try {
      if (typeof POS_SDK !== 'undefined') {
        await POS_SDK.ready();
        const result = await POS_SDK.getDailySummary();
        if (result && result.success && result.data && result.data.recentOrders) {
          // Convert to the expected format
          return result.data.recentOrders.map(order => ({
            id: order.id,
            date: new Date().toISOString().split('T')[0],
            total: order.amount,
            items: [],
            staffId: 'S001',
            staffName: 'Staff'
          }));
        }
      }
    } catch (e) {
      console.log('[ReportGenerator] Could not fetch from POS, using mock data');
    }

    // Fallback mock data for development
    return [
      {
        id: 'ORD001',
        date: '2024-01-15',
        total: 1500,
        items: [
          { productId: 'P001', name: 'Product A', quantity: 2, price: 500 },
          { productId: 'P002', name: 'Product B', quantity: 1, price: 500 }
        ],
        staffId: 'S001',
        staffName: 'John'
      },
      {
        id: 'ORD002',
        date: '2024-01-15',
        total: 2000,
        items: [
          { productId: 'P001', name: 'Product A', quantity: 4, price: 500 }
        ],
        staffId: 'S002',
        staffName: 'Jane'
      }
    ];
  },

  /**
   * Process sales data
   */
  processSalesData(orders) {
    const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    // Group by date
    const dailySales = {};
    orders.forEach(order => {
      const date = order.date;
      if (!dailySales[date]) {
        dailySales[date] = { orders: 0, total: 0 };
      }
      dailySales[date].orders++;
      dailySales[date].total += order.total;
    });

    return {
      summary: {
        totalSales,
        totalOrders,
        averageOrderValue
      },
      dailyBreakdown: Object.entries(dailySales).map(([date, data]) => ({
        date,
        orders: data.orders,
        total: data.total
      }))
    };
  },

  /**
   * Process product data
   */
  processProductData(orders) {
    const products = {};

    orders.forEach(order => {
      order.items.forEach(item => {
        if (!products[item.productId]) {
          products[item.productId] = {
            productId: item.productId,
            name: item.name,
            quantitySold: 0,
            revenue: 0
          };
        }
        products[item.productId].quantitySold += item.quantity;
        products[item.productId].revenue += item.quantity * item.price;
      });
    });

    return Object.values(products).sort((a, b) => b.revenue - a.revenue);
  },

  /**
   * Process staff data
   */
  processStaffData(orders) {
    const staff = {};

    orders.forEach(order => {
      if (!staff[order.staffId]) {
        staff[order.staffId] = {
          staffId: order.staffId,
          name: order.staffName,
          ordersProcessed: 0,
          totalSales: 0
        };
      }
      staff[order.staffId].ordersProcessed++;
      staff[order.staffId].totalSales += order.total;
    });

    return Object.values(staff).sort((a, b) => b.totalSales - a.totalSales);
  },

  /**
   * Export report to CSV
   */
  exportToCSV(reportData) {
    const rows = [];

    if (reportData.reportType === 'sales') {
      rows.push(['Date', 'Orders', 'Total']);
      reportData.data.dailyBreakdown.forEach(day => {
        rows.push([day.date, day.orders, day.total]);
      });
    } else if (reportData.reportType === 'product') {
      rows.push(['Product ID', 'Name', 'Quantity Sold', 'Revenue']);
      reportData.data.forEach(product => {
        rows.push([product.productId, product.name, product.quantitySold, product.revenue]);
      });
    } else if (reportData.reportType === 'staff') {
      rows.push(['Staff ID', 'Name', 'Orders Processed', 'Total Sales']);
      reportData.data.forEach(s => {
        rows.push([s.staffId, s.name, s.ordersProcessed, s.totalSales]);
      });
    }

    return rows.map(row => row.join(',')).join('\\n');
  },

  /**
   * Render report as HTML table
   */
  renderTable(data, columns) {
    let html = '<table class="pos-table"><thead><tr>';
    columns.forEach(col => {
      html += \`<th>\${col.label}</th>\`;
    });
    html += '</tr></thead><tbody>';

    data.forEach(row => {
      html += '<tr>';
      columns.forEach(col => {
        html += \`<td>\${row[col.key]}</td>\`;
      });
      html += '</tr>';
    });

    html += '</tbody></table>';
    return html;
  }
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ReportGenerator;
}
`;
}

/**
 * Generate README
 */
function generateReadme(pluginName, template) {
  return `# ${pluginName}

A plugin for CommercePOS built with HTML/CSS/JavaScript.

## Getting Started

### Development

1. Start the development server:
   \`\`\`bash
   cpos-plugin serve
   \`\`\`

2. Open http://localhost:3000 in your browser

3. Edit files and see changes in real-time

### Building for Production

1. Build the plugin:
   \`\`\`bash
   cpos-plugin build
   \`\`\`

2. Package for distribution:
   \`\`\`bash
   cpos-plugin package
   \`\`\`

## Project Structure

\`\`\`
${pluginName}/
├── index.html          # Main HTML entry point
├── styles.css          # Plugin styles
├── main.js             # Main JavaScript file
├── manifest.json       # Plugin manifest
├── assets/             # Static assets
│   ├── images/
│   └── icons/
└── lib/
    └── pos-sdk.js      # POS SDK bridge
\`\`\`

## POS SDK

The POS SDK provides communication between your plugin and CommercePOS:

\`\`\`javascript
// Wait for SDK to be ready
await POS_SDK.ready();

// Get current order
const order = await POS_SDK.getCurrentOrder();

// Add item to cart
await POS_SDK.addToCart({ productId: '123', quantity: 1 });

// Show toast notification
POS_SDK.showToast({ message: 'Success!', type: 'success' });

// Listen for events
POS_SDK.on('orderUpdated', (order) => {
  console.log('Order updated:', order);
});
\`\`\`

## Available SDK Methods

- \`POS_SDK.ready()\` - Wait for SDK initialization
- \`POS_SDK.getCurrentOrder()\` - Get current order
- \`POS_SDK.getCart()\` - Get shopping cart
- \`POS_SDK.addToCart(item)\` - Add item to cart
- \`POS_SDK.removeFromCart(itemId)\` - Remove item from cart
- \`POS_SDK.getCustomer()\` - Get current customer
- \`POS_SDK.setCustomer(customer)\` - Set customer
- \`POS_SDK.getProducts(options)\` - Get products
- \`POS_SDK.searchProducts(query)\` - Search products
- \`POS_SDK.getDailySummary()\` - Get daily sales summary (sales, orders, payment methods, top products)
- \`POS_SDK.getWeeklySummary()\` - Get weekly summary with comparison to last week
- \`POS_SDK.getMonthlySummary()\` - Get monthly summary with comparison to last month
- \`POS_SDK.getStockSummary()\` - Get inventory/stock summary and low stock alerts
- \`POS_SDK.getTopProducts(options)\` - Get top selling products ({ limit, days })
- \`POS_SDK.getOrders(options)\` - Get orders with filters ({ limit, offset, startDate, endDate })
- \`POS_SDK.showToast(options)\` - Show notification
- \`POS_SDK.showDialog(options)\` - Show dialog
- \`POS_SDK.close()\` - Close plugin
- \`POS_SDK.processPayment(amount, options)\` - Process payment
- \`POS_SDK.printReceipt(data)\` - Print receipt
- \`POS_SDK.openCashDrawer()\` - Open cash drawer

## Events

- \`orderUpdated\` - Fired when order is updated
- \`cartChanged\` - Fired when cart changes
- \`customerChanged\` - Fired when customer changes
- \`posEvent\` - General POS events
- \`permissionDenied\` - Fired when a data request is denied due to missing permission

## Permissions

When your plugin requests data, the user will be prompted to grant permission. If denied:

\`\`\`javascript
// Listen for permission denied events
POS_SDK.on('permissionDenied', (event) => {
  console.log('Permission denied:', event.permission);
  console.log('Message:', event.message);
  // Show user-friendly message or disable feature
});

// Check if a result was denied
const result = await POS_SDK.getDailySummary();
if (POS_SDK.isPermissionDenied(result)) {
  console.log('Reports permission required');
  // Handle gracefully - show message to user
}
\`\`\`

Available permissions:
- \`orders\` - Access and manage orders
- \`products\` - Access products and inventory data
- \`customers\` - Access customer information
- \`payments\` - Process payments and refunds
- \`reports\` - Generate and view reports
- \`settings\` - Modify POS settings
- \`staff\` - Access staff information
- \`printer\` - Use the receipt printer
- \`cashDrawer\` - Open and control cash drawer
- \`notifications\` - Show notifications and alerts
- \`storage\` - Store data locally
- \`network\` - Make external network requests

## Manifest Configuration

Edit \`manifest.json\` to configure your plugin:

\`\`\`json
{
  "name": "Plugin Name",
  "id": "plugin-id",
  "version": "1.0.0",
  "description": "Plugin description",
  "author": "Your Name",
  "minPosVersion": "1.0.0",
  "permissions": ["orders", "products", "payments"],
  "entryPoint": "index.html",
  "icon": "assets/icons/plugin-icon.png"
}
\`\`\`

## License

MIT
`;
}

/**
 * Generate POS UI CSS (fallback if template file not found)
 */
function generatePosUiCss() {
  return `/* CommercePOS UI Component Library - Minimal Version */
:root {
  --pos-primary: #2196F3;
  --pos-primary-dark: #1976D2;
  --pos-success: #4CAF50;
  --pos-warning: #FF9800;
  --pos-danger: #F44336;
  --pos-bg: #F5F5F5;
  --pos-surface: #FFFFFF;
  --pos-border: #E0E0E0;
  --pos-text: #212121;
  --pos-text-secondary: #757575;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  margin: 0;
  padding: 0;
  background: var(--pos-bg);
  color: var(--pos-text);
}

.pos-card {
  background: var(--pos-surface);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  margin-bottom: 16px;
}

.pos-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pos-btn-primary {
  background: var(--pos-primary);
  color: white;
}

.pos-btn-primary:hover {
  background: var(--pos-primary-dark);
}

.pos-btn-secondary {
  background: #f0f0f0;
  color: var(--pos-text);
}

.pos-input {
  width: 100%;
  padding: 12px 16px;
  font-size: 14px;
  border: 1px solid var(--pos-border);
  border-radius: 8px;
}

.pos-input:focus {
  outline: none;
  border-color: var(--pos-primary);
}
`;
}

module.exports = createCommand;
