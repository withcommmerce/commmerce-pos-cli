# Changelog

All notable changes to the CommercePOS Plugin CLI will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-06

### Added
- Initial release of CommercePOS Plugin CLI
- `cpos-plugin create <name>` command to create new plugins
  - Basic template for general purpose plugins
  - Payment template for payment gateway integrations
  - Report template for analytics and reporting plugins
- `cpos-plugin serve` command for development server with hot reload
- `cpos-plugin build` command for production builds with minification
- `cpos-plugin package` command to create `.cposplugin` distribution files
- POS SDK bridge for WebView communication with Flutter app
- POS UI component library (CSS) matching CommercePOS design
- Plugin manifest schema with validation
- Comprehensive documentation

### Templates Included
- Basic plugin template
- Payment integration template
- Report/Analytics template

### Default Plugins
- POS Calculator - Full-featured calculator
- Tip Calculator - Calculate tips and split bills
- Daily Summary - View sales summary with charts

---

## Version History

| Version | Date | Description |
|---------|------|-------------|
| 1.0.0 | 2024-01-06 | Initial release |
