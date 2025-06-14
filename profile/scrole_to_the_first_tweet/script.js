(function() {
    let scrollCount = 0;
    let lastTweetCount = 0;
    let noNewContentCount = 0;
    let isRunning = true;
    let intervalId;
    let animationId;
    
    console.log("🚀 Starting background-resistant scroll...");
    console.log("⚠️  This version tries to work in background, but may be slower");
    
    // Count tweets with multiple selectors
    function countTweets() {
        const selectors = [
            '[data-testid="tweet"]',
            'article[data-testid="tweet"]',
            '[role="article"]',
            'div[data-testid="cellInnerDiv"]'
        ];
        
        let maxCount = 0;
        selectors.forEach(selector => {
            const count = document.querySelectorAll(selector).length;
            maxCount = Math.max(maxCount, count);
        });
        
        return maxCount;
    }
    
    // Force browser activity to prevent throttling
    function keepAlive() {
        // Tiny DOM manipulation to keep JS active
        document.title = document.title;
        
        // Request next animation frame
        if (isRunning) {
            animationId = requestAnimationFrame(keepAlive);
        }
    }
    
    // Main scroll function using multiple timing methods
    function performScroll() {
        if (!isRunning) return;
        
        const beforeScroll = window.pageYOffset;
        const beforeCount = countTweets();
        
        // Scroll to bottom
        window.scrollTo(0, document.body.scrollHeight);
        scrollCount++;
        
        console.log(`📜 Scroll #${scrollCount} - Tweets: ${beforeCount}`);
        
        // Check for new content after delay
        setTimeout(() => {
            const currentTweetCount = countTweets();
            const scrollAtBottom = (window.innerHeight + window.pageYOffset >= document.body.offsetHeight - 50);
            
            if (currentTweetCount === lastTweetCount && scrollAtBottom) {
                noNewContentCount++;
                console.log(`⏳ No new content (${noNewContentCount}/7) - Tab active: ${!document.hidden}`);
                
                if (noNewContentCount >= 7) {
                    console.log("✅ Finished! Stopping all timers...");
                    stopAllTimers();
                    window.scrollBy(0, -300);
                    return;
                }
            } else {
                noNewContentCount = 0;
                lastTweetCount = currentTweetCount;
                console.log(`✨ New content: ${currentTweetCount} tweets`);
            }
        }, 2000);
    }
    
    // Stop all running timers
    function stopAllTimers() {
        isRunning = false;
        if (intervalId) clearInterval(intervalId);
        if (animationId) cancelAnimationFrame(animationId);
        console.log("🛑 All timers stopped");
    }
    
    // Start multiple timer strategies
    function startScrolling() {
        // Strategy 1: Regular interval (will be throttled in background)
        intervalId = setInterval(performScroll, 3000);
        
        // Strategy 2: Animation frame to keep active
        keepAlive();
        
        // Strategy 3: Immediate start
        performScroll();
        
        console.log("⚡ Multiple timing strategies started");
    }
    
    // Enhanced manual control
    window.stopScrolling = function() {
        stopAllTimers();
        console.log("🛑 Manual stop executed");
    };
    
    window.resumeScrolling = function() {
        if (!isRunning) {
            isRunning = true;
            noNewContentCount = 0;
            console.log("▶️  Resuming with fresh start...");
            startScrolling();
        }
    };
    
    // Force continue even if detected as stuck
    window.forceScroll = function(times = 5) {
        console.log(`🔥 Force scrolling ${times} times...`);
        for (let i = 0; i < times; i++) {
            setTimeout(() => {
                window.scrollTo(0, document.body.scrollHeight);
                console.log(`💪 Force scroll ${i + 1}/${times}`);
            }, i * 1000);
        }
    };
    
    // Visibility change handler
    document.addEventListener('visibilitychange', function() {
        console.log(`👁️  Tab visibility: ${document.hidden ? 'HIDDEN' : 'VISIBLE'}`);
        if (!document.hidden && isRunning) {
            // Give it a boost when tab becomes visible again
            setTimeout(performScroll, 500);
        }
    });
    
    // Start the process
    startScrolling();
    
    console.log("💡 Enhanced commands:");
    console.log("   - stopScrolling() : Stop everything");
    console.log("   - resumeScrolling() : Resume if stopped");
    console.log("   - forceScroll(n) : Force n scrolls immediately");
    console.log("📊 Strategy: Using intervals + animation frames + force scrolling");
})();