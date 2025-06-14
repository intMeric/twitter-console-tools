// Manual tab-switching extraction for Twitter/X engagement
// Step 1: Run script on first tab, Step 2: Switch tab manually, Step 3: Call continueOnNewTab()

(function() {
    // Global storage for results
    if (!window.twitterExtractor) {
        window.twitterExtractor = {
            quotesUsers: [],
            repostsUsers: [],
            currentExtraction: [],
            extractionStats: {
                totalScrolls: 0,
                phases: []
            }
        };
    }
    
    var extractedUsers = [];
    var scrollCount = 0;
    var lastUserCount = 0;
    var noNewContentCount = 0;
    var isRunning = true;
    var currentTab = 'unknown';
    
    // System links to ignore
    var systemLinks = [
        'notifications', 'messages', 'jobs', 'compose', 'search', 'explore', 
        'settings', 'bookmarks', 'lists', 'topics', 'moments', 'newsletters',
        'twitter_ads', 'analytics', 'pro', 'help', 'display', 'keyboard_shortcuts',
        'accessibility', 'ads', 'business', 'developers', 'media', 'marketing',
        'i', 'home', 'login', 'signup', 'tos', 'privacy', 'rules', 'cookies'
    ];
    
    console.log("=== MANUAL TWITTER EXTRACTION ===");
    console.log("Step 1: Extracting current tab...");
    
    // Get current tab
    function getCurrentTab() {
        var quotesTab = document.querySelector('[data-testid="tab-Quotes"]');
        var repostsTab = document.querySelector('[data-testid="tab-Reposts"]');
        
        if (quotesTab && quotesTab.getAttribute('aria-selected') === 'true') {
            return 'quotes';
        } else if (repostsTab && repostsTab.getAttribute('aria-selected') === 'true') {
            return 'reposts';
        }
        
        if (window.location.href.indexOf('/quotes') > -1) return 'quotes';
        if (window.location.href.indexOf('/retweets') > -1) return 'reposts';
        
        return 'unknown';
    }
    
    // Check if username is valid
    function isValidUsername(username) {
        if (!username || username.length === 0) return false;
        if (username.length > 15) return false;
        if (systemLinks.indexOf(username.toLowerCase()) > -1) return false;
        if (username.indexOf('?') > -1 || username.indexOf('#') > -1) return false;
        if (username.indexOf('=') > -1 || username.indexOf('&') > -1) return false;
        if (username.startsWith('intent')) return false;
        return true;
    }
    
    // Extract users from current page
    function extractUsers() {
        var users = [];
        currentTab = getCurrentTab();
        
        // Look for user cells
        var userCells = document.querySelectorAll('[data-testid="UserCell"]');
        
        for (var i = 0; i < userCells.length; i++) {
            var cell = userCells[i];
            var userLink = cell.querySelector('a[href^="/"][href*="/"]');
            
            if (!userLink) continue;
            
            var href = userLink.getAttribute('href');
            var username = href.split('/')[1];
            
            if (!isValidUsername(username)) continue;
            
            // Get display name
            var displayNameElement = cell.querySelector('[dir="ltr"] span span') || 
                                   cell.querySelector('div[dir="ltr"] > span');
            var displayName = displayNameElement ? displayNameElement.textContent.trim() : '';
            
            // Check verification
            var verified = cell.querySelector('[data-testid="icon-verified"]') !== null;
            
            users.push({
                username: username,
                displayName: displayName,
                verified: verified,
                tab: currentTab,
                timestamp: new Date().toISOString()
            });
        }
        
        // Fallback to articles if no user cells
        if (users.length === 0) {
            var articles = document.querySelectorAll('article[data-testid="tweet"]');
            
            for (var i = 0; i < articles.length; i++) {
                var article = articles[i];
                var userLinks = article.querySelectorAll('a[href^="/"][href*="/"]');
                
                for (var j = 0; j < userLinks.length; j++) {
                    var link = userLinks[j];
                    var href = link.getAttribute('href');
                    var username = href.split('/')[1];
                    
                    if (!isValidUsername(username)) continue;
                    
                    // Skip duplicates
                    var exists = false;
                    for (var k = 0; k < users.length; k++) {
                        if (users[k].username === username) {
                            exists = true;
                            break;
                        }
                    }
                    if (exists) continue;
                    
                    users.push({
                        username: username,
                        displayName: '',
                        verified: false,
                        tab: currentTab,
                        timestamp: new Date().toISOString()
                    });
                }
            }
        }
        
        return users;
    }
    
    // Main extraction function
    function performExtraction() {
        if (!isRunning) return;
        
        var currentUsers = extractUsers();
        
        // Add new users
        for (var i = 0; i < currentUsers.length; i++) {
            var user = currentUsers[i];
            var exists = false;
            
            for (var j = 0; j < extractedUsers.length; j++) {
                if (extractedUsers[j].username === user.username) {
                    exists = true;
                    break;
                }
            }
            
            if (!exists) {
                extractedUsers.push(user);
            }
        }
        
        scrollCount++;
        console.log("Tab: " + currentTab + " - Scroll #" + scrollCount + " - Users: " + extractedUsers.length);
        
        // Show new users
        if (currentUsers.length > 0) {
            var newUsers = [];
            for (var i = 0; i < Math.min(3, currentUsers.length); i++) {
                newUsers.push("@" + currentUsers[i].username);
            }
            console.log("Recent: " + newUsers.join(", "));
        }
        
        // Check for completion
        if (extractedUsers.length === lastUserCount) {
            noNewContentCount++;
            console.log("No new users (" + noNewContentCount + "/5)");
            
            if (noNewContentCount >= 5) {
                console.log("=== TAB EXTRACTION COMPLETE ===");
                finishCurrentTab();
                return;
            }
        } else {
            noNewContentCount = 0;
            lastUserCount = extractedUsers.length;
        }
        
        // Continue scrolling
        window.scrollTo(0, document.body.scrollHeight);
        setTimeout(performExtraction, 3000);
    }
    
    // Finish current tab and store results
    function finishCurrentTab() {
        var tab = getCurrentTab();
        
        console.log("Finished extracting " + tab + " tab");
        console.log("Users found: " + extractedUsers.length);
        
        // Store results in global object
        if (tab === 'quotes') {
            window.twitterExtractor.quotesUsers = extractedUsers.slice();
        } else if (tab === 'reposts') {
            window.twitterExtractor.repostsUsers = extractedUsers.slice();
        }
        
        window.twitterExtractor.currentExtraction = extractedUsers.slice();
        window.twitterExtractor.extractionStats.totalScrolls += scrollCount;
        window.twitterExtractor.extractionStats.phases.push({
            tab: tab,
            users: extractedUsers.length,
            scrolls: scrollCount,
            timestamp: new Date().toISOString()
        });
        
        // Show current results
        displayCurrentResults();
        
        // Instructions for next step
        console.log("\n=== NEXT STEPS ===");
        console.log("1. Manually switch to the other tab (Quotes/Reposts)");
        console.log("2. Wait for the tab to load completely");
        console.log("3. Call: continueOnNewTab()");
        console.log("\nOr finish here:");
        console.log("- showExportOptions() : See all export methods");
        console.log("- exportCurrent() : Export current tab only");
        console.log("- showCurrentResults() : See current tab results");
        
        // Check if this completes both tabs
        var extractor = window.twitterExtractor;
        if (extractor.quotesUsers.length > 0 && extractor.repostsUsers.length > 0) {
            window.finalizeExtraction();
        }
        
        isRunning = false;
    }
    
    // Display current tab results
    function displayCurrentResults() {
        var verified = [];
        var regular = [];
        
        for (var i = 0; i < extractedUsers.length; i++) {
            if (extractedUsers[i].verified) {
                verified.push(extractedUsers[i]);
            } else {
                regular.push(extractedUsers[i]);
            }
        }
        
        console.log("\n=== CURRENT TAB RESULTS ===");
        console.log("Tab: " + currentTab);
        console.log("Total users: " + extractedUsers.length);
        console.log("Verified: " + verified.length);
        console.log("Regular: " + regular.length);
        
        if (verified.length > 0) {
            console.log("\nVerified users:");
            for (var i = 0; i < verified.length; i++) {
                console.log("  @" + verified[i].username + 
                           (verified[i].displayName ? " - " + verified[i].displayName : ""));
            }
        }
        
        console.log("\nSample regular users:");
        for (var i = 0; i < Math.min(10, regular.length); i++) {
            console.log("  @" + regular[i].username + 
                       (regular[i].displayName ? " - " + regular[i].displayName : ""));
        }
        
        if (regular.length > 10) {
            console.log("  ... and " + (regular.length - 10) + " more");
        }
    }
    
    // Global functions for manual control
    window.continueOnNewTab = function() {
        console.log("=== CONTINUING ON NEW TAB ===");
        
        // Reset extraction variables
        extractedUsers = [];
        scrollCount = 0;
        lastUserCount = 0;
        noNewContentCount = 0;
        isRunning = true;
        
        var newTab = getCurrentTab();
        console.log("Detected tab: " + newTab);
        console.log("Starting extraction in 3 seconds...");
        
        setTimeout(performExtraction, 3000);
    };
    
    window.showCurrentResults = function() {
        displayCurrentResults();
    };
    
    window.showAllResults = function() {
        var extractor = window.twitterExtractor;
        var allUsers = [];
        var duplicates = 0;
        
        console.log("=== ALL EXTRACTION RESULTS ===");
        console.log("Quotes users: " + extractor.quotesUsers.length);
        console.log("Reposts users: " + extractor.repostsUsers.length);
        
        // Combine and find duplicates
        allUsers = extractor.quotesUsers.slice();
        
        for (var i = 0; i < extractor.repostsUsers.length; i++) {
            var user = extractor.repostsUsers[i];
            var exists = false;
            
            for (var j = 0; j < allUsers.length; j++) {
                if (allUsers[j].username === user.username) {
                    exists = true;
                    duplicates++;
                    break;
                }
            }
            
            if (!exists) {
                allUsers.push(user);
            }
        }
        
        console.log("Duplicates found: " + duplicates);
        console.log("Total unique users: " + allUsers.length);
        
        return allUsers;
    };
    
    window.exportCurrent = function() {
        var csv = "Username,Display Name,Verified,Tab,Timestamp\n";
        for (var i = 0; i < extractedUsers.length; i++) {
            var user = extractedUsers[i];
            csv += user.username + ',"' + (user.displayName || '') + '",' + 
                   user.verified + ',' + user.tab + ',"' + user.timestamp + '"\n';
        }
        
        var blob = new Blob([csv], { type: 'text/csv' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'twitter_' + currentTab + '_users.csv';
        a.click();
        console.log("Current tab CSV downloaded");
    };
    
    window.exportAll = function() {
        var allUsers = window.showAllResults();
        
        var csv = "Username,Display Name,Verified,Tab,Timestamp\n";
        for (var i = 0; i < allUsers.length; i++) {
            var user = allUsers[i];
            csv += user.username + ',"' + (user.displayName || '') + '",' + 
                   user.verified + ',' + user.tab + ',"' + user.timestamp + '"\n';
        }
        
        var blob = new Blob([csv], { type: 'text/csv' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'twitter_all_engagement_users.csv';
        a.click();
        console.log("Complete CSV downloaded");
    };
    
    window.exportSeparately = function() {
        var extractor = window.twitterExtractor;
        
        // Export Quotes users
        if (extractor.quotesUsers.length > 0) {
            var quotesCSV = "Username,Display Name,Verified,Timestamp\n";
            for (var i = 0; i < extractor.quotesUsers.length; i++) {
                var user = extractor.quotesUsers[i];
                quotesCSV += user.username + ',"' + (user.displayName || '') + '",' + 
                            user.verified + ',"' + user.timestamp + '"\n';
            }
            
            var blob1 = new Blob([quotesCSV], { type: 'text/csv' });
            var url1 = URL.createObjectURL(blob1);
            var a1 = document.createElement('a');
            a1.href = url1;
            a1.download = 'twitter_quotes_users.csv';
            a1.click();
            console.log("Quotes CSV downloaded");
        }
        
        // Export Reposts users
        if (extractor.repostsUsers.length > 0) {
            var repostsCSV = "Username,Display Name,Verified,Timestamp\n";
            for (var i = 0; i < extractor.repostsUsers.length; i++) {
                var user = extractor.repostsUsers[i];
                repostsCSV += user.username + ',"' + (user.displayName || '') + '",' + 
                             user.verified + ',"' + user.timestamp + '"\n';
            }
            
            var blob2 = new Blob([repostsCSV], { type: 'text/csv' });
            var url2 = URL.createObjectURL(blob2);
            var a2 = document.createElement('a');
            a2.href = url2;
            a2.download = 'twitter_reposts_users.csv';
            a2.click();
            console.log("Reposts CSV downloaded");
        }
    };
    
    window.exportJSON = function() {
        var extractor = window.twitterExtractor;
        var allUsers = window.showAllResults();
        
        var data = {
            extractionSummary: {
                totalUniqueUsers: allUsers.length,
                quotesUsers: extractor.quotesUsers.length,
                repostsUsers: extractor.repostsUsers.length,
                duplicatesFound: extractor.quotesUsers.length + extractor.repostsUsers.length - allUsers.length,
                extractedAt: new Date().toISOString(),
                phases: extractor.extractionStats.phases
            },
            allUsers: allUsers,
            quotesUsers: extractor.quotesUsers,
            repostsUsers: extractor.repostsUsers
        };
        
        var json = JSON.stringify(data, null, 2);
        var blob = new Blob([json], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'twitter_engagement_data.json';
        a.click();
        console.log("JSON data downloaded");
    };
    
    window.getDataForAPI = function() {
        var extractor = window.twitterExtractor;
        var allUsers = window.showAllResults();
        
        return {
            usernames: allUsers.map(function(user) { return user.username; }),
            verified: allUsers.filter(function(user) { return user.verified; }).map(function(user) { return user.username; }),
            quotes: extractor.quotesUsers.map(function(user) { return user.username; }),
            reposts: extractor.repostsUsers.map(function(user) { return user.username; })
        };
    };
    
    window.stopExtraction = function() {
        isRunning = false;
        console.log("Extraction stopped manually");
        if (extractedUsers.length > 0) {
            finishCurrentTab();
        }
    };
    
    // Show all export options
    window.showExportOptions = function() {
        console.log("\n=== EXPORT OPTIONS ===");
        console.log("📊 Data Summary:");
        console.log("- exportAll() : Download combined CSV (all users, one file)");
        console.log("- exportSeparately() : Download separate CSV files (quotes.csv + reposts.csv)");
        console.log("- exportJSON() : Download complete data as JSON");
        console.log("- exportCurrent() : Download current tab only");
        
        console.log("\n🔍 Data Access:");
        console.log("- showAllResults() : Display summary in console");
        console.log("- getDataForAPI() : Get clean data for copy/paste");
        console.log("- window.twitterExtractor.quotesUsers : Raw quotes data");
        console.log("- window.twitterExtractor.repostsUsers : Raw reposts data");
        
        console.log("\n📝 Example Usage:");
        console.log("1. exportAll() → 'twitter_all_engagement_users.csv'");
        console.log("2. exportSeparately() → 'quotes_users.csv' + 'reposts_users.csv'");
        console.log("3. exportJSON() → Complete data with metadata");
        
        var extractor = window.twitterExtractor;
        if (extractor.quotesUsers.length > 0 || extractor.repostsUsers.length > 0) {
            console.log("\n📈 Current Data:");
            console.log("- Quotes users: " + extractor.quotesUsers.length);
            console.log("- Reposts users: " + extractor.repostsUsers.length);
            
            if (extractor.quotesUsers.length > 0 && extractor.repostsUsers.length > 0) {
                var allUsers = [];
                var duplicates = 0;
                
                allUsers = extractor.quotesUsers.slice();
                for (var i = 0; i < extractor.repostsUsers.length; i++) {
                    var user = extractor.repostsUsers[i];
                    var exists = false;
                    for (var j = 0; j < allUsers.length; j++) {
                        if (allUsers[j].username === user.username) {
                            exists = true;
                            duplicates++;
                            break;
                        }
                    }
                    if (!exists) allUsers.push(user);
                }
                
                console.log("- Total unique: " + allUsers.length);
                console.log("- Duplicates: " + duplicates);
            }
        }
    };
    
    // Auto-show export options when both tabs are done
    window.finalizeExtraction = function() {
        var extractor = window.twitterExtractor;
        if (extractor.quotesUsers.length > 0 && extractor.repostsUsers.length > 0) {
            console.log("\n🎉 EXTRACTION COMPLETE! Both tabs processed.");
            window.showExportOptions();
            console.log("\n💡 Quick Export:");
            console.log("→ exportAll() for most common use");
            console.log("→ exportSeparately() to keep quotes and reposts separate");
        }
    };
    
    // Start first extraction
    currentTab = getCurrentTab();
    console.log("Current tab detected: " + currentTab);
    console.log("Starting extraction in 3 seconds...");
    console.log("Use stopExtraction() to stop anytime");
    console.log("\n💡 Available commands:");
    console.log("- stopExtraction() : Stop current extraction");
    console.log("- showExportOptions() : See all export methods");
    
    setTimeout(performExtraction, 3000);
})();