(function() {
  'use strict';

  let video;
  let iframeAdded = false;
  
  const cssSelectorArr = [
    '#masthead-ad', 
    'ytd-rich-item-renderer.style-scope.ytd-rich-grid-row #content:has(.ytd-display-ad-renderer)', 
    '.video-ads.ytp-ad-module', 
    'tp-yt-paper-dialog:has(yt-mealbar-promo-renderer)', 
    'ytd-engagement-panel-section-list-renderer[target-id="engagement-panel-ads"]', 
    '#related #player-ads', 
    '#related ytd-ad-slot-renderer', 
    'ytd-ad-slot-renderer', 
    'yt-mealbar-promo-renderer', 
    'ytd-popup-container:has(a[href="/premium"])', 
    'ad-slot-renderer', 
    'ytm-companion-ad-renderer', 
  ];
  window.dev = false; 

  /**
   * Format standard time
   * @param {Date} time Standard time
   * @param {String} format Format
   * @return {String}
   */
  function moment(time) {
    
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
    (document.head || document.body).appendChild(style); 
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
    
    if (checkRunFlag(id)) {
      log('Ad removal node already generated');
      return false;
    }

    
    let style = document.createElement('style'); 
    (document.head || document.body).appendChild(style); 
    style.appendChild(document.createTextNode(generateRemoveADCssText(cssSelectorArr))); 
    log('Ad removal node generated successfully');
  }

  /**
   * Generate CSS text to remove ads
   * @param {Array} cssSelectorArr Array of CSS selectors to set
   * @return {String}
   */
  function generateRemoveADCssText(cssSelectorArr) {
    cssSelectorArr.forEach((selector, index) => {
      cssSelectorArr[index] = `${selector}{display:none!important}`; 
    });
    return cssSelectorArr.join(' '); 
  }

  /**
   * Touch event
   * @return {undefined}
   */
  function nativeTouch() {
    
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

    
    let touchStartEvent = new TouchEvent('touchstart', {
      bubbles: true,
      cancelable: true,
      view: window,
      touches: [touch],
      targetTouches: [touch],
      changedTouches: [touch]
    });

    
    this.dispatchEvent(touchStartEvent);

    
    let touchEndEvent = new TouchEvent('touchend', {
      bubbles: true,
      cancelable: true,
      view: window,
      touches: [],
      targetTouches: [],
      changedTouches: [touch]
    });

    
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
    
    const premiumContainers = [...document.querySelectorAll('ytd-popup-container')];
    const matchingContainers = premiumContainers.filter(container => container.querySelector('a[href="/premium"]'));

    if (matchingContainers.length > 0) {
      matchingContainers.forEach(container => container.remove());
      log('Removed YouTube interceptor');
    }

    
    const backdrops = document.querySelectorAll('tp-yt-iron-overlay-backdrop');
    
    const targetBackdrop = Array.from(backdrops).find(
      (backdrop) => backdrop.style.zIndex === '2201'
    );
    
    if (targetBackdrop) {
      targetBackdrop.className = ''; 
      targetBackdrop.removeAttribute('opened'); 
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

    if ((skipButton || shortAdMsg) && window.location.href.indexOf('https://m.youtube.com/') === -1 && video) {
      video.muted = true;
    }

    if (skipButton) {
      const delayTime = 0.5;
      setTimeout(skipAd, delayTime * 1000);
      if (video && video.currentTime > delayTime) {
        video.currentTime = video.duration;
        log('Special account skipped button ad');
        return;
      }
      skipButton.click(); 
      nativeTouch.call(skipButton); 
      log('Button skipped ad');
    } else if (shortAdMsg && video) {
      video.currentTime = video.duration; 
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

            const channelIcon = randomVideoItem.querySelector('#avatar-link img');
            let channelIconUrl = '';
            if (channelIcon && channelIcon.src) {
              channelIconUrl = channelIcon.src;
              console.log(`Channel icon URL found: ${channelIconUrl}`);
            } else {
              console.log('Channel icon not found, using fallback');
              channelIconUrl = 'https://www.youtube.com/s/desktop/12d6b690/img/favicon_144x144.png';
            }

            const newElement = document.createElement('div');
            newElement.className = 'ytd-rich-item-renderer injected-video';

            newElement.style.cssText = `
              display: flex;
              flex-direction: column;
              width: 100%;
              max-width: 360px;
              margin: 0 auto 16px;
              padding: 0 8px;
              box-sizing: border-box;
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
              align-items: flex-start;
              margin-bottom: 8px;
            `;

            const channelIconElement = document.createElement('img');
            channelIconElement.src = channelIconUrl;
            channelIconElement.style.cssText = `
              width: 36px;
              height: 36px;
              border-radius: 50%;
              margin-right: 12px;
              object-fit: cover;
            `;
            channelIconElement.onerror = function() {
              console.log('Error loading channel icon, using fallback');
              this.src = 'https://www.youtube.com/s/desktop/12d6b690/img/favicon_144x144.png';
            };

            const titleAndMetadataContainer = document.createElement('div');
            titleAndMetadataContainer.style.cssText = `
              flex: 1;
              min-width: 0;
            `;

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
              margin-bottom: 4px;
            `;

            const author = document.createElement('div');
            author.textContent = randomVideoItem.querySelector('#text.ytd-channel-name')?.textContent || 'Channel Name';
            author.style.cssText = `
              color: var(--yt-spec-text-secondary);
              font-family: 'Roboto', Arial, sans-serif;
              font-size: 1.2rem;
              line-height: 1.8rem;
              margin-bottom: 2px;
            `;

            const metadata = document.createElement('div');
            metadata.style.cssText = `
              color: var(--yt-spec-text-secondary);
              font-family: 'Roboto', Arial, sans-serif;
              font-size: 1.2rem;
              line-height: 1.8rem;
            `;
            metadata.innerHTML = `
              ${views} • ${uploadDate}
            `;

            titleAndMetadataContainer.appendChild(title);
            titleAndMetadataContainer.appendChild(author);
            titleAndMetadataContainer.appendChild(metadata);

            titleContainer.appendChild(channelIconElement);
            titleContainer.appendChild(titleAndMetadataContainer);

            thumbnailContainer.appendChild(thumbnail);
            newElement.appendChild(thumbnailContainer);
            newElement.appendChild(titleContainer);

            adVideo.replaceWith(newElement);
            console.log(`Replaced ad video ${index + 1} with link to: ${videoLink.href}`);
          } else {
            console.log(`No valid video link found for ad video ${index + 1}`);
          }
        } else {
          console.log(`No regular video item found for ad video ${index + 1}`);
        }
      });

      // Add responsive styles
      const style = document.createElement('style');
      style.textContent = `
        @media (min-width: 576px) {
          .injected-video {
            width: 50%;
          }
        }
        @media (min-width: 992px) {
          .injected-video {
            width: 33.333%;
          }
        }
        @media (min-width: 1200px) {
          .injected-video {
            width: 25%;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }

  /**
   * Remove ads in player
   * @return {undefined}
   */
  function removePlayerAD(id) {
    
    if (checkRunFlag(id)) {
      log('Ad removal function already running');
      return false;
    }

    
    const targetNode = document.body; 
    const config = { childList: true, subtree: true }; 
    const observer = new MutationObserver(() => { getVideoDom(); closeOverlay(); skipAd(); playAfterAd(); replaceAdVideos(); }); 
    observer.observe(targetNode, config); 
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
   * Apply margin to the first video in each row
   * @param {NodeList} videos List of video elements
   * @return {undefined}
   */
  function applyMarginToInjectedVideos(videos) {
    console.log('Applying margin to injected videos after the first two');
    let injectedCount = 0;
    videos.forEach((video) => {
      if (isInjectedVideo(video)) {
        injectedCount++;
        if (injectedCount > 2) {
          console.log(`Injected video ${injectedCount} gets margin`);
          video.style.marginLeft = '30px';
        } else {
          video.style.marginLeft = '0';
        }
      } else {
        video.style.marginLeft = '0';
      }
    });
  }

  function isInjectedVideo(video) {
    return video.querySelector('a#video-title') !== null;
  }

  function setupVideoGridObserver() {
    const observer = new MutationObserver((mutations) => {
      for (let mutation of mutations) {
        if (mutation.type === 'childList') {
          const newVideos = Array.from(mutation.addedNodes).filter(node => 
            node.nodeType === Node.ELEMENT_NODE && 
            node.classList.contains('ytd-rich-item-renderer')
          );
          if (newVideos.length > 0) {
            console.log('New videos added:', newVideos);
            applyMarginToInjectedVideos(document.querySelectorAll('ytd-rich-item-renderer'));
          }
        }
      }
    });

    const videoGrid = document.querySelector('ytd-rich-grid-renderer');
    if (videoGrid) {
      observer.observe(videoGrid, { childList: true, subtree: true });
    }
  }

  /**
   * Create and add iframe
   * @param {HTMLElement} video Video element
   * @param {HTMLElement} videoPlayer Video player element
   * @param {boolean} fromReload Whether the function is called after a page reload
   * @return {undefined}
   */
  function createAndAddIframe(video, videoPlayer, fromReload) {
    const urlParams = new URLSearchParams(window.location.search);
    const videoId = urlParams.get('v');

    if (videoId) {
      const iframe = constructIframe(video, videoPlayer, videoId, fromReload);
      window.document.body.appendChild(iframe);
      iframeAdded = true;
      
      // Hide the original video player and its controls
      videoPlayer.style.visibility = 'hidden';
      
      // Hide the video controls
      const videoControls = document.querySelector('.ytp-chrome-bottom');
      if (videoControls) {
        videoControls.style.display = 'none';
      }
      
      log('Iframe added successfully, original player and controls hidden');
    } else {
      log('ERROR: no videoId');
    }
  }

  /**
   * Construct iframe element
   * @param {HTMLElement} video Video element
   * @param {HTMLElement} videoPlayer Video player element
   * @param {string} videoId YouTube video ID
   * @param {boolean} fromReload Whether the function is called after a page reload
   * @return {HTMLIFrameElement}
   */
  function constructIframe(video, videoPlayer, videoId, fromReload) {
    const iframe = document.createElement('iframe');
    iframe.id = 'insertedVideo';
    iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;
    iframe.title = 'YouTube video player';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    iframe.style.zIndex = '6';
    iframe.style.position = 'absolute';
    iframe.style.border = 'none';

    const videoRect = video.getBoundingClientRect();
    const videoPlayerRect = videoPlayer.getBoundingClientRect();

    const videoAbsoluteTop = window.scrollY + videoRect.top;
    const videoAbsoluteLeft = window.scrollX + videoRect.left;
    const videoPlayerAbsoluteTop = window.scrollY + videoPlayerRect.top;
    const videoPlayerAbsoluteLeft = window.scrollX + videoPlayerRect.left;

    if (fromReload) {
      iframe.style.top = `${videoAbsoluteTop - 1}px`;
      iframe.style.left = `${videoAbsoluteLeft}px`;
      iframe.style.height = `${video.offsetHeight + 2}px`;
    } else {
      iframe.style.top = `${videoPlayerAbsoluteTop - 1}px`;
      iframe.style.left = `${videoPlayerAbsoluteLeft}px`;
      iframe.style.height = `${videoPlayer.offsetHeight + 2}px`;
    }

    iframe.style.width = `${video.offsetWidth}px`;

    const updateIframeDimensions = () => {
      const newLeft = window.scrollX + video.getBoundingClientRect().left;
      
      if (videoPlayer.offsetHeight === 0 && videoPlayer.offsetWidth === 0) {
        iframe.style.height = `${video.offsetHeight + 2}px`;
        iframe.style.width = `${video.offsetWidth}px`;
      } else {
        iframe.style.height = `${videoPlayer.offsetHeight + 2}px`;
        iframe.style.width = `${videoPlayer.offsetWidth}px`;
      }
      iframe.style.left = `${newLeft}px`;
    };

    window.addEventListener('resize', updateIframeDimensions);
    new ResizeObserver(updateIframeDimensions).observe(videoPlayer);

    return iframe;
  }

  /**
   * Remove iframe
   * @return {undefined}
   */
  function removeIframe() {
    const iframe = document.getElementById('insertedVideo');
    if (iframe) {
      iframe.parentNode.removeChild(iframe);
      iframeAdded = false;
      
      // Show the original video player and its controls
      const videoPlayer = document.getElementById('player');
      if (videoPlayer) {
        videoPlayer.style.visibility = 'visible';
      }
      
      // Show the video controls
      const videoControls = document.querySelector('.ytp-chrome-bottom');
      if (videoControls) {
        videoControls.style.display = '';
      }
      
      log('Iframe removed, original player and controls shown');
    }
  }

  /**
   * Handle YouTube page changes
   * @return {undefined}
   */
  function handleYouTubePageChange() {
    if (window.location.href.includes('youtube.com/watch')) {
      video = document.querySelector('video');
      const videoPlayer = document.getElementById('player');

      if (video && videoPlayer) {
        if (!iframeAdded) {
          video.pause();
          video.addEventListener('playing', pauseVideo, false);
          createAndAddIframe(video, videoPlayer, false);
        } else {
          removeIframe();
          createAndAddIframe(video, videoPlayer, false);
        }
      } else {
        log('ERROR: Could not find video or video player');
      }
    } else {
      removeIframe();
    }
  }

  /**
   * Pause video
   * @param {Event} event
   * @return {undefined}
   */
  function pauseVideo(event) {
    event.currentTarget.pause();
  }

  /**
   * Main function
   */
  function main() {
    generateRemoveADHTMLElement('removeADHTMLElement');
    removePlayerAD('removePlayerAD');
    setupAdVideoObserver();
    setupVideoGridObserver();
    handleYouTubePageChange();
    
    // Listen for YouTube SPA navigation
    window.addEventListener('yt-navigate-finish', handleYouTubePageChange);
    
    console.log('Applying initial margin to videos');
    applyMarginToInjectedVideos(document.querySelectorAll('ytd-rich-item-renderer'));
    
    log('YouTube ad removal and iframe embedding script initialized');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main); 
    log('YouTube ad removal script about to be called:');
  } else {
    main(); 
    log('YouTube ad removal script called quickly:');
  }

})();