(function() {
  'use strict';

  // Configuration
  let config = {
    blockAds: true,
    blockSuggestedPosts: true,
    hideRightSidebar: false,
    hidePromotions: true,
    blockReactedPosts: false,
    debugMode: false
  };


  
  // Keyword block list
  let keywordBlockList = [];

  // Load settings from storage
  function loadSettings() {
    chrome.storage.local.get(['config', 'keywordBlockList'], function(result) {
      if (result.config) {
        config = { ...config, ...result.config };
      }
      if (result.keywordBlockList) {
        keywordBlockList = result.keywordBlockList;
      }
      cleanFeed();
    });
  }

  // Save settings to storage
  function saveSettings() {
    chrome.storage.local.set({ 
      config: config, 
      keywordBlockList: keywordBlockList
    });
  }

  // Check if a post is legitimate (should not be blocked)




  // Clear debug styling
  function clearDebugStyling() {
    const debugElements = document.querySelectorAll('[style*="border: 2px solid #e53e3e"]');
    debugElements.forEach(element => {
      element.style.border = '';
      element.style.opacity = '';
    });
  }

  // Restore blocked posts (session-only)


  function cleanFeed() {
    if (!window.location.href.includes('linkedin.com')) return;
    if (window.location.pathname.includes('/posts/') || window.location.pathname.includes('/activity/')) return;
    if (!config.debugMode) clearDebugStyling();



    if (config.blockAds || config.hidePromotions) {
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
            const topSection = post.querySelector('.feed-shared-actor, .update-components-actor')?.textContent || '';
            const subDescription = post.querySelector('.update-components-actor__sub-description')?.textContent || '';
            const isPromoted = topSection.includes('Promoted') || 
                             topSection.includes('Sponsored') ||
                             subDescription.includes('Promoted') ||
                             subDescription.includes('Sponsored') ||
                             post.querySelector('[data-test-id*="promoted"]') ||
                             post.querySelector('[aria-label*="Promoted"]') ||
                             post.querySelector('[aria-label*="Sponsored"]') ||
                             post.querySelector('.update-components-promo');

            if (isPromoted) {
              if (config.debugMode) {
                post.style.border = '2px solid #e53e3e';
                post.style.opacity = '0.7';
                console.log('LinkedIn Cleaner: Blocked promoted post');
              } else {
                post.style.display = 'none';
              }

            }
          } catch (e) {
            console.warn('LinkedIn Feed Cleaner: Skipped malformed post', e);
          }
        });
      });
    }

    if (config.blockSuggestedPosts) {
      const posts = document.querySelectorAll('.feed-shared-update-v2, [data-id*="urn:li:activity"], .update-v2-social-activity, .feed-shared-update');
      posts.forEach(post => {
        const suggestedElements = post.querySelectorAll('*');
        suggestedElements.forEach(element => {
          if (element.textContent && element.textContent.trim() === 'Suggested') {
            if (config.debugMode) {
              post.style.border = '2px solid #e53e3e';
              post.style.opacity = '0.7';
              console.log('LinkedIn Cleaner: Blocked suggested post');
            } else {
              post.style.display = 'none !important';
              post.remove();
            }
          }
        });
      });

      const explicitPosts = document.querySelectorAll('.feed-shared-update-v2, [data-id*="urn:li:activity"], .update-v2-social-activity, .feed-shared-update');
      explicitPosts.forEach(post => {
        try {
          const topSection = post.querySelector('.feed-shared-actor, .update-components-actor')?.textContent || '';
          const lowerTopSection = topSection.toLowerCase();
          const headerText = post.querySelector('.update-components-header__text-view')?.textContent || '';
          const lowerHeaderText = headerText.toLowerCase();
          const isExplicitlySuggested = lowerTopSection.includes('suggested for you') || lowerTopSection.includes('suggested post') || lowerTopSection.includes('based on your profile') || lowerTopSection.includes('similar to posts you\'ve engaged with') || lowerTopSection.includes('recommended for you');
          const isFollowPost = lowerHeaderText.includes('follow') && (lowerHeaderText.includes('connection') || lowerHeaderText.includes('other'));
          
          if (isExplicitlySuggested || isFollowPost) {
            if (config.debugMode) {
              post.style.border = '2px solid #e53e3e';
              post.style.opacity = '0.7';
              console.log('LinkedIn Cleaner: Blocked explicitly suggested post');
            } else {
              post.style.display = 'none !important';
              post.remove();
            }
          }
        } catch (e) {
          console.warn('LinkedIn Feed Cleaner: Skipped malformed suggested post', e);
        }
      });
    }

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

    if (config.blockReactedPosts) blockReactedPosts();
    if (keywordBlockList.length > 0) blockKeywordPosts();
    cleanAdditionalClutter();


  }



  function blockKeywordPosts() {
    try {
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
            const hasBlockedKeyword = keywordBlockList.some(keyword => {
              const trimmedKeyword = keyword.toLowerCase().trim();
              const mainContent = post.querySelector('.feed-shared-text, .update-components-text')?.textContent || '';
              return mainContent.toLowerCase().includes(trimmedKeyword);
            });
            
            if (hasBlockedKeyword) {
              if (config.debugMode) {
                post.style.border = '2px solid #e53e3e';
                post.style.opacity = '0.7';
                console.log('LinkedIn Cleaner: Blocked keyword post');
              } else {
                post.style.display = 'none';
              }
            }
          } catch (e) {
            console.warn('LinkedIn Feed Cleaner: Skipped malformed keyword post', e);
          }
        });
      });
    } catch (e) {
      console.warn('LinkedIn Feed Cleaner: Error blocking keyword posts', e);
    }
  }

  function blockReactedPosts() {
    try {
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
            
            const reactionPatterns = [
              'likes this', 'loved this', 'loves this', 'celebrates this', 'celebrated this',
              'finds this insightful', 'found this insightful', 'supports this', 'supported this',
              'finds this funny', 'found this funny', 'commented on this'
            ];
            
            const hasReactionText = reactionPatterns.some(pattern => {
              // Check in the specific LinkedIn header text view where reaction indicators appear
              const reactionArea = post.querySelector('.update-components-header__text-view')?.textContent || '';
              return reactionArea.toLowerCase().includes(pattern);
            });
            
            if (hasReactionText) {
              if (config.debugMode) {
                post.style.border = '2px solid #e53e3e';
                post.style.opacity = '0.7';
                console.log('LinkedIn Cleaner: Blocked reacted to post');
              } else {
                post.style.display = 'none';
              }
            }
          } catch (e) {
            console.warn('LinkedIn Feed Cleaner: Skipped malformed reacted post', e);
          }
        });
      });
    } catch (e) {
      console.warn('LinkedIn Feed Cleaner: Error blocking reacted posts', e);
    }
  }

  function cleanAdditionalClutter() {
    try {
      const pymkElements = document.querySelectorAll('[data-test-id="pymk-recommendation"]');
      pymkElements.forEach(el => { if (el) el.style.display = 'none'; });

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

      if (config.blockAds) {
        const sponsoredElements = document.querySelectorAll('[data-test-id*="sponsored"], [aria-label*="Promoted"], [aria-label*="Sponsored"]');
        sponsoredElements.forEach(el => { if (el) el.style.display = 'none'; });
      }

      if (config.blockSuggestedPosts) {
        const collaborativeArticles = document.querySelectorAll('[data-test-id*="collaborative-article"]');
        collaborativeArticles.forEach(el => { if (el) el.style.display = 'none'; });

        const trendingElements = document.querySelectorAll('.feed-shared-update-v2, [data-id*="urn:li:activity"], .update-v2-social-activity, .feed-shared-update');
        trendingElements.forEach(el => {
          if (el.textContent && el.textContent.includes('Trending now')) {
            el.style.display = 'none';
          }
        });
      }
    } catch (e) {
      console.warn('LinkedIn Feed Cleaner: Error in additional cleanup', e);
    }
  }

  if (!window.location.pathname.includes('/posts/') && !window.location.pathname.includes('/activity/')) {
    loadSettings();
    function debounce(func, delay) {
      let timeoutId;
      return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
      };
    }
    const debouncedCleanFeed = debounce(cleanFeed, 200);
    const observer = new MutationObserver(function(mutations) { debouncedCleanFeed(); });
    observer.observe(document.body, { childList: true, subtree: true });
  }

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

    if (request.action === 'resetView') {
      // Reload settings and reapply
      loadSettings();
      sendResponse({ success: true });
    }
    if (request.action === 'updateKeywords') {
      keywordBlockList = request.keywords || [];
      saveSettings();
      cleanFeed();
      sendResponse({ success: true });
    }


  });

})();
