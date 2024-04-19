/*
YouTube Ad Auto-Skip is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
----------------------------------------------------------------------------------------------------------------------------
Copyright (c) 2017 - 2024 Júlio C. Oliveira <http://www.juliocesar.me>

This work is licensed under the Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
To view a copy of this license, visit <http://creativecommons.org/licenses/by-nc-sa/4.0/deed.en_US> .
----------------------------------------------------------------------------------------------------------------------------

$Id$
Version 1.4.11 - 2024-04-19
*/

// Define global variables
var seconds = 0.10 * 1000;
var closeId = 0;
var autoCloserId = 0;
var enabled = true;
var hotkey = 'F1';
var adsPlaybackSpeed = 1;
var ads = {	
	videoSkip: 'div.video-ads button.ytp-skip-ad-button',
	videoSkip2: 'div.video-ads button.ytp-ad-skip-button-modern'	
};
var mute = true;
var muted = false;
var videoAdDetector = 'div.video-ads div.ytp-ad-player-overlay-layout__skip-or-preview-container, div.video-ads div.ytp-ad-player-overlay-instream-info';
var video = 'none';

/**
 * Start interval
 * @constructor 
 */
function run() {
	// Run autoCloser function every X milliseconds
    autoCloserId = setInterval(autoCloser, 100);
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

	// Check if addon was just disabled
	if(!enabled) {
		// Set video
		video = $('div#movie_player video')[0];

		// Check if video ad is visible and video playback is anything other than 1
		if ($(videoAdDetector).is(':visible') && video.playbackRate != 1){
			// Adjust ad's playback speed
			video.playbackRate = 1;
		}

		// Check if video was muted
		if (video.muted) {
			// Unmute video
			video.muted = false;
			// Unmute var
			muted = false;
		}
	}
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

				// Restart timer
				run();
			});			
		}, seconds);
	}		
}

/**
 * Auto Closer function the extension Init function
 * @constructor
 */
var autoCloser = function () {
	// Get Preferences
	chrome.storage.sync.get({enabled: true, autoCloseAfter: 0.10, mute: true, adsPlaybackSpeed: 1}, function (options) {
		// Pass the enable variable to global var
		enabled = options.enabled;
		// Pass the mute variable to global
		mute = options.mute;
		// Pass ad playback speed to global
		adsPlaybackSpeed = options.adsPlaybackSpeed;
		
		// The plugin is enabled?
		if (enabled) {			
			// Do a check for each Ad
			$.each(ads, function (name, selector) {
				// Close this Ad
				closeAd(selector, options);			
			});

			// Set video
			video = $('div#movie_player video')[0];

			// Check if video ad is visible and video playback is 1
			if ($(videoAdDetector).is(':visible') && video.playbackRate == 1){
				// Adjust ad's playback speed
				video.playbackRate = adsPlaybackSpeed;
			}

			// Mute option enabled?
			if (mute) {				
				// Check if video ad is present and video is not muted
				if($(videoAdDetector).is(':visible') && !muted) {
					// Check if video is not muted
					if (!video.muted) {						
						// Mute video
						video.muted = true;
						
						// Set state to muted
						muted = true;
					}
				// Check if video ad is not present but the video is muted
				} else if (!$(videoAdDetector).is(':visible') && muted) {
					// Check if video is muted
					if (video.muted) {						
						// Unmute video
						video.muted = false;						
					}
					// Unmute
					muted = false;
				}
			}
		}
	});
}

// Run on ready
$(document).ready(function () { 
	// Get preferences
	chrome.storage.sync.get({enabled: true, hotkey: 'F1', mute: true}, function (options) {
		// Pass the enable variable to global var
		enabled = options.enabled;
		// Pass the hotkey variable to global var
		hotkey = options.hotkey		
		
		// Trigger hotkey
		$(document).on('keydown', null, hotkey, triggerHotkey);

		// Show log message
		console.log('YouTube Ad Auto-Skip is loading...');

		// Run Extension
		run();
	});	
});
