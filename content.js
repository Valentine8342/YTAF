// ==UserScript==
// @name         youtube-videorestore
// @namespace    https://github.com/Valentine8342/YT-BLOCK
// @version      6.20
// @description  A script to remove YouTube ads, including static ads and video ads, without interfering with the network and ensuring safety.
// @match        *://*.youtube.com/*
// @exclude      *://accounts.youtube.com/*
// @exclude      *://www.youtube.com/live_chat_replay*
// @exclude      *://www.youtube.com/persist_identity*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=YouTube.com
// @grant        none
// @license MIT
// @downloadURL  https://update.greasyfork.org/scripts/459541/YouTube%E5%8E%BB%E5%B9%BF%E5%91%8A.user.js
// @updateURL    https://update.greasyfork.org/scripts/459541/YouTube%E5%8E%BB%E5%B9%BF%E5%91%8A.meta.js
// ==/UserScript==

(function() {
    'use strict';

    let video;
    // Ad selectors
    const cssSelectorArr = [
      '#masthead-ad', // Top banner ad on homepage
      'ytd-rich-item-renderer.style-scope.ytd-rich-grid-row #content:has(.ytd-display-ad-renderer)', // Video layout ad on homepage
      '.video-ads.ytp-ad-module', // Bottom ad in player
      'tp-yt-paper-dialog:has(yt-mealbar-promo-renderer)', // Membership promotion ad on player page
      'ytd-engagement-panel-section-list-renderer[target-id="engagement-panel-ads"]', // Recommended ad on top right of player page
      '#related #player-ads', // Promotional ad on right side of comments section on player page
      '#related ytd-ad-slot-renderer', // Video layout ad on right side of comments section on player page
      'ytd-ad-slot-renderer', // Ad on search page
      'yt-mealbar-promo-renderer', // Membership recommendation ad on player page
      'ytd-popup-container:has(a[href="/premium"])', // Membership interception ad
      'ad-slot-renderer', // Third-party recommended ad on mobile player page
      'ytm-companion-ad-renderer', // Skippable video ad link on mobile
    ];
    window.dev = false; // Development use

    /**
     * Format standard time
     * @param {Date} time Standard time
     * @param {String} format Format
     * @return {String}
     */
    function moment(time) {
      // Get year, month, day, hour, minute, second
      let y = time.getFullYear();
      let m = (time.getMonth() + 1).toString().padStart(2, '0');
      let d = time.getDate().toString().padStart(2, '0');
      let h = time.getHours().toString().padStart(2, '0');
      let min = time.getMinutes().toString().padStart(2, '0');
      let s = time.getSeconds().toString().padStart(2, '0');
      return `${y}-${m}-${d} ${h}:${min}:${s}`;
    }

    /**
     * Log information
     * @param {String} msg Information
     * @return {undefined}
     */
    function log(msg) {
      if (!window.dev) {
        return false;
      }
      console.log(window.location.href);
      console.log(`${moment(new Date())}  ${msg}`);
    }

    /**
     * Set run flag
     * @param {String} name
     * @return {undefined}
     */
    function setRunFlag(name) {
      let style = document.createElement('style');
      style.id = name;
      (document.head || document.body).appendChild(style); // Append node to HTML
    }

    /**
     * Get run flag
     * @param {String} name
     * @return {undefined|Element}
     */
    function getRunFlag(name) {
      return document.getElementById(name);
    }

    /**
     * Check if run flag is set
     * @param {String} name
     * @return {Boolean}
     */
    function checkRunFlag(name) {
      if (getRunFlag(name)) {
        return true;
      } else {
        setRunFlag(name);
        return false;
      }
    }

    /**
     * Generate and append CSS element to remove ads to HTML node
     * @param {String} styles Style text
     * @return {undefined}
     */
    function generateRemoveADHTMLElement(id) {
      // If already set, exit
      if (checkRunFlag(id)) {
        log('Ad removal node already generated');
        return false;
      }

      // Set ad removal styles
      let style = document.createElement('style'); // Create style element
      (document.head || document.body).appendChild(style); // Append node to HTML
      style.appendChild(document.createTextNode(generateRemoveADCssText(cssSelectorArr))); // Append style node to element node
      log('Ad removal node generated successfully');
    }

    /**
     * Generate CSS text to remove ads
     * @param {Array} cssSelectorArr Array of CSS selectors to set
     * @return {String}
     */
    function generateRemoveADCssText(cssSelectorArr) {
      cssSelectorArr.forEach((selector, index) => {
        cssSelectorArr[index] = `${selector}{display:none!important}`; // Iterate and set styles
      });
      return cssSelectorArr.join(' '); // Concatenate into string
    }

    /**
     * Touch event
     * @return {undefined}
     */
    function nativeTouch() {
      // Create Touch object
      let touch = new Touch({
        identifier: Date.now(),
        target: this,
        clientX: 12,
        clientY: 34,
        radiusX: 56,
        radiusY: 78,
        rotationAngle: 0,
        force: 1
      });

      // Create TouchEvent object
      let touchStartEvent = new TouchEvent('touchstart', {
        bubbles: true,
        cancelable: true,
        view: window,
        touches: [touch],
        targetTouches: [touch],
        changedTouches: [touch]
      });

      // Dispatch touchstart event to target element
      this.dispatchEvent(touchStartEvent);

      // Create TouchEvent object
      let touchEndEvent = new TouchEvent('touchend', {
        bubbles: true,
        cancelable: true,
        view: window,
        touches: [],
        targetTouches: [],
        changedTouches: [touch]
      });

      // Dispatch touchend event to target element
      this.dispatchEvent(touchEndEvent);
    }

    /**
     * Get video DOM
     * @return {undefined}
     */
    function getVideoDom() {
      video = document.querySelector('.ad-showing video') || document.querySelector('video');
    }

    /**
     * Auto play after ad
     * @return {undefined}
     */
    function playAfterAd() {
      if (video && video.paused && video.currentTime < 1) {
        video.play();
        log('Auto-playing video');
      }
    }

    /**
     * Remove YouTube ad interception popup and close overlay
     * @return {undefined}
     */
    function closeOverlay() {
      // Remove YouTube ad interception popup
      const premiumContainers = [...document.querySelectorAll('ytd-popup-container')];
      const matchingContainers = premiumContainers.filter(container => container.querySelector('a[href="/premium"]'));

      if (matchingContainers.length > 0) {
        matchingContainers.forEach(container => container.remove());
        log('Removed YouTube interceptor');
      }

      // Get all elements with specified tag
      const backdrops = document.querySelectorAll('tp-yt-iron-overlay-backdrop');
      // Find element with specific style
      const targetBackdrop = Array.from(backdrops).find(
        (backdrop) => backdrop.style.zIndex === '2201'
      );
      // If found, clear its class and remove open attribute
      if (targetBackdrop) {
        targetBackdrop.className = ''; // Clear all classes
        targetBackdrop.removeAttribute('opened'); // Remove open attribute
        log('Closed overlay');
      }
    }

    /**
     * Skip ad
     * @return {undefined}
     */
    function skipAd(mutationsList, observer) {
      const skipButton = document.querySelector('.ytp-ad-skip-button') || document.querySelector('.ytp-skip-ad-button') || document.querySelector('.ytp-ad-skip-button-modern');
      const shortAdMsg = document.querySelector('.video-ads.ytp-ad-module .ytp-ad-player-overlay') || document.querySelector('.ytp-ad-button-icon');

      if ((skipButton || shortAdMsg) && window.location.href.indexOf('https://m.youtube.com/') === -1 && video) { // Mobile mute bug
        video.muted = true;
      }

      if (skipButton) {
        const delayTime = 0.5;
        setTimeout(skipAd, delayTime * 1000); // If click and call do not skip, directly change ad time
        if (video && video.currentTime > delayTime) {
          video.currentTime = video.duration; // Force
          log('Special account skipped button ad');
          return;
        }
        skipButton.click(); // PC
        nativeTouch.call(skipButton); // Phone
        log('Button skipped ad');
      } else if (shortAdMsg && video) {
        video.currentTime = video.duration; // Force
        log('Forced end of ad');
      }
    }

    /**
     * Replace ad videos with normal videos
     * @return {undefined}
     */
    function replaceAdVideos() {
      const adVideos = document.querySelectorAll('ytd-rich-item-renderer:has(ytd-ad-slot-renderer)');
      console.log(`Found ${adVideos.length} ad videos`);

      if (adVideos.length > 0) {
        const regularVideoItems = Array.from(document.querySelectorAll('ytd-rich-item-renderer'))
          .filter(item => !item.querySelector('ytd-ad-slot-renderer'));

        adVideos.forEach((adVideo, index) => {
          console.log(`Replacing ad video ${index + 1}`);

          const randomVideoItem = regularVideoItems[Math.floor(Math.random() * regularVideoItems.length)];

          if (randomVideoItem) {
            const videoLink = randomVideoItem.querySelector('a#video-title-link');
            if (videoLink && videoLink.href) {
              const videoId = videoLink.href.split('v=')[1];
              
              // Extract views and upload date
              const metadataLine = randomVideoItem.querySelector('#metadata-line');
              console.log('Metadata line:', metadataLine);

              let views = 'N/A views';
              let uploadDate = 'N/A';

              if (metadataLine) {
                const metadataItems = metadataLine.querySelectorAll('.inline-metadata-item');
                console.log('Metadata items:', metadataItems);

                if (metadataItems.length >= 2) {
                  views = metadataItems[0].textContent.trim();
                  uploadDate = metadataItems[1].textContent.trim();
                } else if (metadataItems.length === 1) {
                  views = metadataItems[0].textContent.trim();
                }
              }

              console.log(`Video ${index + 1} - Views: ${views}, Upload Date: ${uploadDate}`);

              // Extract channel icon URL
              const channelIcon = randomVideoItem.querySelector('#avatar-link img');
              let channelIconUrl = '';
              if (channelIcon && channelIcon.src) {
                channelIconUrl = channelIcon.src;
                console.log(`Channel icon URL found: ${channelIconUrl}`);
              } else {
                console.log('Channel icon not found, using fallback');
                channelIconUrl = 'https://www.youtube.com/s/desktop/12d6b690/img/favicon_144x144.png'; // Fallback to YouTube logo
              }

              // Log the structure of randomVideoItem for debugging
              console.log('Random video item structure:', randomVideoItem.outerHTML);

              const newElement = document.createElement('div');
              newElement.className = 'ytd-rich-item-renderer';
              newElement.style.cssText = `
                display: flex;
                flex-direction: column;
                width: 30%;
              `;

              const thumbnailContainer = document.createElement('div');
              thumbnailContainer.style.cssText = `
                position: relative;
                width: 100%;
                padding-top: 56.25%; /* 16:9 aspect ratio */
                margin-bottom: 12px;
              `;

              const thumbnail = document.createElement('a');
              thumbnail.href = videoLink.href;
              thumbnail.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                border-radius: 12px;
                overflow: hidden;
              `;

              const img = document.createElement('img');
              img.src = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
              img.style.cssText = `
                width: 100%;
                height: 100%;
                object-fit: cover;
              `;
              thumbnail.appendChild(img);

              const titleContainer = document.createElement('div');
              titleContainer.style.cssText = `
                display: flex;
                align-items: center;
                margin-bottom: 8px;
              `;

              const channelIconElement = document.createElement('img');
              channelIconElement.src = channelIconUrl;
              channelIconElement.style.cssText = `
                width: 24px;
                height: 24px;
                border-radius: 50%;
                margin-right: 8px;
                object-fit: cover;
              `;
              channelIconElement.onerror = function() {
                console.log('Error loading channel icon, using fallback');
                this.src = 'https://www.youtube.com/s/desktop/12d6b690/img/favicon_144x144.png'; // Fallback to YouTube logo
              };

              const title = document.createElement('a');
              title.href = videoLink.href;
              title.textContent = videoLink.getAttribute('title') || 'Video Title';
              title.id = 'video-title';
              title.className = 'ytd-rich-grid-media';
              title.style.cssText = `
                color: var(--yt-spec-text-primary);
                font-family: "Roboto", Arial, sans-serif;
                font-size: 1.4rem;
                line-height: 2rem;
                font-weight: 500;
                overflow: hidden;
                display: -webkit-box;
                max-height: 4rem;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                text-overflow: ellipsis;
                white-space: normal;
                text-decoration: none;
              `;

              titleContainer.appendChild(channelIconElement);
              titleContainer.appendChild(title);

              const author = document.createElement('div');
              author.textContent = randomVideoItem.querySelector('#text.ytd-channel-name')?.textContent || 'Channel Name';
              author.style.cssText = `
                color: var(--yt-spec-text-secondary);
                font-family: 'YouTube Sans', Arial, sans-serif;
                font-size: 14px;
              `;

              // Add views and upload date
              const metadata = document.createElement('div');
              metadata.style.cssText = `
                color: var(--yt-spec-text-secondary);
                font-family: 'YouTube Sans', Arial, sans-serif;
                font-size: 12px;
                display: flex;
                justify-content: space-between;
              `;
              metadata.innerHTML = `
                <span>${views}</span>
                <span>${uploadDate}</span>
              `;

              thumbnailContainer.appendChild(thumbnail);
              newElement.appendChild(thumbnailContainer);
              newElement.appendChild(titleContainer);
              newElement.appendChild(author);
              newElement.appendChild(metadata);

              adVideo.replaceWith(newElement);
              console.log(`Replaced ad video ${index + 1} with link to: ${videoLink.href}`);
              console.log(`New element structure:`, newElement.outerHTML);
            } else {
              console.log(`No valid video link found for ad video ${index + 1}`);
            }
          } else {
            console.log(`No regular video item found for ad video ${index + 1}`);
          }
        });
      }
    }

    /**
     * Remove ads in player
     * @return {undefined}
     */
    function removePlayerAD(id) {
      // If already running, exit
      if (checkRunFlag(id)) {
        log('Ad removal function already running');
        return false;
      }

      // Monitor and handle video ads
      const targetNode = document.body; // Directly monitor body changes
      const config = { childList: true, subtree: true }; // Monitor changes in target node and its subtree
      const observer = new MutationObserver(() => { getVideoDom(); closeOverlay(); skipAd(); playAfterAd(); replaceAdVideos(); }); // Handle video ad related
      observer.observe(targetNode, config); // Start observing ad nodes with above configuration
      log('Ad removal function running successfully');
    }

    function setupAdVideoObserver() {
      const observer = new MutationObserver((mutations) => {
        for (let mutation of mutations) {
          if (mutation.type === 'childList') {
            for (let node of mutation.addedNodes) {
              if (node.nodeType === Node.ELEMENT_NODE) {
                if (node.querySelector('ytd-ad-slot-renderer')) {
                  replaceAdVideos();
                  break;
                }
              }
            }
          }
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });
    }

    /**
     * Main function
     */
    function main() {
      generateRemoveADHTMLElement('removeADHTMLElement'); // Remove ads in interface
      removePlayerAD('removePlayerAD'); // Remove ads in player
      setupAdVideoObserver();
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', main); // Loading not yet complete
      log('YouTube ad removal script about to be called:');
    } else {
      main(); // DOMContentLoaded already triggered
      log('YouTube ad removal script called quickly:');
    }

  })();