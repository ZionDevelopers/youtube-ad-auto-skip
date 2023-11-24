// Define global variables
var seconds = 0.10 * 1000;
var closeId = 0;
var autoCloserId = 0;
var enabled = true;
var hotkey = 'F1';
var adPlaybackSpeed = 16;
var uid = 'none';
var ads = {	
	videoSkip: 'div.video-ads div.ytp-ad-skip-ad-slot div.ytp-ad-skip-button-slot button.ytp-ad-skip-button-modern'	
};
var mute = true;
var muted = false;
var videoAdDetector = 'div.video-ads div.ytp-ad-player-overlay-instream-info';
var video = 'none';

/**
 * Start interval
 * @constructor 
 */
function run() {
	console.log('YouTube Ad Auto-Skip is loading...');
	// Run autoCloser function every X milliseconds
    autoCloserId = setInterval(autoCloser, 100);
}
/**
 * Generate unique id
 * @constructor 
 */
function uuidv4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

/**
 * Trigger hotkey
 * @constructor 
 */
function triggerHotkey () {
	// Revert enabled state
	enabled = !enabled;
	// Add html alert
	$('body').append('<div style="display: none; background-color:' + (enabled ? 'green':'red') + ';color: #fff;font-family: Arial; font-size: 12px; margin: 0 auto; z-index: 9999;position: absolute" id="youtube-ad-auto-skip-alert">YouTube Ad Auto-Skip: <b>'+(enabled ? 'Enabled!' : 'Disabled!')+'</b></div>');
	// Fade in the html alert
	$('div#youtube-ad-auto-skip-alert').fadeIn();
	// Trigger timout for the removal of the html alert
	setTimeout(function () {
		// Fade Out the html alert
		$('div#youtube-ad-auto-skip-alert').fadeOut(function () {
			// Remove the html alert
			$(this).remove();
		});
	},
	2000);
	// Set preferences
	chrome.storage.sync.set({enabled: enabled}, function() {});	
}

/**
 * Close an ad
 * @constructor
 * @param {string} selector - CSS Selector
 * @param {object} options - List of saved options
 */
function closeAd(selector, options) {
	// This Ad is present?
	if ($(selector).is(':visible')) {
		// Convert seconds to milliseconds
		seconds = options.autoCloseAfter * 1000;
		
		// Clear Interval
		clearInterval(autoCloserId);
		
		// Click an Ad after X seconds
		setTimeout(function () {
			// Get Preferences
			chrome.storage.sync.get({enabled: true}, function (options) {			
				// Pass the enable variable
				enabled = options.enabled;
				// Check again if plugin is enabled
				if (enabled) {
					// Close Ad
					$(selector).click();					
				}
			});
			
			// Restart timer
			run();
		}, seconds);
	}		
}

/**
 * Auto Closer function the extension Init function
 * @constructor
 */
var autoCloser = function () {
	// Get Preferences
	chrome.storage.sync.get({enabled: true, autoCloseAfter: 0.10, mute: true, adPlaybackSpeed: 16}, function (options) {
		// Pass the enable variable to global var
		enabled = options.enabled;
		// Pass the mute variable to global
		mute = options.mute;
		// Pass ad playback speed to global
		adPlaybackSpeed = options.adPlaybackSpeed;
		
		// The plugin is enabled?
		if (enabled) {			
			// Do a check for each Ad
			$.each(ads, function (name, selector) {
				// Close this Ad
				closeAd(selector, options);			
			});

			// Mute option enabled?
			if (mute) {
				// Set video
				video = $('div#movie_player video')[0];
				
				// Check if video ad is present and video is not muted
				if($(videoAdDetector).is(':visible') && !muted) {
					// Check if video is not muted
					if (!video.muted) {
						// Check if miniplayer is not visible
						if (!$('a.ytd-miniplayer').is(':visible')) {
							// Click on mute button
							$('div#movie_player button.ytp-mute-button').click();
						} else {
							// Mute video
							video.muted = true;
						}
						// Adjust ad's playback speed
						document.getElementsByTagName('video')[0].playbackRate = adPlaybackSpeed;
						// Set state to muted
						muted = true;
					}
				// Check if video ad is not present but the video is muted
				} else if (!$(videoAdDetector).is(':visible') && muted) {
					// Check if video is muted
					if (video.muted) {
						// Check if miniplayer is not visible
						if (!$('a.ytd-miniplayer').is(':visible')) {
							// Click on mute button
							$('div#movie_player button.ytp-mute-button').click();
						} else {
							// Unmute video
							video.muted = false;
						}
					}
					// Unmute
					muted = false;
				}
			}
		}
	});
}

/**
 * Send Statistics to Google Analytics V4
 */
function sendStatistics() {
	// Send ajax request
	$.ajax({
		url: "https://www.google-analytics.com/mp/collect?measurement_id=G-QSJEB7CXHL&api_secret=OCGloj3CSCW0LrqZVW8jdA", 
		crossDomain: true,
		type: "POST",
		dataType: "json",			
		contentType: "application/json; charset=utf-8",
		data: JSON.stringify({
		"client_id": uid,
		"events": [{
		  "name": "page_view",
		  "params": {				
			"page_title": 'YouTube: Firefox',
			"page_location": 'https://www.youtube.com'
		  }
		}]
	  }),
	});
}

// Run on ready
$(document).ready(function () { 
	// Get preferences
	chrome.storage.sync.get({enabled: true, hotkey: 'F1', uid: 'none', mute: true}, function (options) {
		// Pass the enable variable to global var
		enabled = options.enabled;
		// Pass the hotkey variable to global var
		hotkey = options.hotkey		
		// Pass uid variable to global var / Generate new uid4
		uid = options.uid == 'none' ? uuidv4() : options.uid;
						
		// Check for uid
		if (options.uid == 'none') {
			// Set preferences
			chrome.storage.sync.set({uid: uid}, function() {});	
		}
		
		// Trigger hotkey
		$(document).on('keydown', null, hotkey, triggerHotkey);

		// Send statistics
		sendStatistics();
		// Send statistics every one minute
		setInterval(sendStatistics, 60000);

		// Run Extension
		run();
	});	
});
