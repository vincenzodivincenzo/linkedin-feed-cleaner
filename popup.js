document.addEventListener('DOMContentLoaded', function() {
  const checkboxes = {
    blockAds: document.getElementById('blockAds'),
    blockSuggestedPosts: document.getElementById('blockSuggestedPosts'),
    hidePromotions: document.getElementById('hidePromotions'),
    hideRightSidebar: document.getElementById('hideRightSidebar'),
    blockReactedPosts: document.getElementById('blockReactedPosts'),
    debugMode: document.getElementById('debugMode')
  };

  const hideAllBtn = document.getElementById('hideAllBtn');
  const resetViewBtn = document.getElementById('btn-reset-view');
  const keywordBlockListElement = document.getElementById('keywordBlockList');

  function loadSettingsFromStorage() {
    chrome.storage.local.get(['config', 'keywordBlockList'], function(result) {
      const settings = result.config || {};
      Object.keys(checkboxes).forEach(key => {
        if (checkboxes[key]) {
          checkboxes[key].checked = settings[key] || false;
        }
      });
      
      if (keywordBlockListElement && result.keywordBlockList) {
        keywordBlockListElement.value = result.keywordBlockList.join(', ');
      }
      
      updateHideAllButton();
    });
  }

  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    if (tabs[0] && tabs[0].url && tabs[0].url.includes('linkedin.com')) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'getSettings' }, function(response) {
        if (chrome.runtime.lastError) {
          loadSettingsFromStorage();
          return;
        }
        
        if (response && response.settings) {
          Object.keys(checkboxes).forEach(key => {
            if (checkboxes[key]) {
              checkboxes[key].checked = response.settings[key] || false;
            }
          });
          
          chrome.storage.local.get(['keywordBlockList'], function(result) {
            if (keywordBlockListElement && result.keywordBlockList) {
              keywordBlockListElement.value = result.keywordBlockList.join(', ');
            }
          });
          
          updateHideAllButton();
        }
      });
    } else {
      loadSettingsFromStorage();
    }
  });

  Object.keys(checkboxes).forEach(key => {
    if (checkboxes[key]) {
      const slider = checkboxes[key].nextElementSibling;
      if (slider && slider.classList.contains('slider')) {
        slider.addEventListener('click', function() {
          checkboxes[key].checked = !checkboxes[key].checked;
          checkboxes[key].dispatchEvent(new Event('change'));
        });
      }
    }
  });

  Object.keys(checkboxes).forEach(key => {
    if (checkboxes[key]) {
      checkboxes[key].addEventListener('change', function() {
        const settings = {};
        Object.keys(checkboxes).forEach(settingKey => {
          if (checkboxes[settingKey]) {
            settings[settingKey] = checkboxes[settingKey].checked;
          }
        });

        chrome.storage.local.set({ config: settings });
        updateHideAllButton();

        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
          if (tabs[0] && tabs[0].url && tabs[0].url.includes('linkedin.com')) {
            chrome.tabs.sendMessage(tabs[0].id, {
              action: 'updateSettings',
              settings: settings
            }, function(response) {
              if (chrome.runtime.lastError) {
                console.log('Content script not available, settings saved to storage');
              }
            });
          }
        });
      });
    }
  });

  function updateHideAllButton() {
    const allChecked = Object.values(checkboxes).every(checkbox => checkbox.checked);
    if (allChecked) {
      hideAllBtn.textContent = 'Show All';
      hideAllBtn.classList.remove('clean-btn');
      hideAllBtn.classList.add('restore-btn');
    } else {
      hideAllBtn.textContent = 'Hide All';
      hideAllBtn.classList.remove('restore-btn');
      hideAllBtn.classList.add('clean-btn');
    }
  }

  hideAllBtn.addEventListener('click', function() {
    const allChecked = Object.values(checkboxes).every(checkbox => checkbox.checked);
    const newValue = !allChecked;
    
    Object.values(checkboxes).forEach(checkbox => {
      checkbox.checked = newValue;
      checkbox.dispatchEvent(new Event('change'));
    });
    
    updateHideAllButton();
  });

  if (keywordBlockListElement) {
    keywordBlockListElement.addEventListener('input', function() {
      const keywords = this.value.split(',').map(k => k.trim()).filter(k => k.length > 0);
      
      chrome.storage.local.set({ keywordBlockList: keywords });
      
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        if (tabs[0] && tabs[0].url && tabs[0].url.includes('linkedin.com')) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: 'updateKeywords',
            keywords: keywords
          });
        }
      });
    });
  }

  resetViewBtn.addEventListener('click', function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (tabs[0] && tabs[0].url && tabs[0].url.includes('linkedin.com')) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'resetView' }, function(response) {
          if (chrome.runtime.lastError) {
            console.log('Content script not available');
          } else {
            console.log('View reset successfully');
          }
        });
      }
    });
  });
}); 
