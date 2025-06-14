(function() {
    let scrollCount = 0;
    let lastTweetCount = 0;
    let stagnantChecks = 0;
    let isRunning = true;
    let intervalId;
    let mutationObserver;
    let lastContentHeight = 0;
    
    
    // Optimized selectors for X/Twitter
    const TWEET_SELECTORS = [
        '[data-testid="tweet"]',
        'article[data-testid="tweet"]',
        '[role="article"][data-testid="tweet"]'
    ];
    
    // Count tweets efficiently
    function countTweets() {
        return document.querySelectorAll(TWEET_SELECTORS[0]).length;
    }
    
    // Fast new content detection
    function hasNewContent() {
        const currentHeight = document.body.scrollHeight;
        const currentTweets = countTweets();
        
        if (currentHeight > lastContentHeight || currentTweets > lastTweetCount) {
            lastContentHeight = currentHeight;
            lastTweetCount = currentTweets;
            return true;
        }
        return false;
    }
    
    function aggressiveScroll() {
        if (!isRunning) return;
        
        const currentScroll = window.pageYOffset;
        const maxScroll = document.body.scrollHeight - window.innerHeight;
        
        // Scroll in big chunks for speed, but adaptive
        const baseStep = window.innerHeight * 1.5;
        const adaptiveStep = Math.min(baseStep, maxScroll - currentScroll);
        
        if (adaptiveStep > 100) {
            window.scrollBy(0, adaptiveStep);
            scrollCount++;
            
            console.log(`📜 Scroll #${scrollCount} - Tweets: ${countTweets()}`);
            
            // Adaptive delay: the more we've scrolled, the longer we wait
            const checkDelay = Math.min(1000, 300 + (scrollCount > 50 ? 200 : 0));
            setTimeout(checkProgress, checkDelay);
        } else {
            // We're near the bottom, scroll to the end and wait longer
            window.scrollTo(0, document.body.scrollHeight);
            console.log("📍 Scrolled to bottom - Waiting for content to load...");
            setTimeout(checkProgress, 1500); // Longer wait at bottom
        }
    }
    
    // Progress check with progressive patience
    function checkProgress() {
        if (!isRunning) return;
        
        const isAtBottom = (window.innerHeight + window.pageYOffset >= document.body.offsetHeight - 100);
        const currentTweets = countTweets();
        
        if (hasNewContent()) {
            stagnantChecks = 0;
            console.log(`✨ New content detected: ${currentTweets} tweets`);
            // Continue immediately
            setTimeout(aggressiveScroll, 100);
        } else if (isAtBottom) {
            stagnantChecks++;
            
            // Progressive waiting: the more we wait, the more patient we become
            const maxChecks = Math.min(12, 5 + Math.floor(scrollCount / 20)); // Increases with scroll count
            const waitTime = Math.min(8000, 1500 + (stagnantChecks * 800)); // Progressive wait
            
            console.log(`⏳ No new content (${stagnantChecks}/${maxChecks}) - Wait time: ${waitTime}ms`);
            
            if (stagnantChecks >= maxChecks) {
                // Final verification with long delay
                console.log("🔍 Final verification... Waiting 10 seconds");
                setTimeout(() => {
                    const finalTweets = countTweets();
                    if (finalTweets === currentTweets && 
                        (window.innerHeight + window.pageYOffset >= document.body.offsetHeight - 50)) {
                        console.log("✅ End of profile confirmed after final verification!");
                        stopScrolling();
                        window.scrollTo(0, 0); // Back to top
                    } else {
                        console.log("🔄 New tweets found during final verification, continuing!");
                        stagnantChecks = 0;
                        setTimeout(aggressiveScroll, 500);
                    }
                }, 10000);
                return;
            }
            
            // Force scroll with progressive waiting
            setTimeout(() => {
                window.scrollBy(0, 500);
                // Double scroll to be sure
                setTimeout(() => {
                    window.scrollTo(0, document.body.scrollHeight);
                    setTimeout(checkProgress, waitTime);
                }, 500);
            }, waitTime);
        } else {
            // Continue scrolling
            setTimeout(aggressiveScroll, 200);
        }
    }
    
    // Observe DOM mutations to detect new content instantly
    function setupMutationObserver() {
        const timeline = document.querySelector('[data-testid="primaryColumn"]') || 
                        document.querySelector('main') || 
                        document.body;
        
        mutationObserver = new MutationObserver((mutations) => {
            let hasNewTweets = false;
            let newContentDetected = false;
            
            mutations.forEach(mutation => {
                if (mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) {
                            // Broader detection of new content
                            if ((node.matches && node.matches('[data-testid="tweet"]')) ||
                                (node.querySelector && node.querySelector('[data-testid="tweet"]')) ||
                                (node.matches && node.matches('[data-testid="cellInnerDiv"]')) ||
                                (node.querySelector && node.querySelector('[data-testid="cellInnerDiv"]'))) {
                                hasNewTweets = true;
                            }
                            
                            // General detection of new content
                            if (node.offsetHeight > 50 || node.children.length > 0) {
                                newContentDetected = true;
                            }
                        }
                    });
                }
            });
            
            if ((hasNewTweets || newContentDetected) && isRunning) {
                console.log("🔥 New content detected by MutationObserver");
                stagnantChecks = Math.max(0, stagnantChecks - 2); // Reduce counter
                
                // Small delay to let content load completely
                setTimeout(() => {
                    lastContentHeight = document.body.scrollHeight;
                    lastTweetCount = countTweets();
                }, 300);
            }
        });
        
        mutationObserver.observe(timeline, {
            childList: true,
            subtree: true,
            attributes: false // Only monitor additions/removals
        });
    }
    
    // Optimized start function
    function startFastScrolling() {
        lastContentHeight = document.body.scrollHeight;
        lastTweetCount = countTweets();
        
        // Setup mutation observer for instant detection
        setupMutationObserver();
        
        // Start with immediate scroll
        aggressiveScroll();
        
        // Less frequent backup interval (more patient)
        intervalId = setInterval(() => {
            if (isRunning) {
                console.log("🔄 Backup interval - Force scroll");
                aggressiveScroll();
            }
        }, 4000);
        
        console.log("⚡ Patient and intelligent scrolling activated!");
        console.log("🧠 Progressive waiting: 5-12 checks depending on profile size");
    }
    
    // Stop function
    function stopScrolling() {
        isRunning = false;
        if (intervalId) clearInterval(intervalId);
        if (mutationObserver) mutationObserver.disconnect();
        
        console.log("🛑 Scrolling stopped");
        console.log(`📊 Total: ${scrollCount} scrolls, ${countTweets()} tweets found`);
    }
    
    // Turbo mode for even faster scrolling
    function turboMode() {
        console.log("🔥 TURBO MODE ACTIVATED!");
        isRunning = true;
        
        const turboScroll = () => {
            if (!isRunning) return;
            
            window.scrollBy(0, window.innerHeight * 3);
            
            setTimeout(() => {
                if (window.innerHeight + window.pageYOffset >= document.body.offsetHeight - 50) {
                    const newTweets = countTweets();
                    if (newTweets === lastTweetCount) {
                        console.log("✅ Turbo mode completed!");
                        stopScrolling();
                        return;
                    }
                    lastTweetCount = newTweets;
                }
                
                setTimeout(turboScroll, 50); // Very fast!
            }, 200);
        };
        
        turboScroll();
    }
    
    // Public API
    window.stopScrolling = stopScrolling;
    window.resumeScrolling = startFastScrolling;
    window.turboMode = turboMode;
    
    // Auto-restart if page becomes visible
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && !isRunning) {
            console.log("👁️ Page visible - auto restart");
            startFastScrolling();
        }
    });
    
    // Automatic start
    startFastScrolling();
    
    console.log("💡 Available commands:");
    console.log("   🛑 stopScrolling() - Stop");
    console.log("   ▶️  resumeScrolling() - Resume");
    console.log("   🔥 turboMode() - Ultra-fast mode");
    console.log("📈 Optimizations: MutationObserver + Progressive patience + Final verification");
})();