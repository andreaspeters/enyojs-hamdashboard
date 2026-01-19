/**
 * webos-events.js
 * 
 * Initializes standard webOS events, and links them up to the shared Signals kind.
 * Provides access to the following events in enyo.Signals:
 * - onapplicationrelaunch
 * - onwindowactivated
 * - onwindowdeactivated
 * - onwindowhidden
 * - onwindowshown
 * 
 * Mojo.* property handling is based on the Enyo 1.0 source
 */

(function() {
	// Initialize our potentially-shared Mojo variable
	Mojo = window.Mojo || {};

	// Setup our generic event dispatching code
	var fireEvent = function(name, windowParams) {
		// Working with DOM-friendly browser
		var event = document.createEvent('Event');
		event.initEvent(name, true, true);
		if (typeof windowParams !== 'undefined') {
			event.windowParams = windowParams;
		}
		document.dispatchEvent(event);
	};

	// LunaSysMgr calls this when the windows is maximized or opened.
	Mojo.stageActivated = function() {
		fireEvent('windowactivated');
	};

	// LunaSysMgr calls this when the windows is minimized or closed.
	Mojo.stageDeactivated = function() {
		fireEvent('windowdeactivated');
	};

	// LunaSysMgr calls this when a KeepAlive app's window is hidden
	Mojo.hide = function() {
		fireEvent('windowhidden');
	};

	// LunaSysMgr calls this when a KeepAlive app's window is shown
	Mojo.show = function() {
		fireEvent('windowshown');
	};

	// LunaSysMgr calls this whenever an app is "launched;" 
	Mojo.relaunch = function() {
		var windowParams = {};
		try {
			windowParams = enyo.json.parse(PalmSystem.launchParams);
		} catch (error) {
			enyo.error('applicationLaunch windowParams object is not valid JSON');
		}
		fireEvent('applicationrelaunch', windowParams);
		// need to return true to tell sysmgr the relaunch succeeded.
		// otherwise, it'll try to focus the app, which will focus the first
		// opened window of an app with multiple windows.
		return true;
	};

	// And finally setup our Enyo listeners
	enyo.dispatcher.listen(document, 'windowactivated');
	enyo.dispatcher.listen(document, 'windowdeactivated');
	enyo.dispatcher.listen(document, 'windowhidden');
	enyo.dispatcher.listen(document, 'windowshown');
	enyo.dispatcher.listen(document, 'applicationrelaunch');
})();
