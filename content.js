(function() {
  'use strict';

  // Configuration
  let config = {
    blockAds: true,
    blockSuggestedPosts: true,
    hideRightSidebar: false,
    hidePromotions: true
  };

  // Load settings from storage
  function loadSettings() {
    chrome.storage.local.get(['config'], function(result) {
      if (result.config) {
        config = { ...config, ...result.config };
      }
      cleanFeed();
    });
  }

  // Save settings to storage
  function saveSettings() {
    chrome.storage.local.set({ config: config });
  }

  // Clean the LinkedIn feed
  function cleanFeed() {
    if (!window.location.href.includes('linkedin.com')) return;

    // Remove promoted/sponsored posts - comprehensive selectors
    if (config.blockAds || config.hidePromotions) {
      // Multiple selectors for different LinkedIn layouts
      const postSelectors = [
        '.feed-shared-update-v2',
        '[data-id*="urn:li:activity"]',
        '.update-v2-social-activity',
        '.feed-shared-update'
      ];
      
      postSelectors.forEach(selector => {
        const posts = document.querySelectorAll(selector);
        posts.forEach(post => {
          try {
            const text = post.textContent || '';
            const isPromoted = text.includes('Promoted') || 
                             text.includes('Sponsored') ||
                             post.querySelector('[data-test-id*="promoted"]') ||
                             post.querySelector('[aria-label*="Promoted"]') ||
                             post.querySelector('[aria-label*="Sponsored"]') ||
                             post.querySelector('.update-components-promo');

            if (isPromoted) {
              post.style.display = 'none';
            }
          } catch (e) {
            console.warn('LinkedIn Feed Cleaner: Skipped malformed post', e);
          }
        });
      });
    }

    // Remove suggested posts - Comprehensive detection methods
    if (config.blockSuggestedPosts) {
      // Method 1: Direct "Suggested" text detection (most reliable)
      const allElements = document.querySelectorAll('*');
      allElements.forEach(element => {
        if (element.textContent && element.textContent.trim() === 'Suggested') {
          // Find the parent post container
          let postContainer = element.closest('.feed-shared-update-v2') || 
                             element.closest('[data-id*="urn:li:activity"]') ||
                             element.closest('.update-v2-social-activity') ||
                             element.closest('.feed-shared-update') ||
                             element.closest('div[data-id]') ||
                             element.closest('article') ||
                             element.closest('[role="article"]');
          
          if (postContainer) {
            postContainer.style.display = 'none !important';
            postContainer.remove(); // More aggressive removal
          }
        }
      });

      // Method 2: Look for Follow buttons in posts (strong indicator of suggested content)
      const followButtons = document.querySelectorAll('button[aria-label*="Follow"], button[data-control-name*="follow"]');
      followButtons.forEach(button => {
        const postContainer = button.closest('.feed-shared-update-v2') || 
                             button.closest('[data-id*="urn:li:activity"]') ||
                             button.closest('.update-v2-social-activity') ||
                             button.closest('.feed-shared-update') ||
                             button.closest('div[data-id]') ||
                             button.closest('article');
        
        if (postContainer) {
          // Check if this is actually a suggested post, not just a company page you don't follow
          const hasConnectionIndicator = postContainer.textContent.includes('• 1st') ||
                                        postContainer.textContent.includes('• 2nd') ||
                                        postContainer.textContent.includes('• 3rd') ||
                                        postContainer.textContent.includes('follows you') ||
                                        postContainer.textContent.includes('connections');
          
          if (!hasConnectionIndicator) {
            postContainer.style.display = 'none !important';
            postContainer.remove();
          }
        }
      });

      // Method 3: Text-based detection for various suggestion phrases
      const posts = document.querySelectorAll('.feed-shared-update-v2, [data-id*="urn:li:activity"], div[data-id], article');
      posts.forEach(post => {
        try {
          const text = post.textContent || '';
          const lowerText = text.toLowerCase();
          
          if (lowerText.includes('suggested for you') || 
              lowerText.includes('suggested post') ||
              lowerText.includes('based on your profile') ||
              lowerText.includes('people in your network') ||
              lowerText.includes('because you') ||
              lowerText.includes('similar to posts you\'ve engaged with') ||
              lowerText.includes('recommended for you') ||
              text.includes('Suggested')) {
            post.style.display = 'none !important';
            post.remove();
          }
        } catch (e) {
          console.warn('LinkedIn Feed Cleaner: Skipped malformed suggested post', e);
        }
      });

      // Method 4: Remove posts without clear network connections
      const allPosts = document.querySelectorAll('.feed-shared-update-v2, [data-id*="urn:li:activity"], div[data-id]');
      allPosts.forEach(post => {
        try {
          const text = post.textContent || '';
          
          // Check for connection indicators
          const hasConnectionInfo = text.includes('• 1st') ||
                                  text.includes('• 2nd') ||
                                  text.includes('• 3rd') ||
                                  text.includes('follows you') ||
                                  text.includes('connections') ||
                                  text.includes('mutual connections') ||
                                  post.querySelector('[data-test-id*="connection"]');
          
          // Check for follow button (indicator of non-connection)
          const hasFollowButton = post.querySelector('button[aria-label*="Follow"]') ||
                                 post.querySelector('button[data-control-name*="follow"]') ||
                                 text.includes('Follow');
          
          // If it has a follow button but no connection info, it's likely suggested
          if (hasFollowButton && !hasConnectionInfo) {
            post.style.display = 'none !important';
            post.remove();
          }
        } catch (e) {
          console.warn('LinkedIn Feed Cleaner: Skipped malformed network post', e);
        }
      });
    }

    // Hide right sidebar
    if (config.hideRightSidebar) {
      const sidebarSelectors = [
        '.scaffold-layout__aside',
        '.scaffold-layout-toolbar',
        '[data-test-id="right-rail"]'
      ];
      
      sidebarSelectors.forEach(selector => {
        const sidebars = document.querySelectorAll(selector);
        sidebars.forEach(sidebar => {
          try {
            sidebar.style.display = 'none';
          } catch (e) {
            console.warn('LinkedIn Feed Cleaner: Could not hide sidebar', e);
          }
        });
      });
    }

    // Additional cleanup for common LinkedIn clutter
    cleanAdditionalClutter();
  }

  // Remove additional LinkedIn clutter
  function cleanAdditionalClutter() {
    try {
      // Remove "People you may know" sections
      const pymkElements = document.querySelectorAll('[data-test-id="pymk-recommendation"]');
      pymkElements.forEach(el => {
        if (el) el.style.display = 'none';
      });

      // Remove newsletter subscriptions prompts
      const newsArticles = document.querySelectorAll('.feed-shared-news-article');
      newsArticles.forEach(article => {
        try {
          const subscribeText = article.textContent ? article.textContent.toLowerCase() : '';
          if (subscribeText.includes('subscribe') || subscribeText.includes('newsletter')) {
            article.style.display = 'none';
          }
        } catch (e) {
          console.warn('LinkedIn Feed Cleaner: Skipped newsletter cleanup', e);
        }
      });

      // Clean up sponsored content in different formats
      if (config.blockAds) {
        const sponsoredElements = document.querySelectorAll('[data-test-id*="sponsored"], [aria-label*="Promoted"], [aria-label*="Sponsored"]');
        sponsoredElements.forEach(el => {
          if (el) el.style.display = 'none';
        });
      }

      // Remove collaborative articles and trending posts
      if (config.blockSuggestedPosts) {
        const collaborativeArticles = document.querySelectorAll('[data-test-id*="collaborative-article"]');
        collaborativeArticles.forEach(el => {
          if (el) el.style.display = 'none';
        });

        // Remove trending hashtag sections
        const trendingElements = document.querySelectorAll('*');
        trendingElements.forEach(el => {
          if (el.textContent && el.textContent.includes('Trending now')) {
            const container = el.closest('.feed-shared-update-v2') || 
                            el.closest('[data-id*="urn:li:activity"]') ||
                            el.closest('.scaffold-finite-scroll__content > div');
            if (container) {
              container.style.display = 'none';
            }
          }
        });
      }
    } catch (e) {
      console.warn('LinkedIn Feed Cleaner: Error in additional cleanup', e);
    }
  }

  // Initialize
  loadSettings();

  // Debounce function to limit cleanFeed execution frequency
  function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

  // Create debounced version of cleanFeed with 200ms throttle delay for faster response
  const debouncedCleanFeed = debounce(cleanFeed, 200);

  // Watch for dynamic content changes
  const observer = new MutationObserver(function(mutations) {
    debouncedCleanFeed();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Listen for settings updates from popup
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'updateSettings') {
      config = { ...config, ...request.settings };
      saveSettings();
      cleanFeed();
      sendResponse({ success: true });
    }
    if (request.action === 'getSettings') {
      sendResponse({ settings: config });
    }
  });

})();
