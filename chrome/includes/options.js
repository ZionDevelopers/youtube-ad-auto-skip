/*
YouTube Ad Auto-Skip is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
----------------------------------------------------------------------------------------------------------------------------
Copyright (c) 2017 - 2024 Júlio C. Oliveira <http://www.juliocesar.me>

This work is licensed under the Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
To view a copy of this license, visit <http://creativecommons.org/licenses/by-nc-sa/4.0/deed.en_US> .
----------------------------------------------------------------------------------------------------------------------------

$Id$
Version 1.4.8 - 2023-12-08
*/

// Define global vars
var enabled = true;
var hotkey = 'F2';
var adsPlaybackSpeed = 1;

/**
 * Trigger Hotkey
 * @constructor
 */
function triggerHotkey () {
	// Revert plugin state
	enabled = !enabled;
	// Check Enabled checkbox
	$("input#enabled").prop("checked", enabled);
	// Set preferences
	chrome.storage.sync.set({enabled: enabled}, function() {});	
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
$(document).ready(function () {	
	// Get preferences
    chrome.storage.sync.get({
        enabled: true,
        autoCloseAfter: 0.10,
		hotkey: 'F2',
		mute: true,
		adsPlaybackSpeed: 1
	}, function(options) {
		// Pass the enable var to global
		enabled = options.enabled;	
		// Pass the hotkey var to global
		hotkey = options.hotkey;
		// Pass the mute var to global
		mute = options.mute;
		// Pass ad playback speed to global
		adsPlaybackSpeed = options.adsPlaybackSpeed
		
		// Check/Uncheck checkbox
		$("input#enabled").prop("checked", enabled);
		// Check/Uncheck checkbox
		$("input#mute").prop("checked", mute);
		// Set seconds to input
		$("input#autoCloseAfter").val(options.autoCloseAfter);
		// Set hotkey to input
		$("input#hotkey").val(hotkey);	
		// Set ad playback speed to input
		$("input#adsPlaybackSpeed").val(adsPlaybackSpeed);
		// Set hotkey trigger
		$(document).on('keydown', null, hotkey, triggerHotkey);	
			
		// Saves options to chrome.storage
		$("input#enabled").click(function () {
			// Set preferences
			chrome.storage.sync.set({enabled: Boolean($("input#enabled:checked").val())}, function() {});
		});
		
		// Saves options to chrome.storage
		$("input#mute").click(function () {
			// Set preferences
			chrome.storage.sync.set({mute: Boolean($("input#mute:checked").val())}, function() {});
		});
		
		// Trigger changes in input seconds
		$("input#autoCloseAfter").change(function () {
			var seconds = $("input#autoCloseAfter").val();
			// Parse seconds
			seconds = parseFloat(seconds);
			seconds = isNaN(seconds) ? 1 : seconds;
			seconds = seconds <= 0 ? 0.10 : seconds;
			// Set seconds to input
			$("input#autoCloseAfter").val(seconds);
			// Set preferences
			chrome.storage.sync.set({autoCloseAfter: seconds}, function() {});
		});
		
		// Trigger changes in hotkey
		$("input#hotkey").change(function () {
			// Get preferences
			chrome.storage.sync.get({hotkey, enabled}, function (options) {
				// Pass the Hotkey var to global
				hotkey = options.hotkey;
				// Pass the enabled var to global
				enabled = options.enabled;
				
				// Get new hotkey
				var newHotkey = $("input#hotkey").val();
				
				// Check for hotkey change
				if (newHotkey != hotkey) {
					alert('New Hotkey set to:'+newHotkey);
					// Remove old hotkey trigger
					$(document).off('keydown', triggerHotkey);
					// Set preferences
					chrome.storage.sync.set({hotkey: newHotkey}, function() {});	
					// Set new hotkey trigger
					$(document).on('keydown', null, newHotkey, triggerHotkey);
				}
			});		
		});

		// Trigger changes in input speed
		$("input#adsPlaybackSpeed").change(function () {
			var speed = $("input#adsPlaybackSpeed").val();
			// Parse speed
			speed = parseFloat(speed);
			speed = isNaN(speed) ? 1 : speed;
			speed = speed <= 0 ? 0.10 : speed;
			speed = speed > 16 ? 16 : speed;
			// Set seconds to input
			$("input#adsPlaybackSpeed").val(speed);
			// Set preferences
			chrome.storage.sync.set({adsPlaybackSpeed: speed}, function() {});
		});
    });	
});
