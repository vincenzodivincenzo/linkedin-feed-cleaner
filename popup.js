document.addEventListener('DOMContentLoaded', function() {
  const checkboxes = {
    blockAds: document.getElementById('blockAds'),
    blockSuggestedPosts: document.getElementById('blockSuggestedPosts'),
    hidePromotions: document.getElementById('hidePromotions'),
    hideRightSidebar: document.getElementById('hideRightSidebar')
  };

  const hideAllBtn = document.getElementById('hideAllBtn');

  // Load settings from storage as fallback and primary source
  function loadSettingsFromStorage() {
    chrome.storage.local.get(['config'], function(result) {
      const settings = result.config || {};
      Object.keys(checkboxes).forEach(key => {
        if (checkboxes[key]) {
          checkboxes[key].checked = settings[key] || false;
        }
      });
      updateHideAllButton();
    });
  }

  // Load current settings
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    if (tabs[0] && tabs[0].url && tabs[0].url.includes('linkedin.com')) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'getSettings' }, function(response) {
        if (chrome.runtime.lastError) {
          // Content script not available, load from storage
          loadSettingsFromStorage();
          return;
        }
        
        if (response && response.settings) {
          Object.keys(checkboxes).forEach(key => {
            if (checkboxes[key]) {
              checkboxes[key].checked = response.settings[key] || false;
            }
          });
          updateHideAllButton();
        }
      });
    } else {
      // Not on LinkedIn, just load from storage
      loadSettingsFromStorage();
    }
  });

  // Add click handlers to toggle sliders
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

  // Save settings when changed
  Object.keys(checkboxes).forEach(key => {
    if (checkboxes[key]) {
      checkboxes[key].addEventListener('change', function() {
        const settings = {};
        Object.keys(checkboxes).forEach(settingKey => {
          if (checkboxes[settingKey]) {
            settings[settingKey] = checkboxes[settingKey].checked;
          }
        });

        // Always save to storage
        chrome.storage.local.set({ config: settings });

        // Update Hide All button state
        updateHideAllButton();

        // Also try to update content script if on LinkedIn
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
          if (tabs[0] && tabs[0].url && tabs[0].url.includes('linkedin.com')) {
            chrome.tabs.sendMessage(tabs[0].id, {
              action: 'updateSettings',
              settings: settings
            }, function(response) {
              // Ignore errors here since storage is the primary persistence
              if (chrome.runtime.lastError) {
                console.log('Content script not available, settings saved to storage');
              }
            });
          }
        });
      });
    }
  });

  // Update Hide All button appearance based on current settings
  function updateHideAllButton() {
    const allChecked = Object.values(checkboxes).every(checkbox => checkbox.checked);
    if (allChecked) {
      hideAllBtn.textContent = 'Show All';
      hideAllBtn.classList.add('all-hidden');
    } else {
      hideAllBtn.textContent = 'Hide All';
      hideAllBtn.classList.remove('all-hidden');
    }
  }

  // Handle Hide All button click
  hideAllBtn.addEventListener('click', function() {
    const allChecked = Object.values(checkboxes).every(checkbox => checkbox.checked);
    const newValue = !allChecked;
    
    Object.values(checkboxes).forEach(checkbox => {
      checkbox.checked = newValue;
      checkbox.dispatchEvent(new Event('change'));
    });
    
    updateHideAllButton();
  });
}); 
