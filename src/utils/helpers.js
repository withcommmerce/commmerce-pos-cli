/**
 * CLI Helper Utilities
 */

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

/**
 * Check if current directory is a plugin project
 */
async function isPluginProject(dir = process.cwd()) {
  const manifestPath = path.join(dir, 'manifest.json');
  return await fs.pathExists(manifestPath);
}

/**
 * Load plugin manifest
 */
async function loadManifest(dir = process.cwd()) {
  const manifestPath = path.join(dir, 'manifest.json');

  if (!await fs.pathExists(manifestPath)) {
    throw new Error('manifest.json not found');
  }

  return await fs.readJson(manifestPath);
}

/**
 * Save plugin manifest
 */
async function saveManifest(manifest, dir = process.cwd()) {
  const manifestPath = path.join(dir, 'manifest.json');
  await fs.writeJson(manifestPath, manifest, { spaces: 2 });
}

/**
 * Generate safe filename from plugin name
 */
function sanitizePluginName(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Copy template files
 */
async function copyTemplates(templateDir, targetDir, variables = {}) {
  const files = await fs.readdir(templateDir);

  for (const file of files) {
    const sourcePath = path.join(templateDir, file);
    const targetPath = path.join(targetDir, file);
    const stat = await fs.stat(sourcePath);

    if (stat.isDirectory()) {
      await fs.ensureDir(targetPath);
      await copyTemplates(sourcePath, targetPath, variables);
    } else {
      let content = await fs.readFile(sourcePath, 'utf8');

      // Replace template variables
      for (const [key, value] of Object.entries(variables)) {
        const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
        content = content.replace(regex, value);
      }

      await fs.writeFile(targetPath, content);
    }
  }
}

/**
 * Format file size
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Calculate directory size recursively
 */
async function getDirectorySize(dir) {
  let size = 0;

  if (!await fs.pathExists(dir)) {
    return size;
  }

  const items = await fs.readdir(dir);

  for (const item of items) {
    const itemPath = path.join(dir, item);
    const stat = await fs.stat(itemPath);

    if (stat.isDirectory()) {
      size += await getDirectorySize(itemPath);
    } else {
      size += stat.size;
    }
  }

  return size;
}

/**
 * Find files by extension
 */
async function findFilesByExtension(dir, extensions, excludeDirs = []) {
  const files = [];

  if (!await fs.pathExists(dir)) {
    return files;
  }

  const items = await fs.readdir(dir);

  for (const item of items) {
    const itemPath = path.join(dir, item);
    const stat = await fs.stat(itemPath);

    if (stat.isDirectory()) {
      if (!excludeDirs.includes(item)) {
        const subFiles = await findFilesByExtension(itemPath, extensions, excludeDirs);
        files.push(...subFiles);
      }
    } else {
      const ext = path.extname(item).toLowerCase();
      if (extensions.includes(ext)) {
        files.push(itemPath);
      }
    }
  }

  return files;
}

/**
 * Print error and exit
 */
function exitWithError(message) {
  console.error(chalk.red(`\nError: ${message}\n`));
  process.exit(1);
}

/**
 * Print warning
 */
function printWarning(message) {
  console.log(chalk.yellow(`Warning: ${message}`));
}

/**
 * Print success
 */
function printSuccess(message) {
  console.log(chalk.green(`✓ ${message}`));
}

/**
 * Print info
 */
function printInfo(message) {
  console.log(chalk.cyan(message));
}

/**
 * Validate version string
 */
function isValidVersion(version) {
  return /^\d+\.\d+\.\d+$/.test(version);
}

/**
 * Compare versions
 */
function compareVersions(v1, v2) {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);

  for (let i = 0; i < 3; i++) {
    if (parts1[i] > parts2[i]) return 1;
    if (parts1[i] < parts2[i]) return -1;
  }

  return 0;
}

/**
 * Get templates directory
 */
function getTemplatesDir() {
  return path.join(__dirname, '..', 'templates');
}

/**
 * Get CLI version
 */
function getCliVersion() {
  try {
    const packageJson = require('../../package.json');
    return packageJson.version;
  } catch {
    return '1.0.0';
  }
}

module.exports = {
  isPluginProject,
  loadManifest,
  saveManifest,
  sanitizePluginName,
  copyTemplates,
  formatFileSize,
  getDirectorySize,
  findFilesByExtension,
  exitWithError,
  printWarning,
  printSuccess,
  printInfo,
  isValidVersion,
  compareVersions,
  getTemplatesDir,
  getCliVersion
};
