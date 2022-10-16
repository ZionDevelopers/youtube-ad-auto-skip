// Define global vars
var enabled = true;
var hotkey = 'F2';
var uid = 'none';

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

/**
 * Generate unique id
 * @constructor 
 */
function uuidv4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
$(document).ready(function () {	
	// Get preferences
    chrome.storage.sync.get({
        enabled: true,
        autoCloseAfter: 1,
		hotkey: 'F2',
		uid: 'none',
		mute: true
	}, function(options) {
		// Pass the enable var to global
		enabled = options.enabled;	
		// Pass the hotkey var to global
		hotkey = options.hotkey;
		// Pass uid variable to global var / Generate new uid4
		uid = options.uid == 'none' ? uuidv4() : options.uid;
		// Pass the mute var to global
		mute = options.mute;
		
		// Check/Uncheck checkbox
		$("input#enabled").prop("checked", enabled);
		// Check/Uncheck checkbox
		$("input#mute").prop("checked", mute);
		// Set seconds to input
		$("input#autoCloseAfter").val(options.autoCloseAfter);
		// Set hotkey to input
		$("input#hotkey").val(hotkey);	
		// Set hotkey trigger
		$(document).on('keydown', null, hotkey, triggerHotkey);	
	
		/** 
		 * Google Analytics v4
		 */
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
				"page_title": 'Options',
				"page_location": 'about:addons'
			  }
			}]
		  }),
		 });	
		 
		// Check for uid
		if (options.uid == 'none') {
			// Set preferences
			chrome.storage.sync.set({uid: uid}, function() {});	
		}		
		
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
    });	
});
