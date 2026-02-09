# Publishing CommercePOS Plugin CLI to npm

Guide for publishing the `commerce-pos-plugin-cli` package to npm registry.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Prepare for Publishing](#prepare-for-publishing)
3. [Publishing to npm](#publishing-to-npm)
4. [Version Management](#version-management)
5. [Post-Publishing](#post-publishing)
6. [Maintenance](#maintenance)

---

## Prerequisites

### 1. Create npm Account

If you don't have an npm account:

```bash
# Create account via CLI
npm adduser

# Or sign up at https://www.npmjs.com/signup
```

### 2. Login to npm

```bash
npm login
```

Enter your:
- Username
- Password
- Email
- OTP (if 2FA enabled)

### 3. Verify Login

```bash
npm whoami
# Should display your username
```

---

## Prepare for Publishing

### 1. Update package.json

Ensure all fields are correctly filled:

```json
{
  "name": "commerce-pos-plugin-cli",
  "version": "1.0.0",
  "description": "CLI tool for creating and building CommercePOS plugins",
  "main": "bin/cpos-plugin.js",
  "bin": {
    "cpos-plugin": "./bin/cpos-plugin.js"
  },
  "scripts": {
    "test": "echo \"No tests yet\" && exit 0"
  },
  "keywords": [
    "commercepos",
    "pos",
    "plugin",
    "cli",
    "point-of-sale",
    "webview",
    "html",
    "css",
    "javascript"
  ],
  "author": "CommercePOS <developer@commercepos.com>",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/commercepos/plugin-cli.git"
  },
  "homepage": "https://github.com/commercepos/plugin-cli#readme",
  "bugs": {
    "url": "https://github.com/commercepos/plugin-cli/issues"
  },
  "engines": {
    "node": ">=14.0.0"
  },
  "files": [
    "bin/",
    "src/",
    "README.md",
    "LICENSE"
  ],
  "dependencies": {
    "commander": "^11.1.0",
    "chalk": "^4.1.2",
    "inquirer": "^8.2.6",
    "fs-extra": "^11.2.0",
    "archiver": "^6.0.1",
    "ora": "^5.4.1"
  }
}
```

### 2. Create .npmignore

Create `.npmignore` to exclude unnecessary files:

```
# Development files
node_modules/
.git/
.gitignore
.DS_Store

# Test files
test/
tests/
*.test.js
*.spec.js

# Documentation (keep README)
docs/

# Example plugins (optional - remove if you want to include)
plugins/

# Build artifacts
*.log
*.tmp
coverage/

# IDE files
.vscode/
.idea/
*.swp
*.swo
```

### 3. Create LICENSE File

Create `LICENSE` file (MIT License):

```
MIT License

Copyright (c) 2024 CommercePOS

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### 4. Verify Package Contents

Check what will be published:

```bash
# See files that will be included
npm pack --dry-run

# Create a tarball to inspect
npm pack
# This creates commerce-pos-plugin-cli-1.0.0.tgz
```

### 5. Test Locally

Before publishing, test the package locally:

```bash
# Install globally from local directory
npm install -g .

# Test commands
cpos-plugin --version
cpos-plugin --help
cpos-plugin create test-plugin

# Clean up test
rm -rf test-plugin
npm uninstall -g commerce-pos-plugin-cli
```

---

## Publishing to npm

### First Time Publishing

```bash
# Navigate to CLI directory
cd /path/to/pos/tools/plugin-cli

# Publish to npm
npm publish
```

### Publishing with Access Control

```bash
# Public package (anyone can install)
npm publish --access public

# Scoped package (if using @organization/package-name)
npm publish --access public
```

### Publishing Beta/Pre-release Versions

```bash
# Update version in package.json to beta
# "version": "1.0.0-beta.1"

# Publish with beta tag
npm publish --tag beta
```

Users install beta with:
```bash
npm install -g commerce-pos-plugin-cli@beta
```

---

## Version Management

### Semantic Versioning

Follow [SemVer](https://semver.org/):
- **MAJOR** (1.0.0 → 2.0.0): Breaking changes
- **MINOR** (1.0.0 → 1.1.0): New features, backward compatible
- **PATCH** (1.0.0 → 1.0.1): Bug fixes, backward compatible

### Update Version

```bash
# Patch release (bug fixes)
npm version patch
# 1.0.0 → 1.0.1

# Minor release (new features)
npm version minor
# 1.0.0 → 1.1.0

# Major release (breaking changes)
npm version major
# 1.0.0 → 2.0.0

# Pre-release
npm version prerelease --preid=beta
# 1.0.0 → 1.0.1-beta.0
```

### Publish New Version

```bash
# Update version
npm version patch

# Publish
npm publish

# Push git tags (if using git)
git push --tags
```

---

## Post-Publishing

### Verify Publication

```bash
# Check on npm
npm view commerce-pos-plugin-cli

# Install globally to test
npm install -g commerce-pos-plugin-cli

# Verify installation
cpos-plugin --version
```

### Update npm Package Page

1. Go to [npmjs.com](https://www.npmjs.com/)
2. Login and find your package
3. Edit package description and keywords
4. Add a logo/icon if desired

### Announce Release

- Update changelog
- Post on social media
- Notify users via email/newsletter
- Update documentation site

---

## Maintenance

### View Package Info

```bash
# View package details
npm view commerce-pos-plugin-cli

# View all versions
npm view commerce-pos-plugin-cli versions

# View download stats
npm view commerce-pos-plugin-cli downloads
```

### Deprecate Version

```bash
# Deprecate a specific version
npm deprecate commerce-pos-plugin-cli@1.0.0 "Critical bug, please update to 1.0.1"

# Deprecate entire package
npm deprecate commerce-pos-plugin-cli "Package is no longer maintained"
```

### Unpublish (Use with Caution)

```bash
# Unpublish specific version (within 72 hours of publish)
npm unpublish commerce-pos-plugin-cli@1.0.0

# Unpublish entire package (within 72 hours)
npm unpublish commerce-pos-plugin-cli --force
```

> **Warning**: Unpublishing can break other users' projects. Use deprecation instead when possible.

### Transfer Ownership

```bash
# Add a maintainer
npm owner add <username> commerce-pos-plugin-cli

# Remove a maintainer
npm owner rm <username> commerce-pos-plugin-cli

# List maintainers
npm owner ls commerce-pos-plugin-cli
```

---

## Quick Reference

### Publishing Checklist

- [ ] Update version in package.json
- [ ] Update CHANGELOG.md
- [ ] Run tests
- [ ] Test locally with `npm install -g .`
- [ ] Login to npm: `npm login`
- [ ] Publish: `npm publish`
- [ ] Verify: `npm view commerce-pos-plugin-cli`
- [ ] Tag release in git
- [ ] Announce release

### Common Commands

| Command | Description |
|---------|-------------|
| `npm login` | Login to npm |
| `npm whoami` | Check current user |
| `npm pack --dry-run` | Preview package contents |
| `npm publish` | Publish package |
| `npm version patch` | Bump patch version |
| `npm view <pkg>` | View package info |
| `npm deprecate <pkg>@<ver> "msg"` | Deprecate version |

### Useful Links

- [npm Documentation](https://docs.npmjs.com/)
- [npm CLI Commands](https://docs.npmjs.com/cli/v8/commands)
- [Semantic Versioning](https://semver.org/)
- [npm Package Best Practices](https://docs.npmjs.com/packages-and-modules)

---

## Troubleshooting

### "You must be logged in"

```bash
npm login
```

### "Package name already exists"

Choose a different name or use scoped package:
```json
{
  "name": "@yourorg/commerce-pos-plugin-cli"
}
```

### "Cannot publish over existing version"

```bash
# Update version first
npm version patch
npm publish
```

### "Missing required field"

Ensure package.json has:
- `name`
- `version`
- `main` or `bin`

### Permission Denied

```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
```

---

## Example: Complete Publishing Flow

```bash
# 1. Navigate to CLI directory
cd /path/to/pos/tools/plugin-cli

# 2. Install dependencies
npm install

# 3. Test locally
npm install -g .
cpos-plugin create test-plugin
rm -rf test-plugin
npm uninstall -g commerce-pos-plugin-cli

# 4. Login to npm
npm login

# 5. Check what will be published
npm pack --dry-run

# 6. Publish
npm publish --access public

# 7. Verify
npm view commerce-pos-plugin-cli

# 8. Test installation
npm install -g commerce-pos-plugin-cli
cpos-plugin --version

# Done! 🎉
```

---

## After Publishing: How Users Install

Once published, developers can install your CLI with:

```bash
# Install globally
npm install -g commerce-pos-plugin-cli

# Use the CLI
cpos-plugin create my-plugin
cd my-plugin
cpos-plugin serve
```

Or use without installing (npx):

```bash
npx commerce-pos-plugin-cli create my-plugin
```

---

**Your CLI is now available for the world to use!** 🚀
