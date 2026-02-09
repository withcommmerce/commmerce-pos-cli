/**
 * Serve Command
 * Starts a development server with hot reload
 */

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const http = require('http');

/**
 * Start development server
 */
async function serveCommand(options) {
  const projectDir = process.cwd();
  const port = parseInt(options.port) || 3000;
  const host = options.host || 'localhost';

  try {
    // Check if manifest exists
    const manifestPath = path.join(projectDir, 'manifest.json');
    if (!await fs.pathExists(manifestPath)) {
      console.log(chalk.red('Error: manifest.json not found. Are you in a plugin directory?'));
      return;
    }

    const manifest = await fs.readJson(manifestPath);
    console.log(chalk.cyan(`\nStarting development server for: ${chalk.bold(manifest.name)}\n`));

    // MIME types
    const mimeTypes = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon',
      '.woff': 'font/woff',
      '.woff2': 'font/woff2',
      '.ttf': 'font/ttf',
      '.eot': 'application/vnd.ms-fontobject'
    };

    // Create server
    const server = http.createServer(async (req, res) => {
      let filePath = path.join(projectDir, req.url === '/' ? 'index.html' : req.url);

      // Security: prevent directory traversal
      if (!filePath.startsWith(projectDir)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }

      try {
        // Check if file exists
        if (!await fs.pathExists(filePath)) {
          // Try adding .html extension
          if (await fs.pathExists(filePath + '.html')) {
            filePath += '.html';
          } else {
            res.writeHead(404);
            res.end('Not Found');
            console.log(chalk.yellow(`  404: ${req.url}`));
            return;
          }
        }

        // Get file stats
        const stat = await fs.stat(filePath);

        if (stat.isDirectory()) {
          filePath = path.join(filePath, 'index.html');
          if (!await fs.pathExists(filePath)) {
            res.writeHead(404);
            res.end('Not Found');
            return;
          }
        }

        // Get MIME type
        const ext = path.extname(filePath).toLowerCase();
        const contentType = mimeTypes[ext] || 'application/octet-stream';

        // Read and serve file
        const content = await fs.readFile(filePath);

        // Inject live reload script for HTML files
        if (ext === '.html') {
          const liveReloadScript = `
<script>
  // Live reload for development
  (function() {
    let lastCheck = Date.now();
    setInterval(async () => {
      try {
        const res = await fetch('/__reload_check?t=' + lastCheck);
        const data = await res.json();
        if (data.reload) {
          location.reload();
        }
        lastCheck = Date.now();
      } catch (e) {}
    }, 1000);
  })();
</script>
`;
          const modifiedContent = content.toString().replace('</body>', liveReloadScript + '</body>');
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(modifiedContent);
        } else {
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(content);
        }

        console.log(chalk.gray(`  ${req.method} ${req.url}`));

      } catch (error) {
        console.error(chalk.red(`  Error: ${error.message}`));
        res.writeHead(500);
        res.end('Internal Server Error');
      }
    });

    // File watcher for live reload
    let lastModified = Date.now();
    const watchDirs = [projectDir];

    for (const dir of watchDirs) {
      fs.watch(dir, { recursive: true }, (eventType, filename) => {
        if (filename && !filename.startsWith('dist') && !filename.includes('node_modules')) {
          lastModified = Date.now();
          console.log(chalk.blue(`  File changed: ${filename}`));
        }
      });
    }

    // Handle reload check requests
    server.on('request', (req, res) => {
      if (req.url.startsWith('/__reload_check')) {
        const url = new URL(req.url, `http://${host}:${port}`);
        const clientTime = parseInt(url.searchParams.get('t')) || 0;

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ reload: lastModified > clientTime }));
      }
    });

    // Start server
    server.listen(port, host, () => {
      console.log(chalk.green(`  Server running at: ${chalk.bold(`http://${host}:${port}`)}`));
      console.log(chalk.gray(`  Press Ctrl+C to stop\n`));
      console.log(chalk.cyan('  Watching for file changes...\n'));
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.log(chalk.red(`\nError: Port ${port} is already in use.`));
        console.log(chalk.gray(`Try a different port: cpos-plugin serve --port ${port + 1}\n`));
      } else {
        console.error(chalk.red(`\nServer error: ${error.message}`));
      }
      process.exit(1);
    });

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log(chalk.yellow('\n\nShutting down server...'));
      server.close(() => {
        console.log(chalk.green('Server stopped.\n'));
        process.exit(0);
      });
    });

  } catch (error) {
    console.error(chalk.red(`Error: ${error.message}`));
  }
}

module.exports = serveCommand;
