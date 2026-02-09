/**
 * Plugin Manifest Schema
 *
 * Defines the structure and validation rules for plugin manifest.json files.
 */

const manifestSchema = {
  // Required fields
  required: ['name', 'id', 'version', 'entryPoint'],

  // Schema definition
  properties: {
    name: {
      type: 'string',
      description: 'Display name of the plugin',
      minLength: 1,
      maxLength: 100
    },
    id: {
      type: 'string',
      description: 'Unique identifier for the plugin (lowercase, no spaces)',
      pattern: /^[a-z0-9-_]+$/
    },
    version: {
      type: 'string',
      description: 'Semantic version (e.g., 1.0.0)',
      pattern: /^\d+\.\d+\.\d+$/
    },
    description: {
      type: 'string',
      description: 'Brief description of the plugin',
      maxLength: 500
    },
    author: {
      type: 'string',
      description: 'Plugin author name or organization'
    },
    email: {
      type: 'string',
      description: 'Contact email for support',
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    homepage: {
      type: 'string',
      description: 'Plugin homepage or documentation URL'
    },
    repository: {
      type: 'string',
      description: 'Source code repository URL'
    },
    license: {
      type: 'string',
      description: 'License identifier (e.g., MIT, Apache-2.0)'
    },
    minPosVersion: {
      type: 'string',
      description: 'Minimum required CommercePOS version',
      pattern: /^\d+\.\d+\.\d+$/,
      default: '1.0.0'
    },
    entryPoint: {
      type: 'string',
      description: 'Main HTML file to load',
      default: 'index.html'
    },
    icon: {
      type: 'string',
      description: 'Path to plugin icon (PNG, 256x256 recommended)'
    },
    category: {
      type: 'string',
      description: 'Plugin category for organization',
      enum: ['payment', 'report', 'integration', 'utility', 'other']
    },
    permissions: {
      type: 'array',
      description: 'List of required permissions',
      items: {
        type: 'string',
        enum: [
          'orders',         // Access to orders
          'products',       // Access to products and inventory
          'customers',      // Access to customer data
          'payments',       // Process payments
          'reports',        // Generate reports
          'settings',       // Modify settings
          'staff',          // Access to staff information
          'printer',        // Use receipt printer
          'cashDrawer',     // Control cash drawer
          'notifications',  // Show notifications
          'storage',        // Local storage
          'network'         // Make network requests
        ]
      }
    },
    settings: {
      type: 'array',
      description: 'Plugin configuration options',
      items: {
        type: 'object',
        properties: {
          key: { type: 'string', description: 'Setting identifier' },
          label: { type: 'string', description: 'Display label' },
          type: {
            type: 'string',
            enum: ['text', 'number', 'boolean', 'select', 'password']
          },
          default: { description: 'Default value' },
          options: {
            type: 'array',
            description: 'Options for select type'
          },
          required: { type: 'boolean', default: false }
        }
      }
    },
    hooks: {
      type: 'object',
      description: 'Lifecycle hooks for the plugin',
      properties: {
        onInstall: { type: 'string', description: 'Called when plugin is installed' },
        onUninstall: { type: 'string', description: 'Called when plugin is removed' },
        onEnable: { type: 'string', description: 'Called when plugin is enabled' },
        onDisable: { type: 'string', description: 'Called when plugin is disabled' },
        onOrderCreated: { type: 'string', description: 'Called when order is created' },
        onOrderCompleted: { type: 'string', description: 'Called when order is completed' },
        onPaymentReceived: { type: 'string', description: 'Called when payment is received' }
      }
    },
    shortcuts: {
      type: 'array',
      description: 'Quick action shortcuts',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          label: { type: 'string' },
          icon: { type: 'string' },
          action: { type: 'string' }
        }
      }
    }
  }
};

/**
 * Validate a manifest object against the schema
 */
function validateManifest(manifest) {
  const errors = [];
  const warnings = [];

  // Check required fields
  for (const field of manifestSchema.required) {
    if (!manifest[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Validate individual properties
  for (const [key, value] of Object.entries(manifest)) {
    const schema = manifestSchema.properties[key];

    if (!schema) {
      warnings.push(`Unknown field: ${key}`);
      continue;
    }

    // Type validation
    if (schema.type === 'string' && typeof value !== 'string') {
      errors.push(`${key} must be a string`);
    }
    if (schema.type === 'array' && !Array.isArray(value)) {
      errors.push(`${key} must be an array`);
    }
    if (schema.type === 'object' && typeof value !== 'object') {
      errors.push(`${key} must be an object`);
    }

    // Pattern validation
    if (schema.pattern && typeof value === 'string') {
      if (!schema.pattern.test(value)) {
        errors.push(`${key} has invalid format`);
      }
    }

    // Length validation
    if (schema.minLength && typeof value === 'string' && value.length < schema.minLength) {
      errors.push(`${key} must be at least ${schema.minLength} characters`);
    }
    if (schema.maxLength && typeof value === 'string' && value.length > schema.maxLength) {
      errors.push(`${key} must be at most ${schema.maxLength} characters`);
    }

    // Enum validation
    if (schema.enum && !schema.enum.includes(value)) {
      errors.push(`${key} must be one of: ${schema.enum.join(', ')}`);
    }

    // Validate permissions array
    if (key === 'permissions' && Array.isArray(value)) {
      const validPermissions = manifestSchema.properties.permissions.items.enum;
      for (const perm of value) {
        if (!validPermissions.includes(perm)) {
          warnings.push(`Unknown permission: ${perm}`);
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Generate a default manifest
 */
function generateManifest(options = {}) {
  return {
    name: options.name || 'My Plugin',
    id: options.id || 'my-plugin',
    version: options.version || '1.0.0',
    description: options.description || '',
    author: options.author || '',
    email: options.email || '',
    homepage: options.homepage || '',
    license: options.license || 'MIT',
    minPosVersion: options.minPosVersion || '1.0.0',
    entryPoint: options.entryPoint || 'index.html',
    icon: options.icon || 'assets/icons/plugin-icon.png',
    category: options.category || 'other',
    permissions: options.permissions || [],
    settings: options.settings || [],
    hooks: options.hooks || {},
    shortcuts: options.shortcuts || []
  };
}

/**
 * Get permission descriptions
 */
function getPermissionDescriptions() {
  return {
    orders: 'Access and manage orders',
    products: 'Access products and inventory data',
    customers: 'Access customer information',
    payments: 'Process payments and refunds',
    reports: 'Generate and view reports',
    settings: 'Modify POS settings',
    staff: 'Access staff information',
    printer: 'Use the receipt printer',
    cashDrawer: 'Open and control cash drawer',
    notifications: 'Show notifications and alerts',
    storage: 'Store data locally',
    network: 'Make external network requests'
  };
}

module.exports = {
  manifestSchema,
  validateManifest,
  generateManifest,
  getPermissionDescriptions
};
