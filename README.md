# LinkedIn Feed Cleaner

A privacy-focused Chrome extension that cleans up LinkedIn's feed by removing ads, suggested posts, and clutter without collecting any user data. Built by [ProperBrand](https://properbrand.co) and Cursor.

## Features

- **Block Promoted Posts**: Removes sponsored/promoted content from your feed
- **Hide Suggested Posts**: Filters out "Suggested for you" posts
- **Hide Promotions**: Removes all promotional content
- **Hide Right Sidebar**: Optional removal of LinkedIn's right sidebar clutter
- **Clean Newsletter Prompts**: Removes subscription prompts and newsletter suggestions

## Privacy & Security

This extension is designed with privacy as the primary concern:

- **No Data Collection**: Zero user data is collected, stored externally, or transmitted
- **Minimal Permissions**: Only requires `storage` permission for saving your preferences
- **LinkedIn-Only**: Only operates on LinkedIn domains
- **No Background Scripts**: No persistent background processes
- **No External API Calls**: All filtering happens locally in your browser
- **Open Source**: Full transparency in functionality

## Installation

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder
5. The extension icon will appear in your toolbar

## Usage

1. Click the extension icon while on LinkedIn
2. Toggle the features you want to enable/disable
3. Settings are automatically saved and applied immediately
4. Refresh LinkedIn to see changes

## Security Comparison

Unlike many "free" LinkedIn extensions that:
- Extract cookies and session tokens
- Harvest your connection lists
- Make unauthorized API calls
- Require excessive permissions

This extension:
- Uses only DOM manipulation for content filtering
- Stores settings locally on your device only
- Requires minimal permissions
- Contains no tracking or analytics
- Has no external dependencies

## Development

The extension consists of:
- `manifest.json`: Extension configuration with minimal permissions
- `content.js`: Content script for DOM manipulation
- `popup.html/js`: Settings interface
- `styles.css`: Smooth transition styling

## Contributing

Feel free to submit issues or pull requests to improve the extension's functionality while maintaining its privacy-first approach.

## License

MIT License - Use freely, modify as needed, but please maintain the privacy-focused approach.

## Nerd Note: How it avoids detection

We use a MutationObserver to catch dynamic content changes (LinkedIn loves infinite scroll garbage).  
But we debounce the cleanup to run **at most once every 500ms**, so it doesn't look like a bot hammering the DOM.  
All filtering is cosmetic—no layout rewriting, no injected behavior, no stored sessions.
