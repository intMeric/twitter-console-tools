(function() {
    let scrollCount = 0;
    let lastTweetCount = 0;
    let stagnantChecks = 0;
    let isRunning = true;
    let intervalId;
    let mutationObserver;
    let lastContentHeight = 0;
    let totalTweetsViewed = 0;
    let sessionStartTime = Date.now();

    // Optimized selectors for X/Twitter
    const TWEET_SELECTORS = [
        '[data-testid="tweet"]',
        'article[data-testid="tweet"]',
        '[role="article"][data-testid="tweet"]'
    ];
    
    // Rate limiting protection
    const RATE_LIMITS = {
        maxTweetsPerHour: 2000,     // Conservative limit
        maxScrollsPerMinute: 20,    // Much slower
        minDelayBetweenScrolls: 4000, // 4 seconds minimum
        maxDailyTweets: 80000        // Stay under Twitter limits
    };
    
    // Count tweets efficiently
    function countTweets() {
        return document.querySelectorAll(TWEET_SELECTORS[0]).length;
    }
    
    // Check if we're hitting rate limits
    function checkRateLimits() {
        const currentTweets = countTweets();
        const timeDiff = Date.now() - sessionStartTime;
        const hoursElapsed = timeDiff / (1000 * 60 * 60);
        const tweetsPerHour = currentTweets / Math.max(hoursElapsed, 0.1);
        
        if (currentTweets > RATE_LIMITS.maxDailyTweets) {
            console.log("🛑 Daily tweet limit reached - stopping to avoid rate limit");
            return false;
        }
        
        if (tweetsPerHour > RATE_LIMITS.maxTweetsPerHour) {
            console.log("⏳ Slowing down - approaching hourly rate limit");
            return false;
        }
        
        return true;
    }
    
    // Randomized delays to avoid detection
    function getRandomDelay(base, variance = 0.3) {
        const min = base * (1 - variance);
        const max = base * (1 + variance);
        return Math.random() * (max - min) + min;
    }
    
    // Fast new content detection
    function hasNewContent() {
        const currentHeight = document.body.scrollHeight;
        const currentTweets = countTweets();
        
        // Only count as new if significant change
        if (currentHeight > lastContentHeight + 500 || currentTweets > lastTweetCount + 3) {
            lastContentHeight = currentHeight;
            lastTweetCount = currentTweets;
            return true;
        }
        return false;
    }
    
    // Conservative scrolling to avoid detection
    function conservativeScroll() {
        if (!isRunning || !checkRateLimits()) {
            if (!checkRateLimits()) {
                console.log("⏸️  Pausing for rate limit protection");
                setTimeout(() => {
                    if (isRunning) conservativeScroll();
                }, getRandomDelay(30000)); // Wait 30 seconds
                return;
            }
            return;
        }
        
        const currentScroll = window.pageYOffset;
        const maxScroll = document.body.scrollHeight - window.innerHeight;
        
        // Much smaller, more human-like scroll steps
        const scrollStep = Math.min(window.innerHeight * 0.8, maxScroll - currentScroll);
        
        if (scrollStep > 100) {
            // Smooth, human-like scroll
            window.scrollBy({
                top: scrollStep,
                behavior: 'smooth'
            });
            scrollCount++;
            
            console.log(`📜 Gentle scroll #${scrollCount} - Tweets: ${countTweets()}`);
            
            // Much longer delay with randomization
            const baseDelay = Math.max(RATE_LIMITS.minDelayBetweenScrolls, 3000 + (scrollCount * 100));
            const randomDelay = getRandomDelay(baseDelay, 0.4);
            setTimeout(checkProgress, randomDelay);
        } else {
            // We're near bottom, scroll to end gently
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: 'smooth'
            });
            console.log("📍 Reached bottom - Waiting for content...");
            setTimeout(checkProgress, getRandomDelay(5000)); // Longer wait at bottom
        }
    }
    
    // More patient progress checking
    function checkProgress() {
        if (!isRunning) return;
        
        const isAtBottom = (window.innerHeight + window.pageYOffset >= document.body.offsetHeight - 200);
        const currentTweets = countTweets();
        
        if (hasNewContent()) {
            stagnantChecks = 0;
            console.log(`✨ New content detected: ${currentTweets} tweets`);
            // Continue with longer delay
            setTimeout(conservativeScroll, getRandomDelay(2000));
        } else if (isAtBottom) {
            stagnantChecks++;
            
            // Much more patient: 8-15 checks with very long waits
            const maxChecks = Math.min(15, 8 + Math.floor(scrollCount / 30));
            const baseWait = Math.min(15000, 3000 + (stagnantChecks * 1500));
            const waitTime = getRandomDelay(baseWait, 0.3);
            
            console.log(`⏳ No new content (${stagnantChecks}/${maxChecks}) - Wait: ${Math.round(waitTime/1000)}s`);
            
            if (stagnantChecks >= maxChecks) {
                // Much longer final verification
                console.log("🔍 Final verification... Waiting 20 seconds");
                setTimeout(() => {
                    const finalTweets = countTweets();
                    if (finalTweets === currentTweets && 
                        (window.innerHeight + window.pageYOffset >= document.body.offsetHeight - 100)) {
                        console.log("✅ End of profile confirmed!");
                        stopScrolling();
                        // NO automatic scroll to top - stay where we are
                        return;
                    } else {
                        console.log("🔄 New content found in final check, continuing carefully");
                        stagnantChecks = Math.max(0, stagnantChecks - 3); // Reduce more conservatively
                        setTimeout(conservativeScroll, getRandomDelay(3000));
                    }
                }, 20000); // 20 second final check
                return;
            }
            
            // Force scroll with much longer wait
            setTimeout(() => {
                window.scrollBy({
                    top: 300,
                    behavior: 'smooth'
                });
                setTimeout(() => {
                    window.scrollTo({
                        top: document.body.scrollHeight,
                        behavior: 'smooth'
                    });
                    setTimeout(checkProgress, waitTime);
                }, 1000);
            }, waitTime);
        } else {
            // Continue scrolling
            setTimeout(conservativeScroll, getRandomDelay(3000));
        }
    }
    
    // Much less aggressive mutation observer
    function setupMutationObserver() {
        const timeline = document.querySelector('[data-testid="primaryColumn"]') || 
                        document.querySelector('main') || 
                        document.body;
        
        let lastMutationTime = 0;
        
        mutationObserver = new MutationObserver((mutations) => {
            const now = Date.now();
            // Throttle mutation responses to avoid over-reaction
            if (now - lastMutationTime < 5000) return; // Only react every 5 seconds
            
            let significantChange = false;
            mutations.forEach(mutation => {
                if (mutation.addedNodes.length > 2) { // Only react to significant additions
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1 && node.offsetHeight > 100) {
                            significantChange = true;
                        }
                    });
                }
            });
            
            if (significantChange && isRunning) {
                console.log("🔥 Significant content detected by observer");
                lastMutationTime = now;
                // Only slightly reduce counter, don't reset
                stagnantChecks = Math.max(0, stagnantChecks - 1);
            }
        });
        
        mutationObserver.observe(timeline, {
            childList: true,
            subtree: true,
            attributes: false
        });
    }
    
    // Conservative start function
    function startSafeScrolling() {
        lastContentHeight = document.body.scrollHeight;
        lastTweetCount = countTweets();
        sessionStartTime = Date.now();
        
        // Setup conservative mutation observer
        setupMutationObserver();
        
        // Start with gentle scroll
        setTimeout(conservativeScroll, getRandomDelay(2000));
        
        // Much less frequent backup interval
        intervalId = setInterval(() => {
            if (isRunning && checkRateLimits()) {
                console.log("🔄 Backup interval - Gentle nudge");
                conservativeScroll();
            }
        }, getRandomDelay(20000, 0.5)); // Every 15-25 seconds
        
        console.log("⚡ Safe, rate-limit aware scrolling activated!");
        console.log("🛡️  Protection: Rate limiting + Randomized delays + Human-like behavior");
    }
    
    // Stop function (NO scroll to top!)
    function stopScrolling() {
        isRunning = false;
        if (intervalId) clearInterval(intervalId);
        if (mutationObserver) mutationObserver.disconnect();
        
        const timeElapsed = (Date.now() - sessionStartTime) / 60000; // minutes
        console.log("🛑 Scrolling stopped safely");
        console.log(`📊 Session stats: ${scrollCount} scrolls, ${countTweets()} tweets in ${Math.round(timeElapsed)} minutes`);
        console.log("📍 Staying at current position to avoid detection");
        // NO window.scrollTo(0, 0) here!
    }
    
    // Emergency stop if rate limited
    function emergencyStop() {
        console.log("🚨 EMERGENCY STOP - Rate limit protection");
        stopScrolling();
        // Stay exactly where we are
    }
    
    // Public API
    window.stopScrolling = stopScrolling;
    window.resumeScrolling = startSafeScrolling;
    window.emergencyStop = emergencyStop;
    window.getStats = () => {
        return {
            scrolls: scrollCount,
            tweets: countTweets(),
            timeElapsed: Math.round((Date.now() - sessionStartTime) / 60000),
            tweetsPerMinute: Math.round(countTweets() / Math.max((Date.now() - sessionStartTime) / 60000, 1))
        };
    };
    
    // Monitor for rate limit errors
    window.addEventListener('error', (e) => {
        if (e.message && e.message.includes('429')) {
            console.log("⚠️  Rate limit detected - emergency stop");
            emergencyStop();
        }
    });
    
    // Auto-restart if page becomes visible (but with delay)
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && !isRunning) {
            console.log("👁️  Page visible - delayed restart for safety");
            setTimeout(() => {
                if (!isRunning) startSafeScrolling();
            }, getRandomDelay(10000)); // Wait 7-13 seconds
        }
    });
    
    // Conservative automatic start
    setTimeout(() => {
        startSafeScrolling();
    }, getRandomDelay(3000)); // Random start delay
    
    console.log("💡 Safe commands:");
    console.log("   🛑 stopScrolling() - Safe stop");
    console.log("   ▶️  resumeScrolling() - Safe resume");
    console.log("   🚨 emergencyStop() - Immediate stop");
    console.log("   📊 getStats() - View session stats");
    console.log("🛡️  Protection: Anti-detection + Rate limit safe + No back-to-top");
})();