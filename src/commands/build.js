/**
 * Build Command
 * Builds the plugin for production
 */

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');

/**
 * Build plugin for production
 */
async function buildCommand(options) {
  const spinner = ora();
  const projectDir = process.cwd();
  const outputDir = path.resolve(projectDir, options.output || 'dist');

  try {
    // If bundle mode, create single bundled HTML file
    if (options.bundle) {
      await buildBundled(projectDir, outputDir, options);
      return;
    }

    console.log(chalk.cyan('\nBuilding plugin for production...\n'));

    // Check if manifest exists
    const manifestPath = path.join(projectDir, 'manifest.json');
    if (!await fs.pathExists(manifestPath)) {
      console.log(chalk.red('Error: manifest.json not found. Are you in a plugin directory?'));
      return;
    }

    // Read manifest
    const manifest = await fs.readJson(manifestPath);
    console.log(chalk.gray(`Plugin: ${manifest.name} v${manifest.version}`));

    // Clean output directory
    spinner.start('Cleaning output directory...');
    await fs.remove(outputDir);
    await fs.ensureDir(outputDir);
    spinner.succeed('Output directory cleaned');

    // Copy and process HTML
    spinner.start('Processing HTML...');
    const htmlPath = path.join(projectDir, manifest.entryPoint || 'index.html');
    if (await fs.pathExists(htmlPath)) {
      let htmlContent = await fs.readFile(htmlPath, 'utf8');

      if (options.minify) {
        htmlContent = minifyHtml(htmlContent);
      }

      await fs.writeFile(path.join(outputDir, 'index.html'), htmlContent);
      spinner.succeed('HTML processed');
    } else {
      spinner.warn('No index.html found');
    }

    // Process CSS files
    spinner.start('Processing CSS...');
    const cssFiles = await findFiles(projectDir, '.css');
    for (const cssFile of cssFiles) {
      const relativePath = path.relative(projectDir, cssFile);
      if (relativePath.startsWith('dist') || relativePath.startsWith('node_modules')) continue;

      let cssContent = await fs.readFile(cssFile, 'utf8');

      if (options.minify) {
        cssContent = minifyCss(cssContent);
      }

      const destPath = path.join(outputDir, relativePath);
      await fs.ensureDir(path.dirname(destPath));
      await fs.writeFile(destPath, cssContent);
    }
    spinner.succeed(`CSS processed (${cssFiles.length} files)`);

    // Process JavaScript files
    spinner.start('Processing JavaScript...');
    const jsFiles = await findFiles(projectDir, '.js');
    for (const jsFile of jsFiles) {
      const relativePath = path.relative(projectDir, jsFile);
      if (relativePath.startsWith('dist') || relativePath.startsWith('node_modules')) continue;

      let jsContent = await fs.readFile(jsFile, 'utf8');

      if (options.minify) {
        jsContent = minifyJs(jsContent);
      }

      const destPath = path.join(outputDir, relativePath);
      await fs.ensureDir(path.dirname(destPath));
      await fs.writeFile(destPath, jsContent);
    }
    spinner.succeed(`JavaScript processed (${jsFiles.length} files)`);

    // Copy assets
    spinner.start('Copying assets...');
    const assetsDir = path.join(projectDir, 'assets');
    if (await fs.pathExists(assetsDir)) {
      await fs.copy(assetsDir, path.join(outputDir, 'assets'));
    }
    spinner.succeed('Assets copied');

    // Copy lib folder
    spinner.start('Copying libraries...');
    const libDir = path.join(projectDir, 'lib');
    if (await fs.pathExists(libDir)) {
      const libFiles = await fs.readdir(libDir);
      await fs.ensureDir(path.join(outputDir, 'lib'));

      for (const file of libFiles) {
        let content = await fs.readFile(path.join(libDir, file), 'utf8');

        if (options.minify && file.endsWith('.js')) {
          content = minifyJs(content);
        } else if (options.minify && file.endsWith('.css')) {
          content = minifyCss(content);
        }

        await fs.writeFile(path.join(outputDir, 'lib', file), content);
      }
    }
    spinner.succeed('Libraries copied');

    // Copy manifest
    spinner.start('Creating production manifest...');
    const prodManifest = {
      ...manifest,
      buildDate: new Date().toISOString(),
      buildMode: 'production'
    };
    await fs.writeJson(path.join(outputDir, 'manifest.json'), prodManifest, { spaces: 2 });
    spinner.succeed('Production manifest created');

    // Calculate build size
    const buildSize = await calculateDirSize(outputDir);

    // Success message
    console.log(chalk.green(`\n✓ Build completed successfully!`));
    console.log(chalk.gray(`  Output: ${outputDir}`));
    console.log(chalk.gray(`  Size: ${formatSize(buildSize)}`));
    console.log(chalk.cyan('\nNext step: Run `cpos-plugin package` to create distributable\n'));

  } catch (error) {
    spinner.fail('Build failed');
    console.error(chalk.red(`Error: ${error.message}`));
  }
}

/**
 * Find files with extension
 */
