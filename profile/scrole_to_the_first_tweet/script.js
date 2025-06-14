// Twitter Profile Auto-Scroll Script
// Execute in browser console (F12) on any Twitter profile page

// Display available options
console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    🐦 TWITTER AUTO-SCROLL 🐦                 ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  📋 Available Methods:                                       ║
║                                                              ║
║  1️⃣  normalScroll()     - Safe speed (1.5s intervals)       ║
║      ├─ Recommended for most users                          ║
║      ├─ Less likely to trigger rate limits                  ║
║      └─ Good for long timelines                             ║
║                                                              ║
║  2️⃣  fastScroll()       - Fast speed (0.5s intervals)       ║
║      ├─ For when you're in a hurry                          ║
║      ├─ May trigger Twitter rate limits                     ║
║      └─ Best for shorter timelines                          ║
║                                                              ║
║  3️⃣  ultraFastScroll()  - Maximum speed (0.2s intervals)    ║
║      ├─ Experimental - use with caution                     ║
║      ├─ High risk of rate limiting                          ║
║      └─ Only for small profiles                             ║
║                                                              ║
║  🛑 Emergency Stop:     stopScroll()                        ║
║                                                              ║
╠══════════════════════════════════════════════════════════════╣
║  💡 Usage: Type the method name in console and press Enter  ║
║     Example: normalScroll()                                 ║
╚══════════════════════════════════════════════════════════════╝
`);

// Method 1: Normal speed scrolling
function normalScroll() {
    let scrollCount = 0;
    let lastHeight = document.body.scrollHeight;
    let noNewContentCount = 0;
    
    console.log("🚀 Starting normal speed auto-scroll...");
    
    const scrollInterval = setInterval(() => {
        // Scroll to bottom
        window.scrollTo(0, document.body.scrollHeight);
        scrollCount++;
        
        console.log(`📜 Scroll #${scrollCount}`);
        
        // Wait for content to load
        setTimeout(() => {
            const newHeight = document.body.scrollHeight;
            
            // Check if we've reached the end
            if (newHeight === lastHeight) {
                noNewContentCount++;
                console.log(`⏳ No new content detected (${noNewContentCount}/3)`);
                
                // Stop if no new content for 3 consecutive checks
                if (noNewContentCount >= 3) {
                    clearInterval(scrollInterval);
                    console.log("✅ End of timeline reached!");
                    console.log(`📊 Total scrolls: ${scrollCount}`);
                    return;
                }
            } else {
                // New content detected, reset counter
                noNewContentCount = 0;
                lastHeight = newHeight;
                console.log("🔄 New content loaded, continuing...");
            }
        }, 1000); // Wait 1 second for loading
        
    }, 1500); // Scroll every 1.5 seconds
    
    // Store interval for emergency stop
    window.currentScrollInterval = scrollInterval;
}

// Method 2: Fast speed scrolling
function fastScroll() {
    let scrollCount = 0;
    let lastHeight = document.body.scrollHeight;
    let noNewContentCount = 0;
    
    console.log("🚀 Starting FAST auto-scroll...");
    console.log("⚠️  Warning: May trigger Twitter rate limits");
    
    const scrollInterval = setInterval(() => {
        window.scrollTo(0, document.body.scrollHeight);
        scrollCount++;
        
        // Log every 10 scrolls to reduce console spam
        if (scrollCount % 10 === 0) {
            console.log(`📜 Scroll #${scrollCount}`);
        }
        
        setTimeout(() => {
            const newHeight = document.body.scrollHeight;
            
            if (newHeight === lastHeight) {
                noNewContentCount++;
                
                // Require 5 checks for fast mode (more scrolls = more checks needed)
                if (noNewContentCount >= 5) {
                    clearInterval(scrollInterval);
                    console.log("✅ End of timeline reached!");
                    console.log(`📊 Total scrolls: ${scrollCount}`);
                    return;
                }
            } else {
                noNewContentCount = 0;
                lastHeight = newHeight;
            }
        }, 300); // Shorter wait time
        
    }, 500); // Scroll every 0.5 seconds
    
    window.currentScrollInterval = scrollInterval;
}

// Method 3: Ultra-fast scrolling (experimental)
function ultraFastScroll() {
    let scrollCount = 0;
    let lastHeight = document.body.scrollHeight;
    let noNewContentCount = 0;
    
    console.log("🚀 Starting ULTRA-FAST auto-scroll...");
    console.log("⚠️  WARNING: High risk of rate limiting!");
    console.log("💡 Recommended only for small profiles");
    
    const scrollInterval = setInterval(() => {
        window.scrollTo(0, document.body.scrollHeight);
        scrollCount++;
        
        // Log every 20 scrolls to reduce console spam
        if (scrollCount % 20 === 0) {
            console.log(`📜 Scroll #${scrollCount}`);
        }
        
        setTimeout(() => {
            const newHeight = document.body.scrollHeight;
            
            if (newHeight === lastHeight) {
                noNewContentCount++;
                
                if (noNewContentCount >= 8) {
                    clearInterval(scrollInterval);
                    console.log("✅ End of timeline reached!");
                    console.log(`📊 Total scrolls: ${scrollCount}`);
                    return;
                }
            } else {
                noNewContentCount = 0;
                lastHeight = newHeight;
            }
        }, 100); // Very short wait time
        
    }, 200); // Scroll every 0.2 seconds
    
    window.currentScrollInterval = scrollInterval;
}

// Emergency stop function
function stopScroll() {
    if (window.currentScrollInterval) {
        clearInterval(window.currentScrollInterval);
        console.log("🛑 Scrolling stopped manually!");
        window.currentScrollInterval = null;
    } else {
        console.log("ℹ️  No active scrolling to stop");
    }
}

// Show instructions again
function scrollhowHelp() {
    console.log(`
📋 Available Commands:
• normalScroll()     - Start normal speed scrolling
• fastScroll()       - Start fast speed scrolling  
• ultraFastScroll()  - Start ultra-fast scrolling
• stopScroll()       - Emergency stop
• showHelp()         - Show this help again
    `);
}

console.log("✅ Script loaded! Choose your scrolling method above.");
console.log("💡 Type showHelp() to see commands again.");