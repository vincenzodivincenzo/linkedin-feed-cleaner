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

    // Remove suggested posts - Updated detection methods
    if (config.blockSuggestedPosts) {
      // Method 1: Look for "Suggested" header
      const suggestedHeaders = document.querySelectorAll('span[aria-hidden="true"]');
      suggestedHeaders.forEach(header => {
        if (header.textContent && header.textContent.trim() === 'Suggested') {
          // Find the parent post container
          let postContainer = header.closest('.feed-shared-update-v2') || 
                             header.closest('[data-id*="urn:li:activity"]') ||
                             header.closest('.update-v2-social-activity') ||
                             header.closest('.feed-shared-update');
          
          if (postContainer) {
            postContainer.style.display = 'none';
          }
        }
      });

      // Method 2: Traditional text-based detection (fallback)
      const posts = document.querySelectorAll('.feed-shared-update-v2, [data-id*="urn:li:activity"]');
      posts.forEach(post => {
        try {
          const text = post.textContent || '';
          if (text.includes('Suggested for you') || 
              text.includes('Suggested post') ||
              text.includes('Based on your profile') ||
              text.includes('People in your network') ||
              text.includes('Because you') ||
              text.includes('Similar to posts you\'ve engaged with')) {
            post.style.display = 'none';
          }
        } catch (e) {
          console.warn('LinkedIn Feed Cleaner: Skipped malformed suggested post', e);
        }
      });

      // Method 3: Detection based on post structure without connection indicators
      const allPosts = document.querySelectorAll('.feed-shared-update-v2, [data-id*="urn:li:activity"]');
      allPosts.forEach(post => {
        try {
          // Look for posts that don't have direct connection indicators
          const hasConnectionInfo = post.querySelector('[data-test-id*="connection"]') ||
                                  post.querySelector('.update-components-actor__meta') ||
                                  post.textContent.includes('• 1st') ||
                                  post.textContent.includes('• 2nd') ||
                                  post.textContent.includes('• 3rd') ||
                                  post.textContent.includes('follows');
          
          // Look for posts from outside your network with promotional characteristics
          const hasPromotionalSignals = post.textContent.includes('recommended') ||
                                       post.textContent.includes('trending') ||
                                       post.querySelector('[data-test-id*="follow-button"]');
          
          // If it has promotional signals but no clear connection info, it's likely suggested
          if (hasPromotionalSignals && !hasConnectionInfo) {
            // Additional check: make sure it's not from a company page you follow
            const isFromCompanyPage = post.querySelector('[data-test-id*="company"]') ||
                                    post.textContent.includes('works at') ||
                                    post.textContent.includes('Company');
            
            if (!isFromCompanyPage) {
              post.style.display = 'none';
            }
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

  // Create debounced version of cleanFeed with 500ms throttle delay
  const debouncedCleanFeed = debounce(cleanFeed, 500);

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
