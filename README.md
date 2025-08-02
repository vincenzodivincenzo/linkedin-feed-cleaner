# LinkedIn Feed Cleaner v2.0.0

Clean and focused LinkedIn feed cleaner that removes unwanted content without bloat.

## Features

### Core Feed Cleaning
- **Block Promoted Posts**: Remove sponsored and promoted content
- **Hide Suggested Posts**: Filter out algorithm-suggested posts
- **Hide All Promotions**: Comprehensive promotion removal
- **Hide Right Sidebar**: Clean up sidebar clutter
- **Block "Reacted to" Posts**: Remove posts only shown because someone in your network liked/commented/reacted

### Advanced Filtering
- **Keyword Blocker**: Hide posts containing specific keywords (e.g., "NFT", "crypto", "webinar")

### User Experience
- **Clean Now Button**: Manually trigger feed cleaning without page refresh
- **Reset View Button**: Reload settings and reapply filters
- **Debug Mode**: See what's being blocked with red borders and console logs
- **Restore Blocked Posts**: Temporarily show all hidden content (30-second timeout)

## Installation

1. Download the extension files
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the extension folder
5. The extension will appear in your toolbar

## Usage

### Basic Settings
- Click the extension icon to open the popup
- Toggle individual cleaning options on/off
- Use "Hide All" to enable all filters at once

### Keyword Blocking
- Enter comma-separated keywords in the "Block Keywords" field
- Posts containing these keywords will be automatically hidden
- Example: `NFT, crypto, webinar, MLM`

### Debug Mode
- Enable "Debug Mode" to see blocked posts with red borders instead of hiding them
- Check browser console for detailed blocking reasons
- All blocked content types use the same visual indicator for simplicity

### Restore Functionality
- Use "Restore Blocked Posts" to temporarily show all hidden content
- Auto-restores blocking after 30 seconds to prevent confusion
- Useful for checking what was blocked and identifying false positives

### Page-Specific Behavior
- **Main Feed**: Extension runs normally, cleaning the feed
- **Individual Posts**: Extension is disabled to prevent interference with post viewing
- **Other LinkedIn Pages**: Extension only runs on feed pages

## Technical Details

- **DOM-only filtering**: No API calls or data collection
- **Real-time updates**: Automatic detection of new content
- **Performance optimized**: Debounced cleaning with 200ms throttle
- **Conservative filtering**: Reduced false positives with legitimacy checks
- **Page-aware**: Only runs on main feed, not individual post pages
- **Chrome Web Store compliant**: Follows all extension guidelines

## Privacy & Security

- Zero data collection or transmission
- All processing happens locally in your browser
- No external API calls or tracking
- Settings stored locally in Chrome storage

## Version History

### v2.0.0 (Current)
- Added "Block Reacted to Posts" feature with comprehensive reaction pattern detection
- Implemented keyword blocking system
- Added "Clean Now" and "Reset View" buttons
- Added debug mode for transparency
- Added restore functionality with 30-second timeout
- Improved filtering logic to reduce false positives
- Added page-specific behavior (disabled on individual post pages)
- Simplified UI focused on core cleaning functionality
- Removed counter system for cleaner, more focused experience

### v1.2.0
- Core feed cleaning functionality
- Basic promotion and suggestion blocking
- Sidebar hiding option

## Support

For issues or feature requests, please create an issue in the repository.

## License

MIT License - see LICENSE file for details.
