# Twitter/X Engagement Extractor

A JavaScript browser console script to extract user data from Twitter/X engagement pages (quotes and reposts/retweets).

## 🚀 Features

- **Manual Tab Switching**: Reliable extraction from both Quotes and Reposts tabs
- **Smart Filtering**: Automatically filters out navigation links and system accounts
- **Duplicate Detection**: Identifies users who appear in both tabs
- **Multiple Export Formats**: CSV, JSON, and raw data access
- **Verification Status**: Detects verified accounts
- **Progress Tracking**: Real-time extraction progress with statistics

## 📋 Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Access to Twitter/X engagement pages
- Basic knowledge of browser developer tools

## 🛠️ Installation & Usage

### Step 1: Access Engagement Data
1. Go to any Twitter/X tweet
2. Click on the **retweets/quotes count** (e.g., "42 Reposts")
3. You'll see tabs for "Quotes" and "Reposts"

### Step 2: Run the Script
1. Open browser developer tools (`F12` or `Right-click → Inspect`)
2. Go to the **Console** tab
3. Copy and paste the entire script
4. Press `Enter` to start

### Step 3: Extract First Tab
- The script automatically starts extracting the current tab
- Wait for completion (you'll see "TAB EXTRACTION COMPLETE")
- Monitor progress in the console

### Step 4: Switch Tabs (Optional)
1. **Manually click** the other tab (Quotes ↔ Reposts)
2. Wait for the page to load completely
3. Type: `continueOnNewTab()` and press Enter
4. Wait for the second extraction to complete

### Step 5: Export Data
```javascript
// See all export options
showExportOptions()

// Quick exports
exportAll()          // Combined CSV file
exportSeparately()   // Separate CSV files for each tab
exportJSON()         // Complete data with metadata
```

## 📊 Available Commands

### During Extraction
```javascript
stopExtraction()     // Stop current extraction
```

### Between Tabs
```javascript
continueOnNewTab()   // Start extraction on new tab
showCurrentResults() // View current tab results
exportCurrent()      // Export current tab only
```

### After Extraction
```javascript
showAllResults()     // Complete summary with statistics
showExportOptions()  // Display all export methods
exportAll()          // Download combined CSV
exportSeparately()   // Download separate CSV files
exportJSON()         // Download JSON with metadata
getDataForAPI()      // Get clean data for copy/paste
```

### Direct Data Access
```javascript
// Raw data objects
window.twitterExtractor.quotesUsers   // Users from quotes tab
window.twitterExtractor.repostsUsers  // Users from reposts tab
```

## 📄 Data Format

### CSV Output
```csv
Username,Display Name,Verified,Tab,Timestamp
john_doe,"John Doe",false,quotes,2025-06-14T14:23:36.578Z
verified_user,"Jane Smith",true,reposts,2025-06-14T14:24:15.123Z
```

### JSON Output
```json
{
  "extractionSummary": {
    "totalUniqueUsers": 156,
    "quotesUsers": 67,
    "repostsUsers": 89,
    "duplicatesFound": 12,
    "extractedAt": "2025-06-14T14:30:00.000Z"
  },
  "allUsers": [...],
  "quotesUsers": [...],
  "repostsUsers": [...]
}
```

### User Object Structure
```javascript
{
  username: "john_doe",
  displayName: "John Doe",
  verified: false,
  tab: "quotes",
  timestamp: "2025-06-14T14:23:36.578Z"
}
```

## 📈 Example Output

```
=== ALL EXTRACTION RESULTS ===
Quotes users: 67
Reposts users: 89
Duplicates found: 12
Total unique users: 144
```