async function findFiles(dir, ext, files = []) {
  const items = await fs.readdir(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = await fs.stat(fullPath);

    if (stat.isDirectory()) {
      if (!['node_modules', 'dist', '.git'].includes(item)) {
        await findFiles(fullPath, ext, files);
      }
    } else if (item.endsWith(ext)) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Minify HTML (basic)
 */
function minifyHtml(content) {
  return content
    .replace(/<!--[\s\S]*?-->/g, '')  // Remove comments
    .replace(/>\s+</g, '><')           // Remove whitespace between tags
    .replace(/\s{2,}/g, ' ')           // Collapse multiple spaces
    .trim();
}

/**
 * Minify CSS (basic)
 */
function minifyCss(content) {
  return content
    .replace(/\/\*[\s\S]*?\*\//g, '')  // Remove comments
    .replace(/\s+/g, ' ')              // Collapse whitespace
    .replace(/\s*([{:;,}])\s*/g, '$1') // Remove space around special chars
    .replace(/;}/g, '}')               // Remove last semicolon
    .trim();
}

/**
 * Minify JavaScript (basic - removes comments and excess whitespace)
 */
function minifyJs(content) {
  // Remove single-line comments (but not in strings)
  let result = content.replace(/\/\/(?![^\n]*['"`]).*$/gm, '');

  // Remove multi-line comments
  result = result.replace(/\/\*[\s\S]*?\*\//g, '');

  // Collapse multiple newlines
  result = result.replace(/\n{2,}/g, '\n');

  // Remove leading whitespace from lines
  result = result.replace(/^\s+/gm, '');

  return result.trim();
}

/**
 * Calculate directory size
 */
async function calculateDirSize(dir) {
  let size = 0;
  const items = await fs.readdir(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = await fs.stat(fullPath);

    if (stat.isDirectory()) {
      size += await calculateDirSize(fullPath);
    } else {
      size += stat.size;
    }
  }

  return size;
}

/**
 * Format file size
 */
function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Build bundled single HTML file
 * Creates a single HTML file with all CSS and JS inlined
 */
async function buildBundled(projectDir, outputDir, options) {
  const spinner = ora();

  console.log(chalk.cyan('\nBuilding bundled plugin...\n'));

  // Check if manifest exists
  const manifestPath = path.join(projectDir, 'manifest.json');
  if (!await fs.pathExists(manifestPath)) {
    console.log(chalk.red('Error: manifest.json not found. Are you in a plugin directory?'));
    return;
  }

  // Read manifest
  const manifest = await fs.readJson(manifestPath);
  console.log(chalk.gray(`Plugin: ${manifest.name} v${manifest.version}`));
  console.log(chalk.gray(`Plugin ID: ${manifest.id}\n`));

  // Ensure output directory exists
  await fs.ensureDir(outputDir);

  // Read HTML file
  spinner.start('Reading source files...');
  const htmlPath = path.join(projectDir, manifest.entryPoint || 'index.html');
  if (!await fs.pathExists(htmlPath)) {
    spinner.fail('No index.html found');
    return;
  }

  let htmlContent = await fs.readFile(htmlPath, 'utf8');

  // Collect all CSS content
  let allCss = '';
  const cssFiles = await findFiles(projectDir, '.css');
  for (const cssFile of cssFiles) {
    const relativePath = path.relative(projectDir, cssFile);
    if (relativePath.startsWith('dist') || relativePath.startsWith('node_modules')) continue;
    const cssContent = await fs.readFile(cssFile, 'utf8');
    allCss += `/* ${relativePath} */\n${cssContent}\n\n`;
  }

  // Collect all JS content (including lib folder)
  let allJs = '';

  // First add lib files (like pos-sdk.js)
  const libDir = path.join(projectDir, 'lib');
  if (await fs.pathExists(libDir)) {
    const libFiles = await fs.readdir(libDir);
    for (const file of libFiles) {
      if (file.endsWith('.js')) {
        const jsContent = await fs.readFile(path.join(libDir, file), 'utf8');
        allJs += `/* lib/${file} */\n${jsContent}\n\n`;
      }
    }
  }

  // Then add main JS files
  const jsFiles = await findFiles(projectDir, '.js');
  for (const jsFile of jsFiles) {
    const relativePath = path.relative(projectDir, jsFile);
    if (relativePath.startsWith('dist') || relativePath.startsWith('node_modules') || relativePath.startsWith('lib')) continue;
    const jsContent = await fs.readFile(jsFile, 'utf8');
    allJs += `/* ${relativePath} */\n${jsContent}\n\n`;
  }

  spinner.succeed('Source files read');

  // Build the bundled HTML
  spinner.start('Creating bundled HTML...');

  // Minify if requested
  if (options.minify) {
    allCss = minifyCss(allCss);
    allJs = minifyJs(allJs);
  }

  // Remove existing link and script tags
  htmlContent = htmlContent.replace(/<link[^>]*rel="stylesheet"[^>]*>/gi, '');
  htmlContent = htmlContent.replace(/<script[^>]*src="[^"]*"[^>]*><\/script>/gi, '');

  // Create bundled HTML with inline styles and scripts
  const bundledHtml = htmlContent
    .replace('</head>', `<style>\n${allCss}\n</style>\n</head>`)
    .replace('</body>', `<script>\n${allJs}\n</script>\n</body>`);

  // Minify HTML if requested
  const finalHtml = options.minify ? minifyHtml(bundledHtml) : bundledHtml;

  // Write bundled file
  const outputFileName = `${manifest.id}.html`;
  const outputPath = path.join(outputDir, outputFileName);
  await fs.writeFile(outputPath, finalHtml);

  spinner.succeed('Bundled HTML created');

  // Calculate file size
  const stats = await fs.stat(outputPath);

  // Success message
  console.log(chalk.green(`\n✓ Bundle completed successfully!`));
  console.log(chalk.gray(`  Output: ${outputPath}`));
  console.log(chalk.gray(`  Size: ${formatSize(stats.size)}`));
  console.log(chalk.cyan(`\nThe bundled file can be loaded directly in WebView.\n`));
}

module.exports = buildCommand;
