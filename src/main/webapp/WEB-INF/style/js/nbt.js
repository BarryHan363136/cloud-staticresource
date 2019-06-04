/**
 * These javascript library is for NBT vehicles. It depends on the jquery library.
 * 
 * @author Thomas Stadtlander, NTT DATA
 * @author Hao Hu, NTT DATA
 * @version 3.0.0-1418107463103
 */

var Config = {
	appIdentifier : 'Main',
	setupFunction : function() {
	}, // initial function for an application
	startPanelID : 'Start',// defines the default panel id of this app
	startPanelUrl : 'start', // defines the default panel url of this app
	startPanelOptions : {}, // defines the default panel options of this app
	ignoreReferrer : false,
	defaultLoadDelay : 600, // delay time in s for loadWithDelay calls
	geocoderEnabled : true, // if true, the Geocoder.init() starts a timer to refresh the position
	geocoderSupportedCountries : [ 'AE', 'AT', 'BE', 'CH', 'CZ', 'DE', 'DK', 'ES', 'FR', 'GB', 'GR', 'IE', 'IT', 'KW',
			'LU', 'NL', 'NO', 'PL', 'PT', 'SE', 'TR' ], // empty list: a custom, GeoDB: QC12637
	// country name can be used,. one item, then only the city can be inserted.
	geocoderUrl : 'geocoder',// url for geocoder requests
	geocoderUpdateInterval : 15000,// in milliseconds
	geocoderUpdateDistance : 500, // in meter
	imageURL : 'image',
	mapImageURL : 'map',
	i18nURL : 'commoni18n', // path to the common i18n resource json with the current translations of the backend locale
	browserCacheUrl : 'browserCache', // urls for browser cache in backend
	ajaxTimeout : 30000, // wait only for 30s until server response
	viewportHeight : 420, // height of visible area
	viewportTop : 60, // top of the viewport
	scrollHeight : 60, // default scroll height
	scrollPageRowsCount : 6, // # of rows to scroll by page down/up button after scrolling
	firefoxMode : false, // true, for tests in firefox
	speedlockPanelSettings : {// general speedlock settings of markets
		"lockedScrolling" : [ "AE", "AT", "BE", "CH", "CZ", "DE", "DK", "ES", "FR", "GR", "IE", "IT", "KW", "LU", "NL",
				"NO", "PL", "PT", "SE", "UK", "CN", "TR", "NZ", "BR", "IN", "MX", "RU", "ZA", "TW", "BG", "HU", "RO", "SI", "SK", "IN"],
		"lockedContent" : [ "JP", "AU", "SG", "MY" ],
		"lockedText" : [ "US", "CA", "KR" ],
		"lockedToolbar" : [ "JP", "AU", "SG", "MY" ],
		"lockedInput" : [ "JP", "AU" ],
		"lockedClickable" : [ "JP", "AU" ],
		"lockedGeocoder" : [ "JP", "AU", "SG", "MY" ],
		"lockedApplication" : []
	},
	appSpeedlockPanelSettings : undefined, // application specific speedlock settings(defined in app.js)
	speedlockTriggerSettings : { // market settings to activate speedlock
		"speed" : {// market settings of max. km/h
			0 : [ "AU" ],
			3 : [ "KR", "SG", "MY" ],
			8 : [ "AE", "AT", "BE", "CH", "CZ", "DE", "DK", "ES", "FR", "GR", "IE", "IT", "KW", "LU", "NL", "NO", "PL",
					"PT", "SE", "UK", "CN", "TR", "NZ", "US", "CA", "JP", "BR", "IN", "MX", "RU", "ZA", "BG", "HU", "RO", "SI", "SK", "IN" ]
		},
		"gear" : [ "AU" ], // market settings of gear (P)
		"handbrake" : [ "AU" ]
	// market setting of hand brake
	},
	contactbookSupportedCountries : [ "AE", "AT", "AU", "BE", "CH", "CZ", "DE", "DK", "ES", "FR", "IE", "IT", "KW",
			"LU", "NL", "NO", "PL", "PT", "SE", "UK", "GB" ],
	shiftContentSettings : [ "CN", "JP" ],
	homemarket : undefined,
	productType : undefined,
	switchScreenCallback : undefined,
	ttsPause : "1500",
	baseContextPath : undefined
};

var CDPError = {
	Unexpected : 'errorUnexpected',
	WrongURL : 'errorWrongUrl',
	NoConnection : 'errorNoConnection',
	LoginFailed : 'errorLoginFailed',
	ContentProviderIssue : 'errorContentProviderIssue',
	ParsingException : 'errorParsingException',
	SetDestinationFailed : 'errorSetDestinationFailed',
	MakeVoiceCallFailed : 'errorMakeVoiceCallFailed',
	BINCouldNotStarted : 'errorBINCouldNotStarted',
	NoPosition : 'errorNoPosition',
	NoDestination : 'errorNoDestination',
	Moving : 'errorMoving',
	MovingShort : 'errorMovingShort'
};

/**
 * This is for all timers. If a timer was started, it should be stored here, so it can be canceled later, if needed.
 */
var Timers = {};

$(document).ready(function() {
	initApp();
});

var initApp = function() {
	EFIHelper.init();
	BEVHelper.init();
	addNBTEventListener();
	I18N.init();
	PM.init();
	initScreenSize();
	LOG.info('all components initialized');
	// for tests in firefox
	if (navigator.userAgent.indexOf('Firefox') > -1) {
		Config.firefoxMode = true;
	}
};

var initScreenSize = function() {
	if (!($('body').hasClass('screen1024') || $('body').hasClass('screen544'))) {
		var screenSize = 'screen1024';
		if (PM.getUserAgent().indexOf('544') > -1) {
			screenSize = 'screen544';
		}
		$('body').addClass(screenSize);
		LOG.info('No screen size was detected, added ' + screenSize);
	}
	var xSize = SM.getSessionGlobal('xSize');
	if (xSize && $('#Main').width() != xSize) {
		LOG.info('Switching screen to xSize : ' + xSize);
		PM.changeStyle({
			xSize : xSize
		});
	}
};

var addNBTEventListener = function() {
	$(document).on("keydown", document, generalKeydownHandler);

	/**
	 * QC2456: If headunit speller returns, the next input field will be selected. If the input field is not in the
	 * visible area the browser scrolls native. This is not good and must be prevented. FocusIn is special for input
	 * fields, because of the embedded input tag
	 */
	$(document).on("focus", "li.input", function(event) {
		$('#Main').animate({
			scrollTop : 0
		}, 1);
		var element = $(this).find('input, textarea');
		if (!element.parents('li').first().is('.selected')) {
			element.blur();
		}
		element = PM.visiblePanel.find('.input.selected').find('input, textarea').get(0);
		if (element) {
			element.focus();
		}

	});
	$(document).on("blur", "li.input", function(event) {
		event.stopPropagation();
		var element = $(this).find('input, textarea').get(0);
		if (element) {
			element.blur();
		}
	});
};

var generalKeydownHandler = function(evt) {
	var k = evt.keyCode;
	switch (k) {
	case 13: // enter
	case 39: // right arrow
		if (!PM.blockUI) {
			PM.execute();
		}
		break;
	case 38: // up arrow
		if (!PM.blockUI) {
			PM.blockUI = true;
			window.setTimeout(function() {
				PM.scrollUp();
				PM.blockUI = false;
			}, 0);
		}
		break;
	case 40: // down arrow
		if (!PM.blockUI) {
			PM.blockUI = true;
			window.setTimeout(function() {
				PM.scrollDown();
				PM.blockUI = false;
			}, 0);
		}
		break;
	case 37: // left arrow
		if (PM.lastMovingStatus() && PM.lastLockedPanel) {
			// reset history if moving and a panel is locked, so app will be closed with backbutton
			PM.resetHistory();
		}
		PM.back();
		break;
	}
};

var timeBoxKeydownHandler = function(evt) {
	switch (evt.keyCode) {
	case 13: // enter
	case 39: // right arrow
		PM.blockUI = false;
		break;
	case 38: // up arrow
		PM.countDownTime(evt.data);
		evt.stopPropagation();
		break;
	case 40: // down arrow
		PM.countUpTime(evt.data);
		evt.stopPropagation();
		break;
	case 37: // left arrow
		PM.releaseTimeFocus(evt.data);
		evt.stopPropagation();
		break;
	}
};

var Utils = {
	removeFromArray : function(array, removeItem) {
		return jQuery.grep(array, function(value) {
			return value != removeItem;
		});
	}
};

/**
 * PanelManager for showing, scrolling, loading and managing the history of Panels.
 */
var PM = {
	isLoadPageCalled : false,
	lastLockedPanel : undefined, // this is the panel, which is locked during
	// driving
	isUpdating : false,
	startedWithHash : false,
	stack : [], // history stack
	holder : null, // for performance issue, use PM.holder to find elements.
	visiblePanel : null, // for performance issue
	blockUI : false, // if this is true, the keylistener will not work
	idrivePlugin : null,
	hmiPlugin : null,
	gId : 100,
	getUserAgent : function() {
		// workaround for testing with QualityCenter and Firefox/Chrome
		if (typeof TestConfig != "undefined" && TestConfig.userAgent) {
			return TestConfig.userAgent;
		}

		return navigator.userAgent;
	},
	locale : 'de_DE',
	showScroller : true, // will be set to true, if PM.show will be called. a panel can call PM.disableScroller after
	// rendering.
	getDefaultOptions : function() {
		return {
			indicator : true,
			background : false,
			sessionStorage : false,
			localStorage : false,
			refreshStorage : false,
			async : true,
			cache : false
		};
	},
	/**
	 * The PanelManager will be initialized. If there is a hashMark in the url, so the panel must be loaded with the
	 * given hashMark value, else the configured first panel with the configured url will be loaded. If the app wants to
	 * use the geocoder, first the coordinates and geocode search modus will be retrieved. If there are params added to
	 * the app call request, this params will be added to the start panel. <br/><br/> This function will be called
	 * automatically, if the DOM was loaded.
	 */
	init : function() {
		LOG.info('initializing PanelManager');
		PM.setHomemarket();
		// if (I18N.get('appTitle') && typeof cdpTranslations != 'undefined') {
		// document.title = I18N.get('appTitle');
		// }

		this.idrivePlugin = document.getElementById('idrivePlugin');
		this.hmiPlugin = document.getElementById("HMIPlugin");
		this.locale = SM.getGlobal('lastLocale');
		// add callback Function for handling change of display size. in BON & CAB Mode
		if (this.hmiPlugin !== null && PM.getUserAgent().match(/;BON;|;CAB;/) != null) {
			try {
				this.hmiPlugin.addNotificationOnDisplaySize(function(res) {
					PM.changeStyle(res);
				});
			} catch (e) {
				LOG.error('hmiPlugin: could not add NotificationOnDisplaySize.');
			}

		}

		if (window.history.length == 1) {
			// maybe fallback, must be discussed with André Schmidt
		}

		$('#Main').append(
				'<div id="ScrollerNotVisible"></div><div id="ScrollerVisible"></div><div id="Scroller"></div>');

		this.holder = $('#PanelHolder');
		if (!this.holder.length) {
			LOG.error("Panel holder not found, maybe appcache is not working");
		}

		Config.setupFunction();

		// first set the startPageDisplayed flag.
		PM.setStartPageDisplayed(true);
		var initPanel = function() {
			// if no hash is set so load the defined default panel
			var hashValue = PM.getHash();
			if (hashValue.length === 0) {
				var url = Config.startPanelUrl;

				// if the app was called with url params, so read it and give it to the first panel
				url = PM.getUrlWithCurrentParams(url);

				PM.show(Config.startPanelID, url, Config.startPanelOptions);
				return;
			}

			// check the hash of the url, maybe new panel must be loaded.
			if (hashValue) {
				LOG.info("App was called with hash: " + hashValue);
				PM.startedWithHash = true;

				var panelsCounter = hashValue.split('||').length;
				var lastPanelHash = undefined;
				$.each(hashValue.split('||'), function(index) {
					var hashmark = this.toString();
					for ( var i = hashmark.split('::').length; i < 3; i++) {
						hashmark += '::';
					}
					if (index < panelsCounter - 1) {
						PM.stack.push(decodeURIComponent(hashmark));
					} else {
						lastPanelHash = decodeURIComponent(hashmark);
					}
				});

				if (lastPanelHash) {
					PM.loadPanelWithHash(lastPanelHash);
				}
			}

			if (hashValue !== undefined && hashValue.split('||').length <= 1) {
				LOG.info('startPageDisplayed set to true');
				PM.setStartPageDisplayed(true);
			} else {
				PM.setStartPageDisplayed(false);
			}
		};
		var storageDefer = SM.init();
		if (storageDefer) {// localStorage needs to be loaded
			var _initPanel = initPanel;
			initPanel = function() {
				LOG.info('waiting for SM initialized...');
				storageDefer.done(function() {
					_initPanel();
				});
			};
		}
		var geocoderDefer = Geocoder.init();
		if (geocoderDefer) {// current postion needs to be updated
			LOG.info('waiting for Geocoder refreshed...');
			geocoderDefer.done(function() {
				LOG.info('Geocoder refreshed, loading panel...');
				initPanel();
			});
		} else {
			initPanel();
		}
	},
	loadPanelWithHash : function(lastPanelHash) {
		LOG.info('load panel with hash: ' + lastPanelHash);
		hash = lastPanelHash.split('::');

		if (hash.length > 0) {
			if ($('#' + hash[0]).length) {
				// panel already exists, so show it only
				PM.show(hash[0]);
				return;
			}
		}

		if (hash.length == 3) {
			var modus = undefined;
			if (hash[2] == 'modus') {
				modus = SM.getSessionGlobal('GeocoderLocationType');
			}
			if (hash[2] == 'session') {
				PM.load(hash[0], hash[1], {
					sessionStorage : true
				});
			} else if (hash[2] == 'local') {
				PM.load(hash[0], hash[1], {
					localStorage : true
				});
			} else if (hash[2] == 'dest' || modus == 'dest') {
				PM.loadWithDestination(hash[0], hash[1], {
					doNotShowNoPositionError : false,
					useNewestCoordinate : true
				});
			} else if (hash[2] == 'other' || modus == 'other') {
				PM.loadWithOtherLocation(hash[0], hash[1]);
			} else if (hash[2] == 'cur' || modus == 'cur' || typeof modus !== "undefined") {
				PM.loadWithPosition(hash[0], hash[1], {
					doNotShowNoPositionError : false,
					useNewestCoordinate : true
				});
			} else {
				PM.show(hash[0], hash[1]);
			}
		} else if (hash.length == 2) {
			PM.show(hash[0], hash[1]);
		} else {
			this.show(hash[0]);
		}
	},
	/**
	 * The idrive-plugin will be used to set the loading indicator of the browser.
	 * 
	 * @param enabled:boolean
	 *            A boolean for indicating the loader.
	 */
	setLoadIndicator : function(enabled) {
		LOG.info('show load indicator of browser: ' + enabled);
		try {
			this.idrivePlugin.setBrowserActivity(enabled);
		} catch (e) {
			LOG.error('Could not set load indicator. Problem with idrive-plugin: ' + e);
		}
	},
	/**
	 * The idrive-plugin will be used to set the start page of the browser.
	 * 
	 * @param enabled:boolean
	 *            A boolean for displaying start page.
	 */
	setStartPageDisplayed : function(enabled) {
		LOG.info('document.referrer = [' + document.referrer + ']');
		if (!Config.ignoreReferrer && document.referrer) {
			enabled = false;
			if (window.location.href.split(window.location.hash)[0] == document.referrer) {
				LOG.info('Invalid referrer');
				enabled = true;
			}
		}
		if (PM.isStartPage()) {
			LOG.info('BON start page is shown');
			enabled = true;
		}
		try {
			LOG.info('try to set startPageDisplay(' + enabled + ').');
			this.idrivePlugin.setStartPageDisplayed(enabled);
		} catch (e) {
			LOG.error('Could not set startPageDisplay(' + enabled + ').');
		}
	},
	/**
	 * Call EFI-plugin to exit the current browser. This works only in CAB Browser.
	 */
	exitBrowser : function() {
		try {
			LOG.info('Closing Browser...');
			EFIHelper.exitBrowser(null);
		} catch (e) {
			LOG.error('Could not close Browser.');
		}
	},

	/**
	 * Loads the page with the given url synchronisly without AJAX. A new DOM will be created. <br/><br/> This function
	 * should be used only for loading new applications.
	 * 
	 * @param url:string
	 *            The relative or absolute URL for the new panel.
	 * @param doReplace:boolean
	 *            if it set to true, so replace the current location (no history)
	 */
	loadPage : function(url, doReplace) {
		PM.showLoadIndicator(true);
		PM.isLoadPageCalled = true;
		if (doReplace) {
			window.location.replace(url);
		} else {
			window.location.href = url;
		}
	},
	/**
	 * @param panelId
	 * @param url
	 * @param [options:map}
	 *            {useNewestCoordinate:true|false}
	 */
	loadWithPosition : function(panelId, url, options) {
		options = $.extend(PM.getDefaultOptions(), options);
		options = $.extend(options, {
			geocoder : 'cur'
		});
		PM.load(panelId, url, options);
	},
	/**
	 * @param panelId
	 * @param url
	 * @param [options:map}
	 *            {useNewestCoordinate:true|false}
	 */
	loadWithDestination : function(panelId, url, options) {
		options = $.extend(PM.getDefaultOptions(), options);
		options = $.extend(options, {
			geocoder : 'dest'
		});
		PM.load(panelId, url, options);
	},
	/**
	 * @param panelId
	 * @param url
	 * @param [options:map}
	 *            {useNewestCoordinate:true|false}
	 */
	loadWithOtherLocation : function(panelId, url, options) {
		options = $.extend(PM.getDefaultOptions(), options);
		options = $.extend(options, {
			geocoder : 'other'
		});
		PM.load(panelId, url, options);
	},
	/**
	 * Loads a panel from the given relative or absolute url. Panel will be added to the DOM.
	 * 
	 * @param panelId:string
	 *            The id for the new panel. It does not matter what id the panel returns. Always this id will be used
	 *            for it.
	 * @param url:string
	 *            The relative or absolute URL for the new panel.
	 * @param [options:map]
	 *            A set of key/value pairs, which configure the loading. <code>
	 *			{
	 * 				indicator : true, // the load indicator will be shown.
	 * 				domExpiryTime : 600, // if not set, no caching will be used. Time is in seconds. For this time, the DOM content of the panel will not be refreshed.
	 * 				background : true, // no load indicator will be shown and if the result was loaded. The result will not be displayed.
	 * 				callback : function(){ }, // this function will be called after successfully loading the result.
	 *				errorCallback : function(){ }, // this function will be called, if there are problems during the loading
	 *				geocoder : 'mode'|'cur'|'dest'|'navi', // use the Geocoder and add the coordinates depending on the option.
	 *				sessionStorage : true, // looks at sessionStorage, if not there, it will be added after loading
	 *				localStorage : true, // looks at localStorage, if not there, it will be added after loading
	 *				refreshStorage: false // force to refresh the storage
	 *				resetHistory: false // resets the history stack before the new panel will be loaded.
	 *				async: false 
	 *				geoData: GeoData
	 *			}
	 *			</code>
	 */
	load : function(panelId, url, options, loadDefer) {
		options = $.extend(PM.getDefaultOptions(), options);
		LOG.info('load() with options: ' + JSON.stringify(options));

		if (options.geocoder) {
			Geocoder.loadPanelWithCoordinates(panelId, url, options);
			return;
		}

		if (options.sessionStorage && !options.refreshStorage) {
			if (SM.loadPanel(panelId, options)) {
				return;
			}
		}
		if (options.localStorage && !options.refreshStorage) {
			if (SM.loadPanel(panelId, options)) {
				return;
			}
		}

		if (options.resetHistory) {
			PM.resetHistory();
		}

		if (options.refreshStorage) {
			// remove panel from storage and DOM
			SM.clearPanel(panelId);
			$('.panel#' + panelId + ',.detailPanel#' + panelId).remove();
		}

		if (options.domExpiryTime) {
			LOG.info('cache page for ' + options.domExpiryTime + "s.");
			var panel = $('.panel#' + panelId + ',.detailPanel#' + panelId);
			if (panel.length) {
				if (this.isNotExpired(panel.attr('cdpLastLoaded'), options.domExpiryTime)) {
					PM.show(panelId);
					return;
				}
			}
		}

		LOG.info("Loading panel from url=" + url + " with id=" + panelId);

		var method = "GET";
		if (options.postData) {
			method = "POST";
		}

		var postData = options.postData;

		// force reload, to prevent loading from browser-cache
		if (options.localStorage || options.sessionStorage) {
			if (!postData || postData.length === 0) {
				postData = '_t=' + PM.now();
			} else {
				postData += '&_t=' + PM.now();
			}
		}
		$.ajax({
			url : url,
			type : method,
			dataType : 'xml',
			data : postData,
			async : options.async,
			cache : options.cache,
			timeout : Config.ajaxTimeout,
			beforeSend : function(jqXHR) {
				++PM.gId;
				LOG.info('ajax (#' + PM.gId + ') firing to: ' + this.url);
				this.startTime = new Date().getTime();
				if (options.indicator) {
					PM.showLoadIndicator(true);
				}
				PM.setLoadIndicator(true);
			},
			complete : function(jqXHR) {
				LOG.info('ajax (#' + PM.gId + ') completed after ' + (new Date().getTime() - this.startTime) + 'ms.');
				PM.setLoadIndicator(false);
				if (loadDefer) {
					loadDefer.resolve();
				}
			},
			error : function(jqXHR) {
				LOG.error('ajax (#' + PM.gId + ') error: [' + jqXHR.status + ']');

				PM.showLoadIndicator(false);
				if (options.errorCallback) {
					if (jqXHR.status == 404) {
						options.errorCallback(CDPError.WrongURL);
					} else {
						options.errorCallback(CDPError.NoConnection);
					}
					return;
				}

				if (PM.isLoadPageCalled) {
					return;
				} else {
					PM.showError(CDPError.NoConnection);
				}
			},
			/**
			 * @param xml:string
			 *            the response (panel-xml or other data)
			 */
			success : function(xml, textStatus, jqXHR) {
				LOG.info('ajax (#' + PM.gId + ') success: [' + jqXHR.status + ']');
				PM.showLoadIndicator(false);
				var response = $(xml).find("response");
				var cachePanel = true;
				var responseLocale = response.attr('locale');
				if (responseLocale !== undefined && responseLocale != PM.locale) {
					PM.locale = responseLocale;
					SM.setGlobal('lastLocale', PM.locale);
					SM.clear('StoredGeoData_cur');
					SM.clear('StoredGeoData_dest');
				}

				if (response.attr('market')) {
					PM.setHomemarket(response.attr('market'));
				}

				try {
					this.status = parseInt(response.attr('status'), 10);
					if (isNaN(this.status)) {
						PM.showError(CDPError.WrongURL);
						return;
					}
					LOG.info('nbt response: code=' + this.status + '; locale=' + PM.locale);
					switch (this.status) {
					case 100:
						// nothing to do
						break;
					case 500:// internal server error
						cachePanel = false;// no break, further is handled in 200
					case 200: // a panel was returned
						// add to temp and set the panelId to the first element
						var tempDiv = $(document.createElement("div"));
						tempDiv.append(response.text());
						tempDiv.find('div:first').attr('id', panelId);

						// remove all panels with the same IDs from DOM
						tempDiv.children().each(function() {
							var id = $(this).attr('id');
							LOG.info('Panel with id=' + id + ' returned.');
							if (id !== null && id.length > 0) {
								LOG.info("returned panelId: [" + id + "]");
								PM.holder.find('.panel#' + id + ',.detailPanel#' + id).remove();
								if (PM.visiblePanel !== null && PM.visiblePanel.attr('id') == id) {
									PM.visiblePanel = null;
								}
							}
						});

						// add all panels and show the first panel
						PM.holder.append(tempDiv.children());
						// test if url gets coordinates attached
						var newPanel = $('.panel#' + panelId + ',.detailPanel#' + panelId);
						if (options.geoData) {
							newPanel.attr('cdpGeoData', escape(JSON.stringify(options.geoData)));
						}

						newPanel.attr('locale', response.attr('locale'));

						newPanel.attr('cdpLastLoaded', PM.now());
						if (url !== undefined) {
							newPanel.attr('cdpURL', url);
						}
						if (options.originalUrl) {
							newPanel.attr('cdpURL', options.originalUrl);
						}

						if (options.sessionStorage && cachePanel) {
							newPanel.attr('cdpMode', 'session');
							SM.storePanel(panelId, options);
						}
						if (options.localStorage && cachePanel) {
							newPanel.attr('cdpMode', 'local');
							SM.storePanel(panelId, options);
						}

						if (!options.background) {
							PM.show(panelId, url);
						}

						if (options.callback) {
							options.callback();
						}

						break;
					case 300:// a url for redirect was returned
						LOG.info('redirect: ' + response.text());

						jqXHR.cancelCompleteCallback = true;

						if (response.text().indexOf('http') === 0 && response.attr('widget') != 'true') {
							PM.loadPage(response.text());
						} else {
							PM.load(panelId, response.text(), options);
						}
						break;
					case 401:
						LOG.info('authentication failed: ' + response.text());
						EFIHelper.doUSSOauth(function(efiData) {
							LOG.info('doUssoAuth -> ACK : ' + efiData.ACK);
							if (efiData.ACK) {
								PM.load(panelId, url, options);
							} else {
								PM.showError(CDPError.LoginFailed);
							}
						}, parseInt(response.text(), 10));
						break;
					case 600:
						var callbackFunction = response.attr('callback');
						if (callbackFunction && callbackFunction.length) {
							var geoData = '{}';
							if (options.geoData) {
								geoData = JSON.stringify(options.geoData).replace(/\'/g, '\\\'');
							}
							var locale = response.attr('locale');
							LOG.info("custom response -> callback = " + callbackFunction);
							var payload = $.trim(response.text()).replace(/\>[\n\t\r\s]+\</g, '><').replace(/\'/g,
									'\\\'');
							jqXHR.cancelCompleteCallback = eval(callbackFunction + "('" + payload + "', '" + panelId
									+ "', '" + geoData + "', '" + locale + "');");
						}
					}
				} catch (e) {
					LOG.error(e.message);
					if (options.errorCallback) {
						options.errorCallback(CDPError.NoConnection);
					} else {
						PM.showError(CDPError.ParsingException);
					}
				}
			}
		});
	},
	/**
	 * Call EFIHelper to go back to the predefined home page.
	 */
	goHome : function() {
		EFIHelper.goHome(function(efiData) {
		});
	},
	/**
	 * Show an error panel accordig to the given error code.
	 * 
	 * @param errorCode:string
	 *            One of the error codes defined in the map <code>Error</code>
	 */
	showError : function(errorCode) {
		if (!errorCode) {
			errorCode = CDPError.Unexpected;
		}
		LOG.error('An error occured: ' + errorCode);
		var errorPanel = $('#GenericPanelError');
		if (!errorPanel.length) {
			var content = '';
			content += '<div id="GenericPanelError" class="panel nohistory">';
			content += '<div class="header">';
			content += '<div class="icon error"></div>';
			content += '<div class="title"></div>';
			content += '<div class="clear"></div>';
			content += '</div>';
			content += '<div class="contentContainer">';
			content += '<ul class="content">';
			content += '<li class="text"><div></div></li>';
			content += '</ul></div></div>';
			PM.holder.append(content);
			errorPanel = $('#GenericPanelError');
		}

		errorPanel.find('.title').text(I18N.get('errorTitle'));
		errorPanel.find('.text div').text(I18N.get(errorCode));

		PM.show('GenericPanelError');
	},
	/**
	 * show the panel, if panelId could not be loaded and an url is given, so load the panel with the given relative or
	 * absolute url before showing
	 * 
	 * @param panelId:string
	 *            The id for the new panel. It does not matter what id the panel returns. Always this id will be used
	 *            for it.
	 * @param [url:string]
	 *            The relative or absolute URL for the new panel.
	 */
	showLoadIndicator : function(enable) {
		if (enable) {
			$('#GenericPanelProgress').addClass('show');
			this.blockUI = true;
		} else {
			$('#GenericPanelProgress').removeClass('show');
			this.blockUI = false;
		}
	},
	/**
	 * close toolbar menu
	 */
	closeToolbarMenu : function() {
		var toolbarMenu = PM.visiblePanel.find('.submenu:visible');
		if (toolbarMenu.length) {
			var menuLink = toolbarMenu.closest('li');
			toolbarMenu.find('.selected').switchSelected(menuLink);
			toolbarMenu.parent().toggle();
			menuLink.removeClass('inactive');
		}
	},
	/**
	 * show toolbar menu
	 * 
	 * @param [toolbarEntry :
	 *            HTML element] current toolbar entry (usually a 'li' element), its action will open a toolbar menu
	 */
	showToolbarMenu : function(toolbarEntry) {
		var menu = $(toolbarEntry).find('.toolbar.submenu');
		var toolbarHeight = $(toolbarEntry).parent().height();
		var toolbarTop = $(toolbarEntry).offset().top;
		if ((menu.height() + toolbarTop) > toolbarHeight) {
			toolbarTop = toolbarHeight - menu.height();
		}
		menu.css('top', toolbarTop);
		menu.parent().toggle();
		$(toolbarEntry).switchSelected(menu.find('li').first());
		$(toolbarEntry).addClass('inactive');
		menu.parent().css('opacity', 1);
	},
	/**
	 * select submenu
	 * 
	 * @param [event :
	 *            javascript event] event triggered by selecting submenu
	 * @param [submenu :
	 *            HTML element] current submenu element
	 */
	selectSubmenu : function(event, submenu) {
		var selectedEntry = $(submenu).find('li.selected');
		var menuLink = $(submenu).closest('div').parent();
		// update the link icon
		menuLink.find('img').first().attr('src', selectedEntry.find('img').attr('src'));

		// switch selection
		selectedEntry.switchSelected(menuLink);
		selectedEntry.closest('div').toggle();
		menuLink.removeClass('inactive');

		// resort the menu entries
		var selEntry = selectedEntry.clone();
		var otherEntries = selectedEntry.siblings().clone();
		var menu_ul = selectedEntry.parent();
		menu_ul.empty();
		menu_ul.append(selEntry);
		menu_ul.append(otherEntries);

		event.stopPropagation();
	},
	/**
	 * called by time input element to set time
	 * 
	 * @param [timebox :
	 *            HTML element] current time input element.
	 */
	setTime : function(timebox) {
		PM.blockUI = true;
		$(document).off("keydown", '*');
		$(document).on("keydown", '*', {
			timebox : $(timebox)
		}, timeBoxKeydownHandler);

		var hour = $(timebox).find('span.hour');
		var minute = $(timebox).find('span.minute');
		var suffix = $(timebox).find('span.suffix');
		// init timebox
		if (isNaN(parseInt(hour.text(), 10))) {
			if ($(timebox).attr('cdptimemode') == '24h') {
				hour.text('00');
			} else {
				hour.text('12');
			}
		}
		if (isNaN(parseInt(minute.text(), 10))) {
			minute.text('00');
		}
		// end init
		if ((!hour.hasClass('adjustment')) && (!minute.hasClass('adjustment'))) {
			hour.addClass('adjustment');
		} else {
			if (hour.hasClass('adjustment')) {
				hour.removeClass('adjustment');
				minute.addClass('adjustment');
			} else {
				$(timebox).find('input').val(hour.text() + ':' + minute.text() + suffix.text());
				minute.removeClass('adjustment');
				PM.blockUI = false;
				$(document).off("keydown", '*');
			}
		}
	},
	/**
	 * called by the timeBoxKeydownHandler to count up the time
	 * 
	 * @param [data :
	 *            event data] contains current time input JQUERY element
	 */
	countUpTime : function(data) {
		var adjustment = data.timebox.find('.adjustment');
		var currentTime = parseInt(adjustment.text(), 10);
		var timeMode = data.timebox.attr('cdptimemode');
		if (isNaN(currentTime)) {
			currentTime = 0;
		} else {
			if (adjustment.hasClass('hour')) {
				if (timeMode == '24h') {
					if (currentTime < 23) {
						currentTime++;
					} else {
						currentTime = 0;
					}
				} else {
					if (currentTime < 12) {
						currentTime++;
						if (currentTime == 12) {
							if (data.timebox.find('.suffix').text() == 'am') {
								data.timebox.find('.suffix').text('pm');
							} else {
								data.timebox.find('.suffix').text('am');
							}
						}
					} else {
						currentTime = 1;
					}
				}
			} else {
				if (currentTime < 59) {
					currentTime++;
				} else {
					currentTime = 0;
				}
			}
		}
		if (currentTime < 10) {
			currentTime = '0' + currentTime;
		}
		adjustment.text(currentTime);
	},
	/**
	 * called by the timeBoxKeydownHandler to count down the time
	 * 
	 * @param [data :
	 *            event data] contains current time input JQUERY element
	 */
	countDownTime : function(data) {
		var adjustment = data.timebox.find('.adjustment');
		var currentTime = parseInt(adjustment.text(), 10);
		var timeMode = data.timebox.attr('cdptimemode');
		if (isNaN(currentTime)) {
			currentTime = 0;
		} else {
			if (adjustment.hasClass('hour')) {
				if (timeMode == '24h') {
					if (currentTime <= 0) {
						currentTime = 23;
					} else {
						currentTime--;
					}
				} else {
					if (currentTime <= 1) {
						currentTime = 12;
					} else {
						currentTime--;
						if (currentTime == 11) {
							if (data.timebox.find('.suffix').text() == 'am') {
								data.timebox.find('.suffix').text('pm');
							} else {
								data.timebox.find('.suffix').text('am');
							}
						}
					}
				}
			} else {
				if (currentTime <= 0) {
					currentTime = 59;
				} else {
					currentTime--;
				}
			}
		}
		if (currentTime < 10) {
			currentTime = '0' + currentTime;
		}
		adjustment.text(currentTime);
	},
	/**
	 * called to release focus during time setting
	 * 
	 * @param [timebox :
	 *            HTML element] current time input element.
	 */
	releaseTimeFocus : function(data) {
		var hour = data.timebox.find('.hour');
		var minute = data.timebox.find('.minute');
		var suffix = data.timebox.find('.suffix');
		data.timebox.find('input').val(hour.text() + ':' + minute.text() + suffix.text());
		data.timebox.find('span').removeClass('adjustment');
		PM.blockUI = false;
		$(document).off("keydown", '*');
	},
	/**
	 * Show an existing panel. If the panel with the given id could not be found in the current DOM, the paramter url
	 * and options will be used to load a new one.
	 * 
	 * @param [url:string]
	 *            The relative or absolute URL for the new panel.
	 * @param [options:map]
	 *            A set of key/value pairs, which configure the loading.
	 */
	show : function(panelId, url, options) {
		PM.showScroller = true; // must be set every time, maybe last panel has
		// changed the value
		if ("GenericPanelProgress" == panelId) {
			this.showLoadIndicator(true);
			return;
		} else {
			this.showLoadIndicator(false);
		}

		if (this.visiblePanel && this.visiblePanel.attr('id') == panelId) {
			// currentPanel has same id
			return;
		}

		// close the toolbat menu if it has been opened
		if (this.visiblePanel && this.visiblePanel.find('.submenu:visible')) {
			LOG.info('show() -> closing toolbar menu');
			PM.closeToolbarMenu();
		}

		var newPanel = this.holder.find('.panel#' + panelId + ',.detailPanel#' + panelId);
		if (!newPanel.length && url !== undefined && url !== null) {
			// panel not found, maybe it is dynamic and must be loaded.
			this.load(panelId, url, options);
			return;
		} else {
			// for detail panels set the scroll buttons
			if (newPanel.is('.detailPanel')) {

				if (Config.homemarket != 'TW') {
					// add textToSpeech button if there are divs with class tts, not for RSE or NBT_ASN
					var ua = PM.getUserAgent();
					if (ua !== undefined
							&& (ua.indexOf(';tts;') > -1 || ua.indexOf('Firefox') > -1 || ua.indexOf('Chrome') > -1)) {
						if (newPanel.find('div.tts').length !== 0 && !newPanel.find('li.textToSpeech').length) {
							newPanel
									.find('.toolbar')
									.append(
											'<li class="textToSpeech" onclick="PM.readPage();"><div class="icon textToSpeech"></div></li>');
							newPanel.find('.textToSpeech').attr('title', I18N.get('readOut'));
						}
					}
				}

				// add scroll buttons
				if (!newPanel.is('.fix') && !newPanel.find('li.scrollUp').length) {
					newPanel
							.find('.toolbar')
							.each(
									function() {
										if (!$(this).hasClass('submenu')) {
											$(this)
													.prepend(
															'<li class="scrollUp" onclick="PM.scrollUpPage();"><div class="icon scrollUp"></div></li>');
											$(this)
													.append(
															'<li class="scrollDown" onclick="PM.scrollDownPage();"><div class="icon scrollDown"></div></li>');
										}
									});
				}
			}
			if (Config.homemarket !== undefined) {
				PM.setSpeedlockClass(newPanel, Config.homemarket);
				SM.setGlobal('cdpHomemarket', Config.homemarket);
			} else if (SM.getGlobal('cdpHomemarket') !== undefined && SM.getGlobal('cdpHomemarket') !== '') {
				PM.setSpeedlockClass(newPanel, SM.getGlobal('cdpHomemarket'));
			}

			// shift content before panel will be visible
			PM.shiftContent(newPanel);

			// first make visible, then set scrollButtons inactive, if the content fits into the viewport
			this.changeVisiblePanel(newPanel);

			// maybe panel was not corrected for new screen size
			if (PM.lastHMIPluginScreenSize && PM.lastHMIPluginScreenSize.xSize != $('#Main').width()) {
				this.changeStyle(PM.lastHMIPluginScreenSize);
			}

			if (newPanel.find('li.scrollUp').length) {
				if (newPanel.outerHeight() <= newPanel.getViewportHeight()) {
					newPanel.find('li.scrollUp').addClass('inactive');
					newPanel.find('li.scrollDown').addClass('inactive');
				}
			}

			if (!newPanel.attr('isCutted')) {
				this.cutPoiListText();
				this.cutTitleText();
				newPanel.attr('isCutted', true);
			}
			if (PM.lastMovingStatus()) {
				PM.activateSpeedlock();
			} else {
				PM.releaseSpeedlock();
			}
		}
	},
	startDrivingLockedTimer : function() {
		if (!(PM.getUserAgent().indexOf('NBT_RSE;') > -1) && !Timers['checkMovingInterval']) {
			// start drivingLock mechanismus for all user-agents, except NBT RSE, check every 2s
			Timers['checkMovingInterval'] = window.setInterval(function() {
				PM.checkMoving();
			}, 2000);
		}
	},
	stopDrivingLockedTimer : function() {
		window.clearInterval(Timers['checkMovingInterval']);
		Timers['checkMovingInterval'] = undefined;
	},
	/**
	 * Cuts the texts of poilist items dynamically according to the size of the distance String on the right.
	 */
	cutPoiListText : function() {
		$('.visible .poiListItem').each(function() {
			var limitedText = $(this).find('.limited');
			var rightText = $(this).find('.right');
			var marker = $(this).find('.marker');
			if (rightText.length) {
				var rightWidth = rightText.outerWidth();
				limitedText.width($(this).width() - rightWidth - marker.width() - 10);
			}
			PM.cutTextForElement(limitedText);
		});
	},
	/**
	 * Cuts the text of the header title according to the size of an existing providerlogo and/or toolbar icons.
	 */
	cutTitleText : function() {
		var title = $('.visible.detailPanel .header .title, .visible.panel > .header .title');
		if (title.attr('originalTitle') === undefined) {
			title.attr('originalTitle', title.text());
		}
		title.text(title.attr('originalTitle'));
		var providerLogo = $('.visible.detailPanel .header .providerlogo, .visible.panel > .header .providerlogo');
		var toolbar = $('.visible.detailPanel .header .toolbar, .visible.panel > .header .toolbar');
		var icon = $('.visible.detailPanel .header .icon, .visible.panel > .header .icon');

		title.css('width', '');

		var offset = 0;
		if ($('.visible .header').parents('.detailPanel').length) {
			offset = 33;
		}

		var usedWidth = 15;
		if (providerLogo.length) {
			usedWidth += providerLogo.outerWidth();
		}
		if (toolbar.length) {
			usedWidth += toolbar.outerWidth();
		}
		if (icon.length) {
			usedWidth += icon.outerWidth();
		}

		title.width(title.width() - usedWidth - offset);
		PM.cutTextForElement(title);
	},
	cutTextForElement : function(element) {
		try {
			if (!$('#tempText').length) {
				$('body').append('<div id="tempText"></div>');
			}
			var tempDiv = $('#tempText');

			var text = element.text();
			tempDiv.text(text);

			var elewidth = element.width();
			var testwidth = tempDiv.width();

			if (testwidth > elewidth) {
				do {
					var textlen = text.length;
					var newlen = textlen;

					text = text.slice(0, newlen - 1);
					tempDiv.text(text);

					elewidth = element.width();
					testwidth = tempDiv.width() + 30;
				} while (testwidth > elewidth);
				element.text(text + '…');
			}
		} catch (e) {
			LOG.error(e.message);
		}
	},
	shiftContent : function(panel) {
		if (panel && Config.shiftContentSettings && Config.shiftContentSettings.indexOf(Config.homemarket) > -1) {
			LOG.info('Homemarket: ' + Config.homemarket + ' shifting content...');
			panel.find('.text, .title, .link div').not('.shifted').each(function() {
				if (!$(this).find('div').length) {
					var origTxt = $(this).html();
					if (origTxt.length > 0) {
						$(this).html(PM.shiftCharacters(origTxt));
						$(this).addClass('shifted');
					}
				}
			});
		}
	},
	shiftCharacters : function(input) {
		if (!input || input.length === 0) {
			return "";
		}

		var charPos = 1;
		var testChar = input.substring(charPos - 1, charPos);

		var output = "";
		while (testChar !== "") {

			testChar = input.substring(charPos - 1, charPos);
			if (testChar.charCodeAt(0) >= 65280 && testChar.charCodeAt(0) <= 65374) {
				// Zeichenbereich zwischen U+FF00 und U+FF5E verschieben
				// http://www.utf8-zeichentabelle.de/unicode-utf8-table.pl
				testChar = String.fromCharCode(testChar.charCodeAt(0) - 65248);
			}
			output += testChar;

			charPos++;
		}
		return output;
	},
	/**
	 * A EFIHelper.js function for setting a destination in the navigation system will be called.
	 * 
	 * @param lat:long
	 *            The latitude in WGS84.
	 * @param lon:long
	 *            The longitude in WGS84.
	 * @param descr:string
	 *            The description of the destination, which will be displayed in the navigation system.
	 */
	startNavigation : function(lat, lon, descr) {
		var ua = PM.getUserAgent();
		if (ua && ua.indexOf('NBT_RSE') > -1) {
			// show the confirmation panel only on the RSE browser
			var headerHtml = PM.visiblePanel.find(".header").clone();
			Geocoder.showConfirmationPanel(headerHtml);
		}

		EFIHelper.setDestWGS84(function(efiData) {
			if (efiData.ACK) {
				LOG.info('navigation destination was set ' + lat + ', ' + lon);
			} else {
				PM.showError(CDPError.SetDestinationFailed);
			}
		}, lat, lon, encodeURIComponent(descr));
	},
	/**
	 * A EFIHelper.js function for starting a phone call will be called.
	 * 
	 * @param number:string
	 *            The phone number.
	 */
	makeVoiceCall : function(number) {
		EFIHelper.makeVoiceCall(function(efiData) {
			if (efiData.ACK) {
				LOG.info('number was called.');
			} else {
				PM.showError(CDPError.MakeVoiceCallFailed);
			}
		}, number);
	},
	/**
	 * start vehicle's internet browser by calling the <code>EFIHepler</code>.
	 * 
	 * @param url:string
	 *            Url of the page to be loaded in the browser.
	 */
	loadInternet : function(url) {
		url = encodeURIComponent(url);
		EFIHelper.startBIN(function(efiData) {
			if (efiData.ACK) {
				LOG.info('BIN was started.');
				PM.exitBrowser();
			} else {
				PM.showError(CDPError.BINCouldNotStarted);
			}
		}, url);
	},
	/**
	 * execute the click action of the current li element, if available. If the element has the class inactive, the
	 * action will not be called.
	 */
	execute : function() {
		var selected = this.visiblePanel.find('li.selected');
		if (selected.length && selected.click && !selected.is('.inactive')
				&& (selected.isTopVisible() || selected.isBottomVisible())) {
			if (PM.visiblePanel.is('.restorePosition')) {
				if (selected.parent('.content').length) {
					SM.setSession('LastUsedElement', selected.index());
				} else {
					SM.setSession('LastUsedElement', -1);
				}
			}
			selected.click();
		}
	},
	/**
	 * Show the last previous panel in the panel history (see <code>PM.show</code>). If the last element of the panel
	 * history has been reached, the previous URL in the browser's history list will be called.
	 */
	back : function() {
		// close the toolbar menu if it exists
		if (PM.visiblePanel !== null && PM.visiblePanel.find('.submenu:visible').length) {
			LOG.info('back() -> closing toolbar menu');
			PM.closeToolbarMenu();
			return;
		}

		LOG.info('back() -> stack = ' + PM.stack.length);
		if (PM.stack.length < 1) {
			PM.isLoadPageCalled = true;
			window.history.back();
			return;
		}

		var panelId = PM.visiblePanel.attr('id');

		if (PM.stack.length == 1 && panelId == PM.stack[0].split('::')[0]) {
			// errors without showing a warning panel is needed, for catching ajax call
			PM.isLoadPageCalled = true;

			// first panel, so do history back
			window.history.back();
			return;
		}

		if (PM.stack.length >= 1 && panelId != PM.stack[PM.stack.length - 1].split('::')[0]) {
			// panel was loaded without adding to stack
			LOG.info("Current panel is not the same as the last panel of the stack.");
			this.loadPanelWithHash(PM.stack[PM.stack.length - 1]);
		} else if (PM.stack.length > 1) {
			// remove last inserted
			PM.stack.pop();
			this.loadPanelWithHash(PM.stack[PM.stack.length - 1]);
		}

		if (PM.stack.length == 1) {
			PM.setStartPageDisplayed(true);
		}

		PM.showHistoryHashmark();
	},
	scrollTop : function() {
		if (this.visiblePanel.length) {
			while (this.visiblePanel.getScrollHeight() > 0) {
				this.visiblePanel.scrollUp();
			}
			this.visiblePanel.scrollUp();
		}
	},
	scrollUpPage : function() {
		if (this.visiblePanel.length) {
			for ( var i = 0; i < Config.scrollPageRowsCount; i++) {
				this.visiblePanel.scrollUp();
			}
		}
	},
	scrollDownPage : function() {
		if (this.visiblePanel.length) {
			for ( var i = 0; i < Config.scrollPageRowsCount; i++) {
				this.visiblePanel.scrollDown();
			}
		}
	},
	scrollUp : function() {
		if (this.visiblePanel.length) {
			this.visiblePanel.scrollUp();
		}
	},
	scrollDown : function() {
		if (this.visiblePanel.length) {
			this.visiblePanel.scrollDown();
		}
	},
	/**
	 * With the function the current visible panel will be scanned for div elements with the css class <code>tts</code>
	 * and the header with the css class <code>header</code> if there div elements with class <code>tts</code>, the
	 * content of them will be used to call the <code>TTS.read(...)</code> function.
	 */
	readPage : function() {
		var header = this.visiblePanel.find('.content div.ttsheader');
		if (!header.length) {
			header = this.visiblePanel.find('.content div.header');
		}
		header = header.first().text();

		var text = "";
		this.visiblePanel.find('.content div.tts').each(function() {
			text += $(this).text() + "\r\n\r\n";
		});
		LOG.info('start reading');
		TTS.read(PM.locale, header, text.trimRight());
	},
	/**
	 * This function find contents of all detail panels with a given hash string and passes them to the TTS plugin.
	 * 
	 * @param header
	 *            the header text to be passed to the TTS plugin
	 * @param headerHash
	 *            the hash string that the detail panels should have as their class
	 */
	readAll : function(header, headerHash) {
		var ttsText = '';
		$('.' + headerHash + '.detailPanel').each(function() {
			var tmpText = '';
			$(this).find('.content div.tts').each(function() {
				tmpText += $(this).text();
				if ($(this).is('.ttsheader')) {
					tmpText += '&lt;break time=&quot;' + 500 + '&quot;/&gt;';
				}
			});
			if (tmpText.length) {
				ttsText += tmpText + "\r\n\r\n";
			}
		});
		LOG.info('start reading all');
		TTS.read(PM.locale, header, ttsText.trimRight());
	},
	/**
	 * If nothing is selected already, the first interaction element (e.g. link, thumbnail or smartcursor) of the
	 * current visible panel will be selected and focused.<br/><br/> If there are no interaction elements in the
	 * content area, the first toolbar element will be selected.
	 */
	setVisibleSelectedElement : function() {
		var lastUsedElement = -1;

		var visibleNode = PM.visiblePanel.find('li.selected');
		if (!visibleNode.length) {
			if (PM.visiblePanel.is('.detailPanel')) {
				visibleNode = PM.visiblePanel.find('.toolbar li:visible').first();
			} else {
				lastUsedElement = SM.getSession('LastUsedElement');
				if (lastUsedElement !== null && lastUsedElement > -1 && PM.visiblePanel.is('.restorePosition')
						&& $(PM.visiblePanel.find('.content li')[lastUsedElement]).is(':actionElement')) {
					visibleNode = $(PM.visiblePanel.find('.content li')[lastUsedElement]);
				} else {
					lastUsedElement = -1;
					visibleNode = PM.visiblePanel.find('.content li:actionElement:first');
					if (!visibleNode.length) {
						visibleNode = PM.visiblePanel.find('li:actionElement:first');
						if (!visibleNode.length) {
							visibleNode = PM.visiblePanel.find('li:noActionElement:first');
						}
					} else if (!visibleNode.isTopVisible()) {// node is not in the visibel area
						visibleNode = PM.visiblePanel.find('.content li:noActionElement:first');
					}
				}
			}
		}

		if (visibleNode.length) {
			visibleNode.addClass('selected');

			if (lastUsedElement > -1) {
				PM.visiblePanel.setScrollHeight(visibleNode.position().top - 120);
			}

			visibleNode.focus();
		}
	},
	/**
	 * @param newStatus
	 * @returns {Boolean} false = staying, true = moving
	 */
	lastMovingStatus : function(newStatus) {
		if (newStatus !== undefined) {
			SM.setSessionGlobal('lastMovingStatus', newStatus);
		} else {
			return SM.getSessionGlobal('lastMovingStatus') === 'true';
		}
	},
	changeVisiblePanel : function(newPanel) {
		LOG.info('new visible panel: ' + newPanel.attr('id'));

		Geocoder.updateSelectPlaceLink();

		if (!newPanel.is('.nohistory')) {
			this.addHistory(newPanel);
		}

		if (this.visiblePanel !== null) {
			// onfocus input fields
			this.visiblePanel.find('.input').blur();

			// remove tooltips
			$('[id^="Tooltip_"]').remove();

			this.visiblePanel.removeClass('visible');
		}

		newPanel.addClass('visible');
		this.visiblePanel = newPanel;
		this.setVisibleSelectedElement();

		// do not close browser, if back button will be pressed
		if (PM.stack.length <= 1 || newPanel.is('#GenericPanelMoving')) {
			PM.setStartPageDisplayed(true);
		} else {
			PM.setStartPageDisplayed(false);
		}

		if (this.visiblePanel.is('[action]')) {
			// panel has a action, so call it
			try {
				eval(this.visiblePanel.attr('action'));
			} catch (e) {
				LOG.info('action of panel could not be processed: ' + this.visiblePanel.attr('action'));
			}
		}

		// set the speechcontrol for new visible panel.
		SpeechControl.init();
		if (!newPanel.is('.detailPanel.speedlocked')) {
			newPanel.setScroller();
		}
		// in case that the selected element is not visible.
		var selected = PM.visiblePanel.find('li:actionElement.selected');
		if (selected.length && selected.position().top >= PM.visiblePanel.getViewportHeight()) {
			selected.switchSelected(PM.visiblePanel.find('li:actionElement:first'));
			PM.scrollTop();
		}
		PM.startDrivingLockedTimer();
	},
	toggleRadioButton : function(element, group) {
		element = $(element);
		var parent = element.parent();
		if (!element.is('.checked')) {
			if (parent.find('.checked.' + group).length) {
				parent.find('.checked.' + group).removeClass('checked');
			}
			element.addClass('checked');
			// save value in input field
			$('#' + group).val(element.attr('cdpValue'));
		}
	},
	toggleCheckbox : function(element, group, maxChecked) {
		element = $(element);
		if (maxChecked && !isNaN(parseInt(maxChecked))) {
			var checked = $('.' + group + '.checked');
			if (checked.length >= maxChecked && !element.is('.checked')) {
				checked.first().removeClass('checked');
			}
		}
		element.toggleClass('checked');

		// save value in input field
		var values = "";
		$('.checked.' + group).each(function(key, value) {
			value = $(value);
			LOG.info(value.attr('cdpValue'));
			if (values.length > 0) {
				values += ',';
			}
			values += value.attr('cdpValue');
		});
		$('#' + group).val(values);
	},
	toggleSmartcursor : function(element, smartCursorClass, action) {
		element = $(element);

		$('#SmartcursorExtended').remove();
		formElem = element.parents('.contentContainer').find('form').clone().empty();
		formElem.attr('id', formElem.attr("id") + "_SmartcursorExtended");
		PM.holder.append($('<div>', {
			'id' : 'SmartcursorExtended',
			'class' : 'panel nohistory',
			'action' : (action && typeof action === 'string') ? action : ''
		}).append($('<div>', {
			'class' : 'header'
		}).append($('<div>', {
			'class' : 'icon'
		}).append(PM.holder.find('.header div.icon img:first').clone())).append($('<div>', {
			'class' : 'title'
		}).append(element.text())).append($('<div>', {
			'class' : 'clear'
		}))).append($('<div>', {
			'id' : 'contentContainer',
			'class' : 'contentContainer'
		})));
		contentList = $('<ul>', {
			'id' : 'contentList',
			'class' : 'content'
		});
		formElem.length <= 0 ? $('#contentContainer').append(contentList) : $('#contentContainer').append(
				formElem.append(contentList));
		contentList.append(element.parent().find('li.SC.' + smartCursorClass).clone());
		contentList.find('li.SC.' + smartCursorClass).removeClass('SC').show();
		PM.show('SmartcursorExtended');

		// if height of panel is now smaller then viewport, so scroll it to zero. maybe some of the top content could be
		// cut off.
		if (this.visiblePanel.outerHeight() <= this.visiblePanel.getViewportHeight()) {
			this.visiblePanel.setScrollHeight(0);
		}

		// scroll to the selected smartCursor
		this.visiblePanel.setScrollHeight(element.offset().top + this.visiblePanel.getScrollHeight()
				- Config.scrollHeight * 2);
	},
	/*
	 * toggleSmartcursor : function(element, smartCursorClass) { element = $(element); var parent = element.parent(); if
	 * (element.is('.activated')) { parent.find('li.SC.' + smartCursorClass).addClass('hidden');
	 * element.removeClass('activated'); // add the bottom class, if there was set one before toggling if
	 * (element.is('.no_bottom')) { element.removeClass('no_bottom'); element.addClass('bottom'); } } else {
	 * parent.find('li.SC').addClass('hidden'); parent.find('li.SC.' + smartCursorClass).removeClass('hidden');
	 * parent.find('li.activated').removeClass('activated'); element.addClass('activated'); // if bottom separator
	 * exists, so add it to the last element of the smartcursor content and remove it from // itself. if
	 * (element.is('.bottom')) { parent.find('li.SC.' + smartCursorClass).last().addClass('bottom');
	 * element.removeClass('bottom'); element.addClass('no_bottom'); // for restoring } } // if height of panel is now
	 * smaller then viewport, so scroll it to zero. maybe some of the top content could be // cut off. if
	 * (this.visiblePanel.outerHeight() <= this.visiblePanel.getViewportHeight()) {
	 * this.visiblePanel.setScrollHeight(0); } // scroll to the selected smartCursor
	 * this.visiblePanel.setScrollHeight(element.offset().top + this.visiblePanel.getScrollHeight() -
	 * Config.scrollHeight * 2); },
	 */
	toggleDropdown : function(element) {
		element = $(element);
		$('#GenericTemp').html(element.find('.options').html());
		$('#GenericTemp').attr('cdpReturnPanel', element.parents('.panel').attr('id'));
		this.show("GenericTemp");
	},
	changeDropdownValue : function(element, inputID) {
		element = $(element);
		$('#' + inputID).val(element.attr('cdpValue'));
		$('#' + inputID).prev().html(element.text());
		PM.show($('#GenericTemp').attr('cdpReturnPanel'));
	},
	toggleDetailLink : function(event, element) {
		detailContent = $(element).find('div.itemDetailContent').first();
		if (event.type == 'focus' && !detailContent.is(':visible')) {
			detailContent.toggle();
		}
		if (event.type == 'blur' && detailContent.is(':visible')) {
			detailContent.toggle();
		}
		event.stopPropagation();// ignoring the event focusin and focusout
	},
	disableScroller : function() {
		PM.showScroller = false;
		$('#ScrollerNotVisible').hide();
		$('#ScrollerVisible').hide();
		$('#Scroller').hide();
	},
	/**
	 * @param id:string
	 * @param url:string
	 */
	addHistory : function(panelObject) {
		// if last panel is the same, regenerate the hash. Maybe the location mode has changed.
		if (PM.stack.length > 0 && PM.stack[PM.stack.length - 1].split('::')[0] == panelObject.attr('id')) {
			PM.stack[PM.stack.length - 1] = this.generateHashMark(panelObject);
		}

		if (PM.stack.length === 0 || PM.stack[PM.stack.length - 1].split('::')[0] != panelObject.attr('id')) {
			PM.stack.push(this.generateHashMark(panelObject));
		}
		PM.showHistoryHashmark();
	},
	generateHashMark : function(panelObject) {
		var id = panelObject.attr('id');
		var url = panelObject.attr('cdpURL');
		var mode = panelObject.attr('cdpMode');
		if (!url) {
			url = '';
		}
		if (!mode) {
			mode = '';
			if (Geocoder.locationType() && Config.startPanelOptions.geocoder) {
				mode = Geocoder.locationType();
			}
		}

		return id + '::' + encodeURI(url) + '::' + mode;
	},
	resetHistory : function() {
		PM.stack = [];
		PM.showHistoryHashmark();
	},
	showHistoryHashmark : function() {
		var hashmark = '';
		$.each(PM.stack, function(index) {
			// only add if url is defined.
			var hashmarkBlock = this.toString();
			if (hashmarkBlock.split('::').length > 0 && hashmarkBlock.split('::')[1].length > 0) {
				hashmark += hashmarkBlock;
				hashmark += '||';
			}
		});
		hashmark = hashmark.slice(0, hashmark.length - 2);

		window.location.replace('#' + hashmark);
	},
	getHash : function() {
		var hash = window.location.hash;
		if (hash) {
			hash = hash.substring(1);
		}
		return hash;
	},
	getUrlWithCurrentParams : function(url) {
		var params = document.location.search;
		if (params.indexOf('?') === 0) {
			if (url.indexOf('?') > -1) {
				url += "&" + params.substring(1);
			} else {
				url += params;
			}
		}
		return url;
	},
	isNotExpired : function(lastTimestamp, maxAgeInSeconds) {
		return (this.now() - lastTimestamp) < (maxAgeInSeconds * 1000);
	},
	now : function() {
		try {
			var res = EFIHelper.getShowTimeDate();
			var hmiDate = new Date(res.showYear, res.showMonth, res.showDay, res.showHour, res.showMinute,
					res.showSecond, 0);
			if (hmiDate.getTime()) {
				return hmiDate.getTime();
			}
		} catch (e) {
		}
		LOG.error("Failed to get vehicle time, using browser time instead...");
		return (new Date()).getTime();
	},
	/**
	 * Submits the given formular to the given targetUrl. The resulting panel will have the given panelId.
	 */
	submit : function(panelId, targetUrl, formular, options) {
		var data = $(formular).find('input,textarea')
				.filter('[cdpTransportMethod = "GET"], :not([cdpTransportMethod])').serialize();
		var postData = $(formular).find('input,textarea').filter('[cdpTransportMethod = "POST"]').serialize();

		if (postData.length > 0) {
			options = $.extend({
				'postData' : postData
			}, options);
		}

		if (targetUrl.indexOf('?') > -1) {
			targetUrl = targetUrl + "&" + data;
		} else {
			targetUrl = targetUrl + "?" + data;
		}
		PM.load(panelId, targetUrl, options);

		return false;
	},
	/**
	 * test if current locale has been changed
	 * 
	 * @deprecated
	 */
	isLocaleChanged : function(locale) {
		var currentLocale = PM.getUserAgent().split(';', 7)[6];
		return (locale != currentLocale);
	},
	activateSpeedlock : function() {
		if (!PM.visiblePanel || PM.visiblePanel.is('.speedlocked')) {
			return;
		}
		if (PM.visiblePanel.is('.geocoderLocked')) {
			PM.visiblePanel.find('.location_other').parents('.link').addClass('inactive');
		}
		if (PM.visiblePanel.is('.drivingLocked')) {
			PM.lastLockedPanel = PM.visiblePanel;
			var content = '';
			if (!$('#GenericPanelMoving').length) {
				content += '<div id="GenericPanelMoving" class="panel nohistory"><div class="contentContainer center" style="margin-top: 180px;">';
				content += '<ul class="content"><li class="text"><div>';
				content += I18N.get('errorMoving');
				content += '</div></div>';
				PM.holder.append(content);
			}
			PM.changeVisiblePanel($('#GenericPanelMoving'));
		}
		if (PM.visiblePanel.is('.clickableLocked')) {
			PM.visiblePanel.find('li[onclick]:not(.textToSpeech)').each(function() {
				if (!$(this).parent().hasClass('toolbar')) {
					$(this).addClass('inactive');
				}
			});
		}
		if (PM.visiblePanel.is('.inputLocked')) {
			PM.visiblePanel.find('.input').each(function() {
				$(this).addClass('inactive');
				$(this).find('input').attr('disabled', 'disabled');
			});
		}
		if (PM.visiblePanel.is('.contentLocked') && !PM.visiblePanel.find('div.lockMsg').length) {
			// locking content
			var contentToLock = PM.visiblePanel.find('.rightContent, .content > div').not(
					'.ttsheader, .header, .ttsheader_off');

			if (contentToLock.length) {
				var scrollheight = PM.visiblePanel.getScrollHeight();
				PM.visiblePanel.find('.content').attr('_scrollheight', scrollheight);
				PM.scrollTop();

				$('#Scroller').hide();
				contentToLock.each(function() {
					if ($(this).find('.ttsheader, .header, .ttsheader_off').length) {
						$(this).find(':not(.ttsheader, .header, .ttsheader_off)').addClass('hidden').addClass(
								'hiddenContent');
					} else {
						$(this).addClass('hidden').addClass('hiddenContent');
					}
				});
				var content = '<div class="center lockMsg" style="margin-top: 90px;">';
				content += I18N.get('errorMoving');
				content += '</div>';
				PM.visiblePanel.find('.content').append(content);
			}
		}
		if (PM.visiblePanel.is('.textLocked') && !PM.visiblePanel.find('.abbr').length) {
			// locking text content
			var text = PM.visiblePanel.find('.content div.text')
					.not('.hidden.tts, .ttsheader, .bottom, .ttsheader_off');
			if (text.length) {
				var scrollheight = PM.visiblePanel.getScrollHeight();
				PM.visiblePanel.find('.content').attr('_scrollheight', scrollheight);
				PM.scrollTop();

				$('#Scroller').hide();
				text.addClass('hidden').addClass('abbr');
				var firstText = $(text.get(0)).removeClass('hidden');

				if (text.length > 1 || firstText.height() > 148) {
					firstText.parent().append($('<div class="text ellipsis">...</div>'));
				}

				if (firstText.height() > 148) {// more than three lines
					firstText.css('height', '129px');// set height of three lines
					firstText.css('overflow', 'hidden');
				}

				if (PM.visiblePanel.find('.content>.right').length) {
					firstText.css('width', '480px');
				}
			}
		}
		if (PM.visiblePanel.is('.scrollingLocked, .contentLocked, .textLocked, .toolbarLocked')) {
			if (PM.visiblePanel.find('li.scrollUp.inactive, li.scrollDown.inactive').length != 2) {
				PM.visiblePanel.find('.scrollUp, .scrollDown').addClass('inactive').attr('title',
						I18N.get('errorMovingShort'));
			}
		}
		if (PM.visiblePanel.is('.toolbarLocked')) {
			PM.visiblePanel.find('.toolbar li').find(':not(div.startNavigation, div.phone)').parent().not(
					'.textToSpeech, .selectPlace').addClass('inactive');
		}
		PM.visiblePanel.addClass('speedlocked');
	},
	releaseSpeedlock : function() {
		if (PM.lastLockedPanel) {
			PM.changeVisiblePanel(PM.lastLockedPanel);
			PM.lastLockedPanel = undefined;
		}
		if (!PM.visiblePanel || !PM.visiblePanel.is('.speedlocked')) {
			return;
		}
		if (PM.visiblePanel.is('.geocoderLocked')) {
			PM.visiblePanel.find('.location_other').parents('.link').removeClass('inactive');
		}
		if (PM.visiblePanel.is('.clickableLocked')) {
			PM.visiblePanel.find('li[onclick]:not(.textToSpeech)').each(function() {
				if (!$(this).parent().hasClass('toolbar')) {
					$(this).removeClass('inactive');
				}
			});
		}
		if (PM.visiblePanel.is('.inputLocked')) {
			PM.visiblePanel.find('.input').each(function() {
				$(this).removeClass('inactive');
				$(this).find('input').removeAttr('disabled');
			});
		}
		if (PM.visiblePanel.is('.contentLocked')) {
			PM.visiblePanel.find('.content div.lockMsg').remove();
			PM.visiblePanel.find('.rightContent, .content .hiddenContent').removeClass('hidden').removeClass(
					'hiddenContent');
			$('#Scroller').show();
			var scrollheight = PM.visiblePanel.find('.content').attr('_scrollheight');
			PM.visiblePanel.find('.content').removeAttr('_scrollheight');
			if (scrollheight) {
				PM.visiblePanel.setScrollHeight(scrollheight);
			}
			PM.visiblePanel.setScroller();
		}
		if (PM.visiblePanel.is('.textLocked')) {
			PM.visiblePanel.find('.content div.text.abbr').not('.hidden').css('overflow', '').css('height', '');
			PM.visiblePanel.find('.content div.text.abbr').removeClass('hidden').removeClass('abbr');
			PM.visiblePanel.find('.content div.ellipsis').remove();
			$('#Scroller').show();
			var scrollheight = PM.visiblePanel.find('.content').attr('_scrollheight');
			PM.visiblePanel.find('.content').removeAttr('_scrollheight');
			if (scrollheight) {
				PM.visiblePanel.setScrollHeight(scrollheight);
			}
			PM.visiblePanel.setScroller();
		}
		if (PM.visiblePanel.is('.scrollingLocked, .contentLocked, .textLocked, .toolbarLocked')) {
			if (PM.visiblePanel.find('li.scrollUp').length) {
				if (PM.visiblePanel.outerHeight() > PM.visiblePanel.getViewportHeight()) {
					PM.visiblePanel.find('.scrollUp, .scrollDown').removeClass('inactive');
				}
				PM.visiblePanel.find('.scrollUp, .scrollDown').attr('title', null);
			}
			PM.visiblePanel.setScroller();
		}
		if (PM.visiblePanel.is('.toolbarLocked')) {
			PM.visiblePanel.find('.toolbar li').not(
					'.textToSpeech, .selectPlace, .scrollUp, .scrollDown, .cdp_inactive').removeClass('inactive');
		}
		PM.visiblePanel.removeClass('speedlocked');
	},
	checkMoving : function() {
		var releasing = false;
		// 1. check hand brake
		if (Config.speedlockTriggerSettings.handbrake.indexOf(Config.homemarket) > -1) {
			LOG.info('hand brake settings found for the market.');
			try {
				var currentHandbrake = EFIHelper.getHandBrakeLightStatus();
				if (!currentHandbrake) { // hand brake not set
					LOG.info('Handbrake: activating speedlock...');
					PM.activateSpeedlock();
					PM.lastMovingStatus(true);
					return;
				} else {
					releasing = true;
				}
			} catch (e) {
				LOG.error('failed to check hand brake.');
			}
		}
		// 2. check gear & clutch
		if (Config.speedlockTriggerSettings.gear.indexOf(Config.homemarket) > -1) {
			LOG.info('gear settings found for the market.');
			var currentGear = BEVHelper.getGear();
			if (currentGear > -1) {
				if (currentGear != 3 && currentGear != 1) { // gear "P" & gear "N"
					LOG.info('Gear: activating speedlock...');
					PM.activateSpeedlock();
					PM.lastMovingStatus(true);
					return;
				} else {
					releasing = true;
				}
			} else {
				LOG.error('failed to check gear.');
				var currentClutch = BEVHelper.getClutch();
				if (currentClutch > -1) {
					if (currentClutch == 1) {
						LOG.info('Clutch: activating speedlock...');
						PM.activateSpeedlock();
						PM.lastMovingStatus(true);
						return;
					} else {
						releasing = true;
					}
				} else {
					LOG.error('failed to check clutch.');
				}
			}
		}
		// 3. check speed
		var spd = Object.keys(Config.speedlockTriggerSettings.speed);
		for (s in spd) {
			if (Config.speedlockTriggerSettings.speed[spd[s]].indexOf(Config.homemarket) > -1) {
				LOG.info('speed settings found for the market.');
				var currentSpeed = BEVHelper.getSpeed();
				if (currentSpeed > -1) {
					if (currentSpeed > spd[s]) {
						LOG.info('Speed: activating speedlock...');
						PM.activateSpeedlock();
						PM.lastMovingStatus(true);
						return;
					} else {
						releasing = true;
						break;
					}
				} else {
					LOG.error('failed to check speed, trying to check car status as fallback...');
					// 4. fallback: check car status
					EFIHelper.getCarStatus(function(efiData) {
						if (efiData.data.status) {
							LOG.info('car is now moving');
							PM.activateSpeedlock();
						} else if (efiData.data.status != PM.lastMovingStatus()) {
							LOG.info('car is now staying and last status was moving.');
							PM.releaseSpeedlock();
						}
						// store current status
						PM.lastMovingStatus(efiData.data.status);
					});
					return;
				}
			}
		}
		if (PM.lastMovingStatus() && releasing) {
			LOG.info('releasing speedlock...');
			PM.releaseSpeedlock();
			PM.lastMovingStatus(false);
			return;
		}
	},
	/**
	 * Set speedlock class to the detailPanel
	 * 
	 * @param [panel :
	 *            object] [homemarket : String] current home market according to this the css class will be added to the
	 *            panel
	 */
	setSpeedlockClass : function(panel, homemarket) {
		// for RSE no speedlock classes should be set
		var ua = PM.getUserAgent();
		if (ua && ua.indexOf('NBT_RSE') > -1) {
			return;
		}

		if (typeof Config.appSpeedlockPanelSettings !== 'undefined') {// merge speed lock with application specific
			// locks
			var lockSettings = Object.keys(Config.appSpeedlockPanelSettings);
			for ( var i = 0; i < lockSettings.length; i++) {
				$.merge(Config.speedlockPanelSettings[lockSettings[i]],
						Config.appSpeedlockPanelSettings[lockSettings[i]]);
				$.unique(Config.speedlockPanelSettings[lockSettings[i]]);
			}
			;
		}
		if (!PM.isStartPage(panel)) {// do not apply any speed lock to start page
			if (Config.speedlockPanelSettings.lockedApplication.indexOf(homemarket) != -1) {
				panel.addClass('drivingLocked');
				return;
			}
			if (panel.is('#GeocoderOverview')) {
				if (Config.speedlockPanelSettings.lockedGeocoder.indexOf(homemarket) != -1) {
					panel.addClass('geocoderLocked');
				}
			} else {
				if (Config.speedlockPanelSettings.lockedToolbar.indexOf(homemarket) != -1) {
					panel.addClass('toolbarLocked');
				}
				if (panel.is('.panel')) {
					if (Config.speedlockPanelSettings.lockedClickable.indexOf(homemarket) != -1) {
						panel.addClass('clickableLocked');
					}
					if (Config.speedlockPanelSettings.lockedInput.indexOf(homemarket) != -1) {
						panel.addClass('inputLocked');
					}
				} else { // .detailPanel
					if (Config.speedlockPanelSettings.lockedContent.indexOf(homemarket) != -1) {
						panel.addClass('contentLocked');
					} else if (Config.speedlockPanelSettings.lockedText.indexOf(homemarket) != -1) {
						panel.addClass('textLocked');
					} else {// basic lock for all markets
						panel.addClass('scrollingLocked');
					}
				}
			}
		}
	},

	/**
	 * Get current locale from user-agent
	 */
	getCurrentLocale : function() {
		try {
			if (PM.getUserAgent().split(';')[6] !== undefined) {
				return PM.getUserAgent().split(';')[6];
			} else {
				return PM.locale;
			}
		} catch (e) {
			return PM.locale;
		}
	},
	/**
	 * Get current language from user-agent
	 */
	getCurrentLanguage : function() {
		try {
			return PM.getCurrentLocale().split('_')[0];
		} catch (e) {
			return 'en';
		}
	},
	/**
	 * Get content language from PM.locale; if PM.locale is not set 'en' will be returned.
	 */
	getContentLanguage : function() {
		try {
			return PM.locale.split('_')[0];
		} catch (e) {
			return 'en';
		}
	},

	/**
	 * stores the market in Config.homemarket and in the localStorage
	 */
	setHomemarket : function(homemarket) {
		if (Config.homemarket) {
			$('body').removeClass(Config.homemarket);
		}
		if (homemarket) {
			Config.homemarket = homemarket;
			SM.setGlobal('cdpHomemarket', Config.homemarket);
		} else if (!Config.homemarket) {
			Config.homemarket = SM.getGlobal('cdpHomemarket');
		}
		$('body').addClass(Config.homemarket);

		$('#testMarket').html(Config.homemarket); // for test console
	},

	/**
	 * If the parameter widthInPixel is set to 544, the class screen544 will be added to the html body element,
	 * otherwise screen1024.
	 * 
	 * @param widthInPixel
	 */
	changeStyle : function(resultObj) {
		PM.lastHMIPluginScreenSize = resultObj;
		try {
			LOG.info('Result xSize: ' + resultObj.xSize);
			PM.releaseSpeedlock();

			if (resultObj.xSize == '544') {
				$('body').addClass('screen544').removeClass('screen1024');
			} else {
				$('body').addClass('screen1024').removeClass('screen544');
			}

			SM.setSessionGlobal('xSize', resultObj.xSize);
			var timer = -1;
			timer = window.setInterval(function() {
				var panel = PM.visiblePanel;
				if ($('#Main').width() == resultObj.xSize && panel) {
					window.clearInterval(timer);

					$('[isCutted]').removeAttr('isCutted');
					PM.cutTitleText();
					PM.cutPoiListText();
					panel.attr('isCutted', true);

					if (panel.is('.detailPanel') && $('#Scroller').is(':visible')) {
						PM.scrollUpPage();
						panel.find('li.scrollUp, li.scrollDown').addClass('inactive');
					}
					if (panel.is('.detailPanel, .panel.scrollTop')) {
						PM.scrollTop();
					} else {
						panel.setScroller();
					}

					var element = panel.find('li.selected');
					if (element.length && !(element.isTopVisible() || element.isBottomVisible())) {
						panel.setScrollHeight(panel.getScrollHeight() + element.offset().top - panel.getViewportTop());
					}

					var initMap = $('.visible .webmap').parents('.panel').attr('action');
					if (initMap) {// reset map
						PM.scrollTop();
						$('.visible .webmap').remove();
						new Function(initMap)();
					}

					if (Config.switchScreenCallback) {
						if (resultObj.xSize == '544') {
							Config.switchScreenCallback(true);// true for switching to split screen.

						} else {
							Config.switchScreenCallback(false);// false for switching to full screen
						}
					}

					if (resultObj.xSize == '544') {
						PM.updatePoiImagePosition(true);// true for switching to split screen.
					} else {
						PM.updatePoiImagePosition(false);// false for switching to full screen
					}
				}
			}, 30);
		} catch (e) {
			LOG.error("PM.changeStyle :" + e.message);
		}
	},
	/**
	 * Function used to check if current panel is the BON start page.
	 * 
	 * @param panel
	 *            the panel to be checked, if undefined, PM.visiblePanel will be check.
	 * @returns {Boolean}
	 */
	isStartPage : function(panel) {
		if (!panel) {
			panel = PM.visiblePanel;
		}
		if (panel) {
			return Config.appIdentifier == 'Main' && panel.attr('cdpurl') == 'main';
		}
		return false;
	},
	/**
	 * this function is used to initialize a panel with a contact book selection link
	 * 
	 * @param selectLink:
	 *            id of link to load select contact panel
	 * @param inputId:
	 *            id of element, its value should be set with selected contact
	 */
	initSelectContactBookPanel : function(selectLink, inputId) {
		if (Config.contactbookSupportedCountries.indexOf(Config.homemarket) > -1) {
			PM.showContactBook = function() {
				SM.setSession("origPanel", PM.visiblePanel.attr('id'));
				PM.show('contactBook', 'selectContactBook');
			};
			PM.visiblePanel.find('#' + selectLink).attr("action", "PM.showContactBook()");
		} else {
			PM.visiblePanel.find('#' + selectLink).hide();
			return;
		}
		var selectedContact = SM.getSession('selectedContact');
		if (selectedContact) {
			PM.visiblePanel.find('#' + inputId).attr('value', selectedContact);
			SM.clearSession('selectedContact');
		}
	},
	/**
	 * this function saves the selected contact into session storage and goes back to the panel where the
	 * PM.showContactBook() was called
	 * 
	 * @param contact
	 *            contact selected by the user
	 */
	selectContact : function(contact) {
		SM.setSession('selectedContact', contact);
		var origPanel = SM.getSession('origPanel');
		if (origPanel) {
			PM.stack.pop();
			SM.clearSession('origPanel');
			PM.show(origPanel);
		}
	},

	setPagingPosition : function(currentPage, maxPage) {
		if (!$.isNumeric(currentPage)) {
			currentPage = 0;
		}
		if (!$.isNumeric(maxPage)) {
			maxPage = 0;
		}

		try {
			idrivePlugin.setPagingPosition(currentPage, maxPage);
		} catch (e) {
		}
	},

	updatePoiImagePosition : function(modus) {
		var photo = PM.visiblePanel.find('.poi_photo');
		if (!photo.length) {
			return;
		}
		if (modus) {
			photo.insertBefore(photo.siblings().last()).removeClass('right');
		} else {
			photo.insertBefore(photo.siblings().first()).removeClass('left').addClass('right');
		}
		if (PM.visiblePanel.outerHeight() <= PM.visiblePanel.getViewportHeight()) {
			PM.visiblePanel.find('li.scrollUp,li.scrollDown').addClass('inactive');
		}
		PM.visiblePanel.setScroller();
	},

	placePoiPhoto : function() {
		var photo = PM.visiblePanel.find('.poi_photo');
		if (!PM.lastHMIPluginScreenSize || PM.lastHMIPluginScreenSize.xSize != '544') {
			photo.insertBefore(photo.siblings().first()).removeClass('left').addClass('right');
		} else {
			photo.insertBefore(photo.siblings().last()).removeClass('right');
		}
	},

	isEntryMM : function() {
		return PM.getUserAgent().indexOf('EntryMM;') > -1;
	}

};

$.extend($.expr[':'], {
	actionElement : function(element) {
		element = $(element);
		if (!element.is(':visible')) {
			return false;
		}
		if (!element.is('[onclick], .input, .thumbnail')) {
			return false;
		}
		return true;
	},
	noActionElement : function(element) {
		element = $(element);
		if (!element.is(':visible')) {
			return false;
		}
		if (element.is(':not([onclick], .input, .thumbnail)')) {
			return true;
		}
		return false;
	},
	topVisible : function(element) {
		element = $(element);
		return element.isTopVisible();
	},
	bottomVisible : function(element) {
		element = $(element);
		return element.isBottomVisible();
	}
});

(function($) {
	/**
	 * Scroll up a list panel or detailPanel. detailPanel
	 */
	$.fn.scrollUp = function() {
		if (this.is('.detailPanel')) {
			var button = this.find('li.selected');
			if (button.length) {
				if (button.is('.scrollUp')) {
					if (this.is('.scrollingLocked, .toolbarLocked') && PM.lastMovingStatus()) {
						// exit, if car is moving
						return this;
					}
					this.removeScrollHeight();
				} else {
					var prev = button.prevAll("li").first();
					button.switchSelected(prev);
				}
			}
		}

		if (this.is('.panel')) {
			var selected = this.find('li.selected');

			if (!selected.length) {
				var toolbar = this.find('.toolbar');
				if (toolbar) {
					selected.switchSelected(toolbar.find('li').last());
				}
				// no element, but scroll nevertheless
				this.removeScrollHeight();
			} else {
				// first visible action element
				var prev = selected.prevVisibleActionElement();
				if (prev.length) {
					selected.switchSelected(prev);
					// scrolling if bottom of view is reached´, plus offset
					if (!prev.isTopVisible(-Config.scrollHeight)) {
						this.removeScrollHeight();
					}
				} else {
					if (this.getScrollHeight() === 0 && !selected.parents('.toolbar').length) {
						var toolbar = selected.parents('.visible').find('.toolbar');
						if (toolbar.length) {
							selected.switchSelected(toolbar.find('li:visible:last'));
						}
					}

					this.removeScrollHeight();
					if (!(selected.is(':actionElement') && selected.isBottomVisible(-Config.scrollHeight * 2))) {
						var prevActionElement = selected.prevAll('li:actionElement:first');
						if (prevActionElement.length && prevActionElement.isTopVisible(Config.scrollHeight)) {
							prev = prevActionElement;
						} else {
							// last visible no action Element if scrolling is possible
							if (PM.visiblePanel.getScrollHeight() > 0) {
								prev = selected.prevAll('li:noActionElement:bottomVisible:last');
							}
						}

						if (prev.length) {
							selected.switchSelected(prev);
						}
					}
				}
			}
		}
		return this;
	};
	/**
	 * scroll down a panel or detailPanel
	 */
	$.fn.scrollDown = function() {
		if (this.is('.detailPanel')) {
			var button = this.find('li.selected');
			if (button.length && button.is('.scrollDown')) {
				if (this.is('.scrollingLocked, .toolbarLocked') && PM.lastMovingStatus()) {
					// exit, if car is moving
					return this;
				}
				this.addScrollHeight();
			}
			var next = button.nextAll("li").first();
			button.switchSelected(next);
		}

		if (this.is('.panel')) {
			var selected = this.find('li.selected');
			if (!selected.length) {
				// no element, but scroll nevertheless
				this.addScrollHeight();
			} else {
				// if the selected element is the last element in the toolbar, so select the first element in the
				// content block
				if (selected.parent().is('.toolbar')) {
					if (selected.next().length) {
						selected.switchSelected(selected.next());
					} else {
						var contentBlock = selected.parents('.panel').find('ul.content');

						if (contentBlock.find('li').is('[onclick]')
								|| contentBlock.outerHeight() > this.getViewportHeight()) {
							var newItem = contentBlock.find('li:first');
							selected.switchSelected(newItem);

							// call method again, if the element has no click action and there is a further element
							if (!newItem.is('[onclick]') && newItem.next().length) {
								this.scrollDown();
							}
						}
					}
					return this;
				}

				// first visible action element
				var next = selected.nextVisibleActionElement();

				if (next.length) {
					selected.switchSelected(next);
					// scrolling if bottom of view is reached´, plus offset
					if (!next.isBottomVisible(-Config.scrollHeight)) {
						this.addScrollHeight();
					}
				} else {
					this.addScrollHeight();
					if (!(selected.is(':actionElement') && selected.isTopVisible(-Config.scrollHeight))) {
						var nextActionElement = selected.nextAll('li:actionElement:first');

						if (nextActionElement.length && nextActionElement.isBottomVisible(Config.scrollHeight)) {
							next = nextActionElement;
						} else {
							// last visible no action Element
							next = selected.nextAll('li:noActionElement:topVisible:last');
						}

						if (next.length && selected.nextAll('li:actionElement').length) {
							selected.switchSelected(next);
						}
					}
				}
			}
		}
		return this;
	};
	$.fn.nextVisibleActionElement = function() {
		var next = this.next();

		if (next.is(':not(:visible)')) {
			return next.nextVisibleActionElement();
		}

		if (next.is(':topVisible') && next.is(':bottomVisible')) {
			if (next.is(':actionElement')) {
				return next;
			} else {
				return next.nextVisibleActionElement();
			}
		}

		return [];
	};
	$.fn.prevVisibleActionElement = function() {
		var prev = this.prev();

		if (prev.is(':not(:visible)')) {
			return prev.prevVisibleActionElement();
		}

		if (prev.is(':topVisible') && prev.is(':bottomVisible')) {
			if (prev.is(':actionElement')) {
				return prev;
			} else {
				return prev.prevVisibleActionElement();
			}
		}

		return [];
	};
	/**
	 * @return the value of the attribute scrollHeight of the current element. if not found or not parseable zero will
	 *         be returned.
	 */
	$.fn.getScrollHeight = function() {
		var content = this.find('.content');
		var scrollHeight = content.attr('scrollHeight');
		return scrollHeight ? parseInt(scrollHeight, 10) : 0;
	};
	$.fn.addScrollHeight = function() {
		this.setScrollHeight(this.getScrollHeight() + Config.scrollHeight);
		return this;
	};
	$.fn.removeScrollHeight = function() {
		this.setScrollHeight(this.getScrollHeight() - Config.scrollHeight);
		return this;
	};
	/**
	 * @param scrollHeight:int
	 *            positive int value of new absolute scrollHeight
	 */
	$.fn.setScrollHeight = function(scrollHeight) {
		if (scrollHeight != this.getScrollHeight()) {
			var content = this.find('.content');
			if (scrollHeight <= 0) {
				// if it was scrolled up to much, then limit the top margin
				scrollHeight = 0;
			} else {
				// if it was scrolled down to much, then limit the scrollHeight
				var outerHeight = content.outerHeight();
				if (outerHeight - scrollHeight < PM.visiblePanel.getViewportHeight()) {
					scrollHeight = outerHeight - PM.visiblePanel.getViewportHeight();
				}
			}

			// store the new scrollHeight and scroll
			content.attr('scrollHeight', scrollHeight);

			if (Config.firefoxMode) {
				content.css('-moz-transform', 'translate(0, -' + scrollHeight + 'px)');
			} else {
				content.css('-webkit-transform', 'translate(0, -' + scrollHeight + 'px)');
			}
		}
		this.setScroller();
		return this;
	};

	/**
	 * Sets the right scroller to the correct position. height of scroll graphic: 416px. top-offset for graphic: 0px.
	 * height of screen: 420px; when the page is 4 times the screen height, scroller should have 100px => divide by
	 * 16800.
	 */
	$.fn.setScroller = function() {
		// show page position in the browser
		try {
			idrivePlugin.setPagingPosition(0, 0);
		} catch (e) {
		}

		if (PM.showScroller) {
			var percentage = 0; // percentage value of the scroller position
			var panel = PM.visiblePanel;
			var contentheight = panel.outerHeight();
			var viewportHeight = panel.getViewportHeight();

			var topUnvisible = panel.getScrollHeight();
			var bottomUnvisible = contentheight - (viewportHeight + topUnvisible);

			if (panel.is('.detailPanel')) {
				bottomUnvisible += Config.viewportTop;
			}

			if (topUnvisible === 0) {
				precentage = 0;
			} else if ((bottomUnvisible - Config.viewportTop) === 0) {
				percentage = 100;
			} else {
				percentage = Math.round(topUnvisible / (topUnvisible + bottomUnvisible) * 100);
			}

			if (contentheight <= 420) {
				$('#ScrollerNotVisible').show();
				$('#ScrollerVisible').hide();
				$('#Scroller').hide();
			} else {
				$('#ScrollerNotVisible').hide();
				$('#ScrollerVisible').show();
				$('#Scroller').show();
			}

			// show no scrollBar for detailPanels
			if (panel.is('.detailPanel')) {
				$('#ScrollerNotVisible').hide();
				$('#ScrollerVisible').hide();
				$('#Scroller').hide();
			}

			if (percentage < 0) {
				percentage = 0;
			}
			if (percentage > 100) {
				percentage = 100;
			}

			if (panel.is('.detailPanel') && contentheight > viewportHeight) {
				if (percentage === 0) {
					panel.find('li.scrollUp').addClass('inactive');
					panel.find('li.scrollDown').removeClass('inactive');
				} else if (percentage < 100) {
					panel.find('li.scrollUp').removeClass('inactive');
					panel.find('li.scrollDown').removeClass('inactive');
				} else if (percentage == 100) {
					panel.find('li.scrollUp').removeClass('inactive');
					panel.find('li.scrollDown').addClass('inactive');
				}
			}

			scrollerheight = Math.round(168000 / contentheight);

			if (percentage < 100) {
				percentage = Math.round(percentage * (416 - scrollerheight) / 100.0) + 7 /* offset */;
			} else {
				percentage = Math.round(percentage * (416 - scrollerheight) / 100.0);
			}

			if (scrollerheight + percentage > 416) { /* height+offset */
				scrollerheight = 416 - percentage;
			}

			$("#Scroller").css('top', percentage + 'px');
			$("#Scroller").css('background-position', '0px -' + percentage + 'px');
			$("#Scroller").css('height', scrollerheight);
		}
		return this;
	};

	/**
	 * get the viewport height of a panel. if header is set, so reduce the viewport height
	 */
	$.fn.getViewportHeight = function() {
		if (this.is('.panel') && this.children('div.header').length) {
			return Config.viewportHeight - Config.viewportTop;
		}
		return Config.viewportHeight;
	};
	/**
	 * get the viewport top of a panel.
	 * 
	 * @returns 0, if no header is set, else the configured viewportTop
	 */
	$.fn.getViewportTop = function() {
		if (this.is('.panel') && this.children('div.header').length) {
			return Config.viewportTop;
		}
		return 0;
	};
	$.fn.topPosition = function() {
		var offset = 0;
		if (Config.firefoxMode && navigator.userAgent.indexOf('Firefox/8') > -1) {
			offset -= PM.visiblePanel.getScrollHeight();
		}
		var top = this.offset().top + offset;
		return top;
	};

	/**
	 * This method is only for UI list elements of a panel. Retunrs true, if the top of the element can be seen.
	 * 
	 * @param offset:int
	 *            this is optional, use this, if you want to know the position moving the element up for the amount of
	 *            given offset pixels.
	 */
	$.fn.isTopVisible = function(offset) {
		var isVisible = false;
		if (this.is('li')) {
			if (this.parents('.toolbar').length) {
				return true;
			} else {
				if (offset === undefined) {
					offset = 0;
				}
				if (Config.firefoxMode && navigator.userAgent.indexOf('Firefox/8') > -1) {
					offset -= PM.visiblePanel.getScrollHeight();
				}

				var item = this;
				var top = item.offset().top + offset;

				var panel = PM.visiblePanel;
				var viewportTop = panel.getViewportTop();
				var viewportHeight = panel.getViewportHeight() + viewportTop;

				isVisible = top >= viewportTop && top <= viewportHeight;
			}
		}
		return isVisible;
	};
	/**
	 * This method is only for UI list elements of a panel. Retunrs true, if the bottom of the element can be seen.
	 * 
	 * @param offset:int
	 *            this is optional, use this, if you want to know the position moving the element down for the amount of
	 *            given offset pixels.
	 */
	$.fn.isBottomVisible = function(offset) {
		var isVisible = false;
		if (this.is('li')) {
			if (this.parents('.toolbar').length) {
				return true;
			} else {
				if (offset === undefined) {
					offset = 0;
				}
				if (Config.firefoxMode && navigator.userAgent.indexOf('Firefox/8') > -1) {
					offset += PM.visiblePanel.getScrollHeight();
				}

				var item = this;
				var bottom = item.offset().top + item.outerHeight() - offset;

				var panel = PM.visiblePanel;
				var viewportTop = panel.getViewportTop();
				var viewportHeight = panel.getViewportHeight() + viewportTop;

				isVisible = bottom >= viewportTop && bottom <= viewportHeight;
			}
		}
		return isVisible;
	};
	/**
	 * removes the class selected of the current element and calls the blur-event, if an element is given. To the given
	 * element the class selected will be added and the focus-event will be called.
	 * 
	 * @param element:JQUERY
	 *            the new selected element
	 */
	$.fn.switchSelected = function(element) {
		if (element.length) {
			// blur all visible input/textarea fields
			PM.visiblePanel.find('input, textarea').blur();

			var current = this;
			current.removeClass('selected');
			element.addClass('selected');

			current.blur();
			element.focus();

			// move cursor to the beginning of a line
			if (element.is('.input') && !element.find('input:hidden').length) {
				element.find('input, textarea')[0].setSelectionRange(0, 0);
			}
			// remove tooltips and timer function
			if (element.parent().is('.toolbar')) {
				$('[id^="Tooltip_"]').remove();

				if (Timers['TooltipOn']) {
					window.clearTimeout(Timers['TooltipOn']);
					Timers['Tooltip'] = undefined;
				}
				if (Timers['TooltipOff']) {
					window.clearTimeout(Timers['TooltipOff']);
					Timers['TooltipOff'] = undefined;
				}
			}

			// show tooltips
			if ((element.is('.scrollUp, .scrollDown') || element.parent().is('.toolbar'))
					&& element.attr('title') !== undefined) {
				var toolbar = element.parent('.toolbar');
				var pos = element.position();
				var id = 'Tooltip_' + PM.visiblePanel.attr('id') + parseInt(pos.top, 10) + 'x' + parseInt(pos.left, 10);
				var maxWidth = PM.visiblePanel.width() - 100;
				var tooltip = '<div id="' + id + '" class="tooltip" style="position: absolute; top: ' + pos.top
						+ 'px; left: ' + (pos.left) + 'px; max-height: 220px; max-width: ' + maxWidth + 'px;">'
						+ element.attr('title') + '</div>';
				$('#Main').append(tooltip);

				tooltip = $('#Main').find('#' + id);
				if ((pos.top + tooltip.height()) > toolbar.height()) {
					tooltip.css('top', toolbar.height() - tooltip.height());
				}

				Timers['TooltipOn'] = window.setTimeout("$('#" + id + "').toggle(0);", 500);
				Timers['TooltipOff'] = window.setTimeout("$('#" + id + "').toggle(0);", 3000);
			}
		}

		return this;
	};
})(jQuery);

/**
 * For the current visible panel all element with class <code>speech</code> will be used to initialize the
 * speechcontrol plugin.
 */
var SpeechControl = {
	actions : [],
	init : function() {
		LOG.info("SpeechControl.init()");

		if (PM.visiblePanel !== null) {
			SpeechControl.actions = [];
			var actionLinks = PM.visiblePanel.find('.speech');
			var text = "";
			var locales = "";
			var phonemTypes = "";
			var functions = "";

			if (actionLinks.length) {
				try {
					$.each(actionLinks, function(index, element) {
						element = $(element);
						SpeechControl.actions[index] = element.attr('onclick');
						text += element.text() + ';';
						functions += 'speechAction_' + index + ';';
						locales += PM.locale + ";";
						phonemTypes += "NONE;";
					});
					text = text.slice(0, text.length - 1);
					functions = functions.slice(0, functions.length - 1);
					locales = locales.slice(0, locales.length - 1);
					phonemTypes = phonemTypes.slice(0, phonemTypes.length - 1);

					var object = '<object style="height: 0px; position: absolute; top: 0px;" id="pl_speechcontrol" name="speechcontrol" type="application/x-bmw-speechcontrol">';
					object += '<param name="phonemTypes" value="' + phonemTypes + '">';
					object += '<param name="text" value="' + text + '">';
					object += '<param name="phoneticText" value="' + text + '">';
					object += '<param name="language" value="' + locales + '">';
					object += '<param name="callbackFcts" value="' + functions + '">';
					object += '</object>';

					var parent = $('body');
					var plugin = document.getElementById("pl_speechcontrol");
					if (plugin !== null) {
						parent.get(0).removeChild(plugin);
					}
					parent.append(object); // add plugin
					LOG.info('speechcontrol-plugin added');
				} catch (error) {
					LOG.error('speechcontrol-plugin could not be initialized.');
				}
			}
		}
	}
};

var TTS = {
	read : function(language, headline, textToSpeechText) {
		LOG.info("TTS.read(): headline=" + headline + ", language=" + language);

		if (!language) {
			language = '';
		} else if (language == 'en_UK') {
			language = 'en_GB';
		}

		var plugin = document.getElementById("pl_tts");
		var parent = $('body');
		if (plugin !== null) {
			parent.get(0).removeChild(plugin);
		}

		try {
			textToSpeechText = textToSpeechText.replace(/"/g, '');
			textToSpeechText = textToSpeechText.replace(/\r\n\r\n/g, '&lt;break time=&quot;' + Config.ttsPause
					+ '&quot;/&gt;' + ' .\r\n\r\n');
			textToSpeechText = '&lt;Voc lang=&quot;' + language + '&quot;&gt;' + textToSpeechText;

			var object = '<object width="0" height="0" id="pl_tts" name="ttsplugin" type="application/x-bmw-ttsplugin">';
			object += '<param name="textdata" value="' + textToSpeechText + '"/>';
			object += '<param name="language" value="' + language + '"/>';
			object += '<param name="headline" value="' + headline.replace(/"/g, '') + '"/>';
			object += '<param name="application" value="Browser"/>';
			object += '</object>';

			parent.append(object); // add plugin
			plugin = document.getElementById("pl_tts");
			plugin.readout();
		} catch (error) {
			LOG.error('TTS-Plugin does not worked.');
			if (TTSSimulator) {
				TTSSimulator.showText(headline, textToSpeechText);
			}
		}
	}
};

/**
 * Default GeoData Object
 */
var GeoData = function() {
	this.lat = 0;
	this.lon = 0;
	this.city = '';
	this.country = '';
	this.locationType = 'cur';
	this.isEmpty = function() {
		return this.lat === 0 && this.lon === 0 && this.city === '' && this.country === '';
	};
};

var GeocoderLastUsedPlaces = {
	add : function(location) {
		var data = GeocoderLastUsedPlaces.load();

		$.each(data, function(index) {
			if (this.city == location.city && this.country == location.country) {
				data.splice(index, 1);
				return false;
			}
		});

		data.unshift(location);

		if (data.length > 10) {
			data.pop();
		}

		GeocoderLastUsedPlaces.store(data);
	},
	load : function() {
		var data = null;
		try {
			data = SM.getGlobal('GeocoderLastuSedPlaces');
			data = JSON.parse(data);
		} catch (e) {
		}
		if (data === null) {
			data = [];
		}
		return data;
	},
	store : function(arrayList) {
		SM.setGlobal('GeocoderLastuSedPlaces', JSON.stringify(arrayList));
	}
};

/**
 * TODO comment Use Geocoder.loadPanel(panelId, url), if you want to load a panel with current and destination
 * coordinates. The geocoder servlet will be called and the response has a redirect with the correct coordinates or a
 * panel with the found results.
 */
var Geocoder = {
	currentPanelId : undefined,// PanelId, which has open the selectPlace dialog
	targetAfterUpdate : undefined, // json for storing the target panel. will be used if the position of the mode is
	// not stored and must be retrieved before loading the panel.
	updateTimer : undefined,
	updateCallbacks : [],// callback functions called after position updated (called by related apps e.g. widget).
	init : function() {
		// first time refresh.
		if (Config.geocoderEnabled) {
			return Geocoder.refreshCurrentOrDestination();
		}
	},
	startUpdateTimer : function() {
		if (Config.geocoderEnabled && Geocoder.updateTimer === undefined) {
			LOG.info('start geocoder update timer');
			Geocoder.updateTimer = window.setInterval(function() {
				Geocoder.refreshCurrentOrDestination();
			}, Config.geocoderUpdateInterval);
		}
	},
	stopUpdateTimer : function() {
		if (Geocoder.updateTimer) {
			LOG.info('stop geocoder update timer');
			window.clearInterval(Geocoder.updateTimer);
			Geocoder.updateTimer = undefined;
		}
	},
	refreshCurrentOrDestination : function() {
		Geocoder.stopUpdateTimer();

		var type = Geocoder.locationType(), defer = undefined;
		if (type == 'cur') {
			defer = Geocoder.loadPos({
				indicator : false,
				doNotShowNoPositionError : true,
				doNotShowNoLocationError : true,
				errorCallback : $.noop,
				maxResults : 1
			});
		} else if (type == 'dest') {
			defer = Geocoder.loadDest({
				indicator : false,
				doNotShowNoPositionError : true,
				doNotShowNoLocationError : true,
				errorCallback : $.noop,
				maxResults : 1
			});
		}
		return defer;
	},
	/**
	 * The select place overview panel will be shown. All the other panels for other place selection will be generated.
	 * No backend call is necessary. The list for the available countries in the other place panel can be configured
	 * with <code>Config.geocoderSupportedCountries</code>.
	 */
	showGeocoder : function() {
		// stop timer
		Geocoder.stopUpdateTimer();

		if (PM.visiblePanel) {
			Geocoder.currentPanelId = PM.visiblePanel.attr('id');
		}

		// cleanup
		$('#GeocoderOverview').remove();
		$('#GeocoderSelectPlace').remove();

		var ua = PM.getUserAgent();

		var geocoderPanel = '<div class="panel nohistory" id="GeocoderOverview"><div class="header "><div class="icon place"></div><div class="title">'
				+ I18N.get('geocoderSelectPlace')
				+ '</div><div class="clear"/></div><div class="contentContainer"><ul class="content">';

		if (ua.indexOf('gps') > -1 || ua.indexOf('Firefox') > -1 || ua.indexOf('Chrome') > -1) {
			geocoderPanel += '<li class="link" onclick="Geocoder.loadPos(\{maxResults \: 1\})"><div><div class="icon location_current"/><div>'
					+ I18N.get('geocoderAtCurrentLocation') + '</div></div></li>';
		}
		if (ua.indexOf('nav') > -1 || ua.indexOf('Firefox') > -1 || ua.indexOf('Chrome') > -1) {
			geocoderPanel += '<li class="link" onclick="Geocoder.loadDest(\{maxResults \: 1\})"><div><div class="icon location_destination"/><div>'
					+ I18N.get('geocoderAtDestination') + '</div></div></li>';
		}
		geocoderPanel += '<li class="link" onclick="PM.show(\'GeocoderSelectPlace\')"><div><div class="icon location_other"/><div>'
				+ I18N.get('geocoderOtherLocation') + '</div></div></li>';

		if (GeocoderLastUsedPlaces.load().length > 0) {
			geocoderPanel += '<li class="smartcursor top" onclick="PM.toggleSmartcursor(this, \'GeocoderLastUsed\')"><div><div class="smartcursorIcon"/><div>'
					+ I18N.get('geocoderLastUsed') + ' (' + GeocoderLastUsedPlaces.load().length + ')</div></div></li>';

			$.each(GeocoderLastUsedPlaces.load(), function(index) {
				var dataString = JSON.stringify(this).replace(/\'/g, "&apos;").replace(/\"/g, "&quot;");
				LOG.info(dataString);
				geocoderPanel += '<li class="link hidden SC GeocoderLastUsed" onclick=\'Geocoder.update(' + dataString
						+ ')\'><div><div>' + this['recentlyUsedFormattedAddress'] + '</div></div></li>';
			});
		}

		geocoderPanel += '</ul></div></div>';

		// ----- Other Place Input Panel ----
		var lastUsedCountry = Geocoder.position().country ? Geocoder.position().country : Config.homemarket;
		var lastUsedCountryName = lastUsedCountry;
		var otherPlacePanel = '<div class="panel nohistory" id="GeocoderSelectPlace"><div class="header "><div class="icon location_other"/><div class="title">'
				+ I18N.get('geocoderOtherLocation')
				+ '</div><div class="clear"/></div><div class="contentContainer"><form id="FormularGeocoderSelectPlace" onsubmit="return false;" autocomplete="off"><ul class="content"><li class="input"><div><div><input id="GeocoderCity" name="GeocoderCity" placeholder="'
				+ I18N.get('city') + '" type="text" cdpTransportMethod="GET"/></div></div></li>';
		if (Config.geocoderSupportedCountries.length > 1) {
			if (I18N.get('country' + lastUsedCountry)) {
				lastUsedCountryName = I18N.get('country' + lastUsedCountry);
			} else {
				lastUsedCountryName = I18N.get('country');
			}
			otherPlacePanel += '<li class="dropdown" onclick="PM.toggleDropdown(this)"><div><div><div>'
					+ lastUsedCountryName
					+ '</div><input id="GeocoderCountry" name="GeocoderCountry" type="hidden" value="'
					+ lastUsedCountry + '"/></div>' + '<div class="options"><div class="header"><div class="title">'
					+ I18N.get('country')
					+ '</div><div class="clear"/></div><div class="contentContainer"><ul class="content">';
			var listOfCountries = {};
			for ( var i = 0; i < Config.geocoderSupportedCountries.length; i++) {
				var countryKey = I18N.get('country' + Config.geocoderSupportedCountries[i]);
				listOfCountries[countryKey] = '<li sortName="' + Config.geocoderSupportedCountries[i]
						+ '" class="link" cdpvalue="' + Config.geocoderSupportedCountries[i]
						+ '" onclick="PM.changeDropdownValue(this, \'GeocoderCountry\')"><div>'
						+ I18N.get('country' + Config.geocoderSupportedCountries[i]) + '</div></li>';
			}
			var keySet = Object.keys(listOfCountries).sort(function(a, b) {
				return a.localeCompare(b);
			});
			for ( var i = 0; i < keySet.length; i++) {
				otherPlacePanel += listOfCountries[keySet[i]];
			}
			otherPlacePanel += '</ul></div></div></div></li>';
		} else if (Config.geocoderSupportedCountries.length == 1) {
			otherPlacePanel += '<input id="GeocoderCountry" name="GeocoderCountry" type="hidden" value="'
					+ Config.geocoderSupportedCountries[0] + '">';
		} else {
			otherPlacePanel += '<li class="input"><div><input id="GeocoderCountry" name="GeocoderCountry" placeholder="'
					+ I18N.get('country') + '" type="text"></div></li>';
		}
		otherPlacePanel += '<li class="link" onclick="Geocoder.submitOtherPlace()"><div><div>' + I18N.get('submit')
				+ '</div></div></li></ul></form></div></div>';

		PM.holder.append(geocoderPanel);
		PM.holder.append(otherPlacePanel);

		PM.show('GeocoderOverview');
	},

	showConfirmationPanel : function(headerHtml) {
		// stop timer
		Geocoder.stopUpdateTimer();

		if (PM.visiblePanel) {
			Geocoder.currentPanelId = PM.visiblePanel.attr('id');
		}

		// cleanup
		$('#ConfirmationPanel').remove();

		var newDiv = document.createElement('div');
		newDiv.setAttribute("id", "ConfirmationPanel");
		newDiv.setAttribute("class", "panel nohistory");

		if (headerHtml) {
			$(newDiv).append(headerHtml);
		}

		var confirmationPanelContent = '<div class="contentContainer"><ul class="content">';

		confirmationPanelContent += '<li><div>' + I18N.get("navigationStartConfirmation") + '</div></li>';

		confirmationPanelContent += '<li class="link selected" onclick="PM.back();"><div>' + I18N.get("ok")
				+ '</div></li>';

		confirmationPanelContent += '</ul></div></div>';

		$(newDiv).append(confirmationPanelContent);

		PM.holder.append(newDiv);

		PM.show('ConfirmationPanel');
	},

	/**
	 * get(or set) location type from (into) session storage
	 * 
	 * @param [newtype]
	 *            new location type, if null then read it from session storage
	 */
	locationType : function(newType) {
		if (!newType) {
			newType = SM.getSessionGlobal('GeocoderLocationType');
			if (!newType) {
				newType = 'cur';
			}
			return newType;
		} else {
			SM.setSessionGlobal('GeocoderLocationType', newType);
		}
	},
	/**
	 * get(or set) geo data from (into) html5 storage
	 * 
	 * @param [geoData]
	 *            object contains some geo data, if null then read it from session storage
	 */
	position : function(geoData) {
		if (!geoData) {
			// load data with stored locationType
			return Geocoder.positionByLocationType(Geocoder.locationType());
		} else {
			// parse data
			var geoDataString = geoData;
			if (typeof geoData == 'object') {
				geoDataString = JSON.stringify(geoData);
			} else {
				geoData = $.parseJSON(geoDataString);
			}

			// store locationType, if no targetAfterUpdate is defined
			if (!Geocoder.targetAfterUpdate) {
				Geocoder.locationType(geoData.locationType);
			}

			// store data for locationType
			SM.setGlobal('StoredGeoData_' + geoData.locationType, geoDataString);

			// store history entry
			if (geoData.locationType == 'other') {
				GeocoderLastUsedPlaces.add(geoData);
			}
		}
	},
	positionByLocationType : function(locationType) {
		try {
			geoData = JSON.parse(SM.getGlobal('StoredGeoData_' + locationType));
		} catch (e) {
		}
		geoData = $.extend(new GeoData, geoData);
		if (!geoData) {
			return new GeoData();
		}
		return geoData;
	},
	/**
	 * The new location will be stored in the localStorage and the locationType will be set.
	 * 
	 * @param geoData
	 * @returns {Boolean}
	 */
	update : function(geoData) {
		try {
			if (typeof geoData != 'object') {
				geoData = $.parseJSON(geoData);
			}
			// store data
			Geocoder.position(geoData);

			// panel was load with specific mode
			if (Geocoder.targetAfterUpdate) {
				var target = Geocoder.targetAfterUpdate;
				Geocoder.targetAfterUpdate = undefined;
				PM.load(target.id, target.url, target.options);
				return true;
			}

			if (Geocoder.currentPanelId) {
				// show lastPanel
				PM.show(Geocoder.currentPanelId);
				Geocoder.currentPanelId = undefined;

				if (PM.visiblePanel && PM.visiblePanel.is('.updateByGeocoder')) {
					PM.load(PM.visiblePanel.attr('id'), PM.visiblePanel.attr('cdpURL'), {
						geocoder : 'modus'
					});
				}
			} else {
				// resfresh selectPlace Link
				Geocoder.updateSelectPlaceLink();
			}
		} catch (e) {
			LOG.error(e.message);
		}

		if ($('.visible#GeocoderResult').length) {
			PM.back();
		}

		if (Geocoder.updateCallbacks.length) {
			try {
				for (index in Geocoder.updateCallbacks) {
					Geocoder.updateCallbacks[index]();
				}
			} catch (e) {
				LOG.error('Could not call the function Geocoder.updateCallbacks(): ' + e);
			}
		}
		// start timer again
		Geocoder.startUpdateTimer();
		return false;
	},
	/**
	 * this will be called, if the panel will be made visible.
	 * 
	 * @param panel:JQUERY
	 */
	updateSelectPlaceLink : function() {
		var type = Geocoder.locationType();
		var geoData = Geocoder.position();
		var iconClass = 'location_current';
		if (type == 'other') {
			iconClass = 'location_other';
		} else if (type == 'dest') {
			iconClass = 'location_destination';
		}

		var selectPlace = $('.panel').find('.selectPlace');
		if (selectPlace.length) {
			if (!geoData.selectedFormattedAddress) {
				geoData.selectedFormattedAddress = I18N.get('geocoderSelectPlace');
			}

			selectPlace.attr('onclick', 'Geocoder.showGeocoder();');
			selectPlace.attr('onfocus', 'Geocoder.focusSelectPlace(this)');
			selectPlace.attr('onblur', 'Geocoder.blurSelectPlace(this)');
			selectPlace.each(function() {
				var item = $(this);
				if (item.is('.update') || item.text().length == 0) {
					$(this).html(
							'<div><div class="icon ' + iconClass + '"/><div>' + geoData.selectedFormattedAddress
									+ '</div></div>');
				}
			});

			$('.selectPlace.selected').focus();
		}

		var selectPlace = $('.detailPanel').find('.selectPlace');
		if (selectPlace.length) {
			selectPlace.html('<div class="icon ' + iconClass + '"></div>');
			selectPlace.attr('onclick', 'Geocoder.showGeocoder();');
			selectPlace.attr('title', I18N.get('geocoderSelectPlace'));
		}
	},
	focusSelectPlace : function(element) {
		element = $(element).find('div div:not(.icon)');
		var text = $.trim(element.text());
		if (text.slice(text.length - 2) != ' ?') {
			element.text($.trim(text) + ' ?');
		}
	},
	blurSelectPlace : function(element) {
		element = $(element).find('div div:not(.icon)');
		var text = $.trim(element.text());
		if (text.slice(text.length - 2) == ' ?') {
			element.text(text.slice(0, text.length - 2));
		}
	},
	/**
	 * This is the submit function for the search other place formular. The city and country value will be retrieved and
	 * the geocoder servlet will be called.
	 */
	submitOtherPlace : function() {
		var geoData = new GeoData();
		geoData.city = $('#GeocoderCity').val();
		geoData.country = $('#GeocoderCountry').val();
		geoData.locationType = 'other';

		Geocoder.loadPanel('GeocoderResult', Config.geocoderUrl, {}, geoData);
		return false;
	},
	/**
	 * if no geoData is given, the geoData will be loaded from the localStorage depnending on the current location mode.
	 * The URL will be extended with the geoData values.
	 * 
	 * @param panelId
	 * @param url
	 * @param options
	 * @param [geoData]
	 */
	loadPanel : function(panelId, url, options, geoData, loadDefer) {
		options = $.extend({}, options);
		options.originalUrl = url;

		if (!geoData) {
			geoData = Geocoder.position();
		}
		if (url.indexOf('?') > -1) {
			url += '&';
		} else {
			url += '?';
		}
		url += 'lat=' + geoData.lat;
		url += '&lon=' + geoData.lon;
		if (geoData.city) {
			url += '&city=' + encodeURIComponent(geoData.city);
		}
		if (geoData.selectedFormattedAddress) {
			url += '&selectedFormattedAddress=' + encodeURIComponent(geoData.selectedFormattedAddress);
		}
		if (geoData.multipleResultsFormattedAddress) {
			url += '&multipleResultsFormattedAddress=' + encodeURIComponent(geoData.multipleResultsFormattedAddress);
		}
		if (geoData.recentlyUsedFormattedAddress) {
			url += '&recentlyUsedFormattedAddress=' + encodeURIComponent(geoData.recentlyUsedFormattedAddress);
		}
		if (geoData.weatherFormattedAddress) {
			url += '&weatherFormattedAddress=' + encodeURIComponent(geoData.weatherFormattedAddress);
		}
		if (geoData.country) {
			url += '&country=' + encodeURIComponent(geoData.country);
		}
		url += '&locationType=' + encodeURIComponent(geoData.locationType);

		options.geoData = geoData;

		PM.load(panelId, url, options, loadDefer);
	},
	/**
	 * This will be called from the PanelManager to add the correct coordinates to the request URL.
	 * 
	 * @see PM.load()
	 * @param panelId
	 * @param url
	 * @param options
	 */
	loadPanelWithCoordinates : function(panelId, url, options) {
		options = $.extend({}, options);

		// for compatibility: geocoder = true will be changed to 'mode'
		if (options.geocoder == true) {
			options.geocoder = 'modus';
		}

		var geoOpt = options.geocoder;
		options.geocoder = false;
		var geoData = undefined;

		LOG.info('loadPanel with coordinates [' + geoOpt + ']');

		switch (geoOpt) {
		case 'modus':
			geoData = Geocoder.position();
			break;
		case 'navi':
			Geocoder.loadPosAndDest(panelId, url, options);
			return;
		default:
			// pos, dest or other
			Geocoder.locationType(geoOpt);
			geoData = Geocoder.positionByLocationType(geoOpt);
		}

		if (geoData.isEmpty() || options.useNewestCoordinate) {
			geoOpt = Geocoder.locationType();
			if (geoData.isEmpty()) {
				if (options.useNewestCoordinate) {
					geoOpt = 'dest';
				}
			}

			var tempOptions = {};
			if (options.doNotShowNoPositionError) {
				tempOptions = $.extend(tempOptions, {
					doNotShowNoPositionError : true,
					doNotShowNoLocationError : true
				});
			} else {
				tempOptions = $.extend(tempOptions, {
					doNotShowNoPositionError : false,
					doNotShowNoLocationError : options.doNotShowNoLocationError
				});
			}

			var targetOptions = options;
			targetOptions.geocoder = geoOpt;
			targetOptions.useNewestCoordinate = false;

			Geocoder.targetAfterUpdate = {
				id : panelId,
				url : url,
				options : targetOptions
			};
			switch (geoOpt) {
			case 'cur':
				Geocoder.loadPos(tempOptions);
				break;
			case 'dest':
				Geocoder.loadDest(tempOptions);
				break;
			case 'other':
				Geocoder.showGeocoder();
				PM.show('GeocoderSelectPlace');
				break;
			}
			return;
		}
		Geocoder.loadPanel(panelId, url, options, geoData);
	},
	/**
	 * Call EFI and load the current position. The backend geocoder will be called to get the city and country value.
	 */
	loadPos : function(options) {
		Geocoder.stopUpdateTimer();
		options = $.extend({}, options);
		var loadDefer = $.Deferred();
		EFIHelper
				.getPosWGS84(function(efiData) {
					if (Geocoder.responseHasCoordinates(efiData)) {
						var geoData = new GeoData();
						geoData.locationType = 'cur';
						geoData.lat = Geocoder.convertWGS84ToDegree(efiData.data.lat);
						geoData.lon = Geocoder.convertWGS84ToDegree(efiData.data.lon);

						if (Geocoder.getDistance(Geocoder.positionByLocationType('cur'), geoData) > Config.geocoderUpdateDistance) {
							var url = Config.geocoderUrl + '?';
							if (options.maxResults) {
								url += 'maxResults=' + options.maxResults;
							}
							if (typeof options.doNotShowNoLocationError !== 'undefined') {
								url += '&showPanel=' + !options.doNotShowNoLocationError;
							} else {
								url += '&showPanel=false';
							}
							Geocoder.loadPanel('GeocoderResult', url, options, geoData, loadDefer);
						} else {
							Geocoder.update(Geocoder.positionByLocationType('cur'));
							loadDefer.resolve();
						}
					} else {
						if (!options.doNotShowNoPositionError) {
							PM.showError(CDPError.NoPosition);
						}
						loadDefer.resolve();
					}
				});
		return loadDefer;
	},
	/**
	 * Call EFI and load the current destination. The backend geocoder will be called to get the city and country value.
	 */
	loadDest : function(options) {
		Geocoder.stopUpdateTimer();
		options = $.extend({}, options);
		var loadDefer = $.Deferred();
		EFIHelper
				.getDestWGS84(function(efiData) {
					if (Geocoder.responseHasCoordinates(efiData)) {
						var geoData = new GeoData();
						geoData.locationType = 'dest';
						geoData.lat = Geocoder.convertWGS84ToDegree(efiData.data.lat);
						geoData.lon = Geocoder.convertWGS84ToDegree(efiData.data.lon);

						if (Geocoder.getDistance(Geocoder.positionByLocationType('dest'), geoData) > Config.geocoderUpdateDistance) {
							var url = Config.geocoderUrl + '?';
							if (options.maxResults) {
								url += 'maxResults=' + options.maxResults;
							}
							if (typeof options.doNotShowNoLocationError !== 'undefined') {
								url += '&showPanel=' + !options.doNotShowNoLocationError;
							} else {
								url += '&showPanel=false';
							}
							Geocoder.loadPanel('GeocoderResult', url, options, geoData, loadDefer);
						} else {
							Geocoder.update(Geocoder.positionByLocationType('dest'));
							loadDefer.resolve();
						}
					} else {
						if (!options.doNotShowNoPositionError) {
							PM.showError(CDPError.NoDestination);
						}
						loadDefer.resolve();
					}
				});
		return loadDefer;
	},
	/**
	 * TODO The current and the destination coordinates will be added to the request.
	 * 
	 * @param panelId:string
	 * @param url:string
	 * @param [options:map]
	 *            A set of key/value pairs that configure the loading.
	 * @see PM.load(...)
	 */
	loadPosAndDest : function(panelId, url, options) {
		EFIHelper.getPosWGS84(function(efiData) {
			var curLat = Geocoder.convertWGS84ToDegree(efiData.data.lat);
			var curLon = Geocoder.convertWGS84ToDegree(efiData.data.lon);
			EFIHelper.getDestWGS84(function(efiData) {
				var destLat = Geocoder.convertWGS84ToDegree(efiData.data.lat);
				var destLon = Geocoder.convertWGS84ToDegree(efiData.data.lon);
				if (url.indexOf('?') > -1) {
					url += '&';
				} else {
					url += '?';
				}
				url += 'clat=' + curLat + '&clon=' + curLon + '&dlat=' + destLat + '&dlon=' + destLon;
				PM.load(panelId, url, options);
			});
		});
	},
	/**
	 * verify if the response has the valid coordinate.
	 * 
	 * @param efiData :
	 *            contains coordinate to be verified
	 * @returns {Boolean} : false when 0/0, 90/180 and -180/180
	 */
	responseHasCoordinates : function(efiData) {
		return !((efiData.data.lat === 'undefined' || efiData.data.lon === 'undefined')
				|| (efiData.data.lat == 0 && efiData.data.lon == 0)
				|| (efiData.data.lat == 1073741827 && efiData.data.lon == 2147483647) || (efiData.data.lat == -2147483648 && efiData.data.lon == 2147483647));
	},
	/**
	 * calculates the distance between the start and end position in meters
	 * 
	 * @param startPos:GeoData
	 * @param endPos:GeoData
	 */
	getDistance : function(startPos, endPos) {
		var dLat = (endPos.lat - startPos.lat) / 180.0 * Math.PI;
		var dLon = (endPos.lon - startPos.lon) / 180.0 * Math.PI;
		var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos((startPos.lat) / 180.0 * Math.PI)
				* Math.cos((endPos.lat) / 180.0 * Math.PI) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

		var distance = 6371000 * c;
		if (distance >= Config.geocoderUpdateDistance) {
			LOG.info('distance of locations is ' + distance + 'm.');
		}
		return distance;
	},
	/**
	 * Convert geo data from WGS84 representation into decimal representation. *
	 * 
	 * @param value
	 *            long value that represents the WGS84 Format to convert
	 * @return value in Degree
	 */
	convertWGS84ToDegree : function(value) {
		if (isNaN(value)) {
			return 0;
		}
		value = (value / (Math.pow(2, 32))) * 360;

		value = value * 1000000;
		value = Math.round(value);
		value = value / 1000000;

		return value;
	},
	/**
	 * @Convert geo data from decimal representation into WGS84 representation. *
	 * @param value
	 *            double value that represents the degree to convert
	 * @return the value in WGS84
	 * 
	 */
	convertDegreeToWGS84 : function(value) {
		if (isNaN(value)) {
			return 0;
		}
		return Math.round((value / (360)) * Math.pow(2, 32));
	}
};

/**
 * I18N - Translations
 */
var I18N = {
	data : null,
	/**
	 * This function search for the given key and returns the translation for the current locale.
	 * 
	 * @param key
	 * @returns
	 */
	get : function(key) {
		try {
			return I18N.data[PM.getCurrentLanguage()][key];
		} catch (e) {
			try {
				return I18N.data[I18N.data.defaultLocale.split('_')[0]][key];
			} catch (e) {
				return "";
			}
		}
	},
	/**
	 * This function will be called automatically, if the DOM was loaded.
	 */
	init : function() {
		if (typeof (cdpTranslations) != 'undefined' && cdpTranslations !== null
				&& cdpTranslations[PM.getCurrentLanguage()] != undefined) {
			I18N.data = cdpTranslations;
			SM.setGlobal('cdpTranslations', JSON.stringify(I18N.data));
		} else {
			I18N.data = JSON.parse(SM.getGlobal('cdpTranslations'));
			if (I18N.data === null) {
				I18N.load(false); // load from backend
			}
		}

		// $('title').text(I18N.get('pageTitle'));
	},
	load : function(async) {
		LOG.info('loading translation from backend...');
		$.ajax({
			url : Config['i18nURL'],
			type : 'GET',
			async : async,
			timeout : 30000,
			success : function(i18nJSON) {
				try {
					var translations = JSON.parse(i18nJSON);
					if (translations) {
						translations.locale = translations.locale || '';
						I18N.data = {
							'defaultLocale' : translations.locale
						};
						I18N.data[translations.locale.split('_')[0]] = translations;
						SM.setGlobal('cdpTranslations', JSON.stringify(I18N.data));
					}

				} catch (e) {
					LOG.error('I18N json could not be parsed.');
				}
				// $('title').text(I18N.get('pageTitle'));
			},
			error : function() {
				window.setTimeout(function() {
					I18N.load(async);
				}, 500);
			}
		});
	}
};

/**
 * This Object will be used to manage the last used Apps and to start them.
 */
var Favorites = {
	startApp : function(element, targetUrl, appID) {
		PM.loadPage(Favorites.addToListReturnTargetUrl(element, targetUrl, appID, false));
	},
	startExternalApp : function(element, targetUrl, appID) {
		PM.load('ExternalApp', Favorites.addToListReturnTargetUrl(element, targetUrl, appID, true));
	},
	addToListReturnTargetUrl : function(element, targetUrl, appID, isExternal) {
		element = $(element);
		Favorites.add($(element).find('div div').last().text(), $(element).find('img').attr('src'), targetUrl, appID,
				isExternal);
		if (Config['appIdentifier'] != 'Main') {
			targetUrl = '../' + targetUrl;
		}
		return targetUrl;
	},
	show : function(element) {
		var panel = '<div id="Favorites" class="panel"><div class="header"><div class="icon startIcons favorites"></div><div class="title">'
				+ $(element).find('div div').last().text()
				+ '</div><div class="clear"></div></div><div class="contentContainer"><ul class="content">';

		var data = Favorites.load();
		if (data && data.length > 0) {
			for ( var i = 0; i < data.length; i++) {
				var action = 'Favorites.startApp';
				if (data[i]['isExternal']) {
					action = 'Favorites.startExternalApp';
				}
				panel += '<li class="link" onclick="' + action + '(this, \'' + data[i]['targetUrl'] + '\', '
						+ data[i]['appID'] + ')"><div><div class="icon"><img src="' + data[i]['iconUrl']
						+ '"></div><div>' + data[i]['name'] + '</div></div></li>';
			}
		}

		panel += '</ul></div></div>';

		$('#Favorites').remove();
		PM.holder.append(panel);
		PM.show('Favorites');
	},
	remove : function(appID) {
		var data = Favorites.load();
		$.each(data, function(index) {
			if (this.appID == appID) {
				data.splice(index, 1);
				return false;
			}
		});
		Favorites.store(data);
	},
	add : function(name, iconUrl, targetUrl, appID, isExternal) {
		if (PM.isEntryMM()) {
			return; // no favorites for EntryMM
		}
		var data = Favorites.load();

		$.each(data, function(index) {
			if (this.targetUrl == targetUrl) {
				data.splice(index, 1);
				return false;
			}
		});

		data.unshift({
			name : name,
			iconUrl : iconUrl,
			targetUrl : targetUrl,
			appID : appID,
			isExternal : isExternal
		});

		if (data.length > 6) {
			data.pop();
		}

		Favorites.store(data);
	},
	load : function() {
		var data = null;
		try {
			data = SM.getGlobal('FavoritesData::' + PM.locale);
			data = JSON.parse(data);
		} catch (e) {
		}
		if (data === null) {
			data = [];
		}
		return data;
	},
	store : function(arrayList) {
		SM.setGlobal('FavoritesData::' + PM.locale, JSON.stringify(arrayList));
	},
};

/**
 * Storage Manager
 */
var SM = {
	localStorage : window.localStorage,
	sessionStorage : window.sessionStorage,
	initDefer : $.Deferred(),
	storeBackend : undefined,
	lastTimeout : undefined,
	init : function() {
		if (PM.isEntryMM()) {
			LOG.info('EntryMM detected, initializing localStorage from backend...');
			if (!this.localStorage) {
				this.localStorage = {};
			}
			if (!this.sessionStorage) {
				this.sessionStorage = {};
			}
			this.storeBackend = true;
			SM.loadBrowserCache();
			return this.initDefer;
		}
	},
	loadBrowserCache : function() {
		var cacheUrl = Config.browserCacheUrl + '?action=get';
		PM.load("localStorage", cacheUrl, {
			indicator : false
		});
	},
	storeBrowserCache : function() {
		this.initDefer.done(function() {// invocation will be delayed until done init
			if (SM.storeBackend !== true) {
				return;
			}
			if (SM.lastTimeout) {
				window.clearTimeout(SM.lastTimeout);
				SM.lastTimeout = undefined;
			}
			SM.lastTimeout = window.setTimeout(function() {// store cache after 500 ms.
				var cacheUrl = Config.browserCacheUrl + '?action=set';
				if (Config.appIdentifier !== 'Main') {// post data to main app due to b2v redirection
					cacheUrl = '../../servlet/' + cacheUrl;
				}
				var cacheData = {
					'localStorage' : escape(JSON.stringify(SM.localStorage))
				};
				LOG.info("storing localStorage into backend...");
				PM.load("localStorage", cacheUrl, {
					async : true,
					indicator : false,
					postData : cacheData,
				});
			}, 500);
		});
	},
	update : function(cacheStr) {
		LOG.info('updating localStorage from backend...');
		try {
			var cacheObj = $.parseJSON(unescape(cacheStr));
			this.localStorage = cacheObj;
			LOG.info('localStorage updated');
		} catch (e) {
			LOG.error("unable to update localStorgae from backend");
		}
		this.initDefer.resolve();
	},
	getKey : function(key) {
		return Config.appIdentifier + '::' + key;
	},
	loadPanel : function(panelId, options) {
		LOG.info('Try to load panel from storage: ' + panelId);
		var content = null;
		if (options && options.localStorage) {
			content = this.get(panelId);
		} else {
			content = this.getSession(panelId);
		}

		if (content != null
				&& $(document.createElement('div')).append(content).children().first().attr('locale') == I18N
						.get('locale')) {
			// if not in background so remove first
			if (!(options && options.background)) {
				$('.panel#' + panelId + ',.detailPanel#' + panelId).remove();
			}
			PM.holder.append(content);
			PM.show(panelId);

			LOG.info('Panel \'' + panelId + '\'loaded from storage');
			return true;
		}
		return false;
	},
	storePanel : function(panelId, options) {
		var panel = $('.panel#' + panelId + ',.detailPanel#' + panelId);
		var html = $(document.createElement("div")).append(panel.clone()).html();
		if (options && options.localStorage) {
			if (this.storeBackend !== true) {
				this.set(panelId, html);
			}
		} else {
			this.setSession(panelId, html);
		}
	},
	clearPanel : function(panelId) {
		this.clear(panelId);
		this.clearSession(panelId);
	},
	getGlobal : function(key) {
		var value = SM.localStorage[key];
		if (typeof value === 'undefined') {
			return null;
		}
		return value;
	},
	setGlobal : function(key, value) {
		if (SM.getGlobal(key) == value) {
			return;
		}
		SM.localStorage['lastCacheUpdate'] = PM.now();
		SM.localStorage[key] = value;
		SM.storeBrowserCache();
	},
	get : function(key) {
		var value = SM.localStorage[this.getKey(key)];
		if (typeof value === 'undefined') {
			return null;
		}
		return value;
	},
	set : function(key, value) {
		if (SM.get(key) == value) {
			return;
		}
		SM.localStorage['lastCacheUpdate'] = PM.now();
		SM.localStorage[this.getKey(key)] = value;
		SM.storeBrowserCache();
	},
	clear : function(key) {
		LOG.info('SM.clear(\'' + key + '\');');
		if (key === undefined) {
			for ( var i in SM.localStorage) {
				delete SM.localStorage[i];
			}
		} else {
			delete SM.localStorage[this.getKey(key)];
		}
		SM.storeBrowserCache();
	},
	getSessionGlobal : function(key) {
		var value = SM.sessionStorage[key];
		if (typeof value === 'undefined') {
			return null;
		}
		return value;
	},
	setSessionGlobal : function(key, value) {
		return SM.sessionStorage[key] = value;
	},
	getSession : function(key) {
		var value = SM.sessionStorage[this.getKey(key)];
		if (typeof value === 'undefined') {
			return null;
		}
		return value;
	},
	setSession : function(key, value) {
		return SM.sessionStorage[this.getKey(key)] = value;
	},
	clearSession : function(key) {
		LOG.info('SM.clearSession(\'' + key + '\');');
		if (key === undefined) {
			for ( var i in SM.sessionStorage) {
				delete SM.sessionStorage[i];
			}
		} else {
			delete SM.sessionStorage[this.getKey(key)];
		}
	},
	/**
	 * 
	 * @param [element]
	 */
	clearAll : function(element) {
		if (element) {
			element = $(element);
			
			$('#DeleteHistoryPanel').remove();

			var panel = '<div class="panel fix" id="DeleteHistoryPanel">';
			panel += '<div class="header"><div class="icon"><img src="../static/images/icon_setup.png"></div>';
			panel += element.text() + '</div>';
			
			panel += '<div class="contentContainer">';
			panel += '<ul class="content" scrollheight="0">';
			panel += '<li><div style="margin-left: 0px;">' + I18N.get('historyDeleted') + '</div></li>';
			
			panel += '</ul>';
			panel += '</div>';
			panel += '</div>';

			$('#PanelHolder').append(panel);
			$('#DeleteHistoryPanel').find('.content').prepend(PM.visiblePanel.find('.content .header').clone());
			PM.show('DeleteHistoryPanel');	
		}
		
		SM.clear();
		SM.clearSession();
	},
};

var MAP = {
	Config : {
		'width' : 420,
		'height' : 360,
		'GoogleOffset' : 268435456,
		'zIndexInactive' : 260,// The z-Index of an inactive Pin/Marker;
		'zIndexActive' : 261, // The z-Index of an active Pin/Marker
		'maxZoomLevel' : 18,
		'minZoomLevel' : 1,
		'staticMarkersCountries' : [ 'CN' ]
	},
	// the array of POIs which gets filled with lat, lon values
	markers : [],
	// The array which contains the calculated coordinates of all POIs in pixels
	generatedMarkers : [],
	zoom : 0, // gets calculated dynamically
	pin_width : 47, // the width of a single pin in the sprite
	pin_height : 75, // the height of a single pin in the sprite
	page_offset_left : 0, // the left side of the screen is for text
	page_offset_top : 0, // some space for the toolbar on top
	timer : -1, // wait until panel is ready

	initDetailMap : function() {
		$('.visible .content').append(
				'<div class="simplePin" style="width:47px;height:75px;position:absolute;left:275px;top:170px;"></div>');
	},
	init : function(lat, lon) {
		this.markers = [];
		this.generatedMarkers = [];
		this.zoom = 0;

		var mapDiv = $('.visible .webmap');
		if (!mapDiv.length) {
			mapDiv = $('<div class="webmap"><div id="map"/></div>');
		}
		if ($('#Main').width() > 544) {// 10''
			if (mapDiv.is('.rightContent')) {
				return;
			}
			mapDiv.addClass('rightContent').find('#map').siblings().remove();
			$('.visible .contentContainer').before(mapDiv);
		} else {
			if ($('.visible .content .webmap').length) {
				return;
			}
			mapDiv.removeClass('rightContent').find('#map').siblings().remove();
			$('.visible .contentContainer .content').append(mapDiv);
		}

		clearInterval(MAP.timer);
		MAP.timer = setInterval(function() {// wait until panel is ready
			if (PM.visiblePanel.attr('iscutted') == 'true') {
				clearInterval(MAP.timer);
				PM.scrollTop();
				MAP.initWebMap(lat, lon);
				$('.visible li.selected').focus();
			}
		}, 30);
	},
	initWebMap : function(lat, lon) {
		$('.visible li.link[cdplat][cdplon]').each(function(index) {
			var element = $(this);
			MAP.markers.push([ element.attr('cdplat'), element.attr('cdplon') ]);

			element.on("focus", function() {
				var marker = $('.visible .marker_' + index);
				var height = -(index + 1) * 150 + 75;
				marker.css('backgroundPosition', '0px ' + height + 'px');
				marker.css('z-index', MAP.Config['zIndexActive']);
			});
			element.on("blur", function() {
				var marker = $('.visible .marker_' + index);
				var height = -(index) * 150;
				marker.css('backgroundPosition', '0px ' + height + 'px');
				marker.css('z-index', MAP.Config['zIndexInactive']);
			});
		});
		this.generateMapOverlays(lat, lon);
	},
	calculateZoomLevel : function() {
		var minlat = Number.MAX_VALUE;
		var maxlat = 0;
		var minlng = Number.MAX_VALUE;
		var maxlng = 0;

		var mapdisplay = Math.min(this.Config['width'], this.Config['height']);

		var interval = 0;

		// calculate min and max values
		for ( var i = 0; i < this.markers.length; i++) {
			if ((this.markers[i][0] !== undefined) && (this.markers[i][0] != "")
					&& (Number(this.markers[i][0]) != Number.NaN) && (this.markers[i][1] !== undefined)
					&& (this.markers[i][1] != "") && (Number(this.markers[i][1]) != Number.NaN)) {
				// get min and max markers as absolute values otherwise negative coordinates are causing a wrong
				// zoomlevel
				minlat = Math.min(minlat, Math.abs(this.markers[i][0]));
				maxlat = Math.max(maxlat, Math.abs(this.markers[i][0]));
				minlng = Math.min(minlng, Math.abs(this.markers[i][1]));
				maxlng = Math.max(maxlng, Math.abs(this.markers[i][1]));
			}

			var latBuffer = ((maxlat - minlat) * 0.1) / 2;
			var lngBuffer = ((maxlng - minlng) * 0.1) / 2;

			var minLatNew = (minlat + latBuffer);
			var maxLatNew = (maxlat + latBuffer);

			var minLngNew = (minlng + lngBuffer);
			var maxLngNew = (maxlng + lngBuffer);

			maxlat = maxLatNew;
			maxlng = maxLngNew;

			minlat = minLatNew;
			minlng = minLngNew;
		}

		var ctrlat = minlat + ((maxlat - minlat) / 2);
		var ctrlng = minlng + ((maxlng - minlng) / 2);

		if ((maxlat - minlat) > (maxlng - minlng)) {
			interval = (maxlat - minlat) / 2;
			minlng = ctrlng - interval;
			maxlng = ctrlng + interval;
		} else {
			interval = (maxlng - minlng) / 2;
			minlat = ctrlat - interval;
			maxlat = ctrlat + interval;
		}

		// if a position of a poi is exactly the same or too close to the car's position, a buffer is used to avoid a
		// wrong zoom level
		if (minlat == maxlat) {
			maxlat += (maxlat / 1000);
		}
		if (minlng == maxlng) {
			maxlng += (maxlng / 1000);
		}

		var dist = (6371 * Math.acos(Math.sin(minlat / 57.2958)
				* Math.sin(maxlat / 57.2958)
				+ (Math.cos(minlat / 57.2958) * Math.cos(maxlat / 57.2958) * Math.cos((maxlng / 57.2958)
						- (minlng / 57.2958)))));

		this.zoom = Math
				.floor(8 - Math.log(1.6446 * dist * 2 / Math.sqrt(2 * (mapdisplay * mapdisplay))) / Math.log(2));
	},

	/**
	 * Here the zoom level for the Google Map gets calculated
	 */
	adjustZoomLevel : function(lat, lon) {
		center_offset_x = Math.floor(this.Config['width'] / 2);
		center_offset_y = Math.floor(this.Config['height'] / 2);

		center_x = this.LonToX(lon);
		center_y = this.LatToY(lat);

		this.fitPinsIntoMap(center_x, center_y, center_offset_x, center_offset_y);

		for ( var i = 0; i < this.generatedMarkers.length; i++) {
			var zoomLevelIsOk = false;
			while (!zoomLevelIsOk) {
				if ((this.generatedMarkers[i][0] < (this.page_offset_left)
						|| (this.generatedMarkers[i][1] < (this.page_offset_top - (this.pin_height / 2)))
						|| (this.generatedMarkers[i][0] > (this.page_offset_left + (this.Config['width'] - this.pin_width))) || (this.generatedMarkers[i][1] > (this.page_offset_top
						+ this.Config['height'] - this.pin_height)))) {

					this.zoom -= 1;
					this.fitPinsIntoMap(center_x, center_y, center_offset_x, center_offset_y);
				} else {
					zoomLevelIsOk = true;
				}
			}
		}
	},

	fitPinsIntoMap : function(center_x, center_y, center_offset_x, center_offset_y) {
		for ( var index = 0; index < this.markers.length; ++index) {
			target_y = this.LatToY(this.markers[index][0]);
			target_x = this.LonToX(this.markers[index][1]);
			delta_x = (target_x - center_x) >> (21 - this.zoom);
			delta_y = (target_y - center_y) >> (21 - this.zoom);
			marker_offset_x = center_offset_x + delta_x - Math.round(this.pin_width / 2);
			marker_offset_y = center_offset_y + delta_y - Math.round(this.pin_height);

			this.generatedMarkers[index] = [ this.page_offset_left + marker_offset_x,
					this.page_offset_top + marker_offset_y ];
		}
	},

	getMapImageUrl : function(center, zoom, isStaticMarkers) {
		var imageUrl;
		if (Config.mapImageURL) {
			var coord = center.split(',');
			if (isStaticMarkers) {
				this.generatedMarkers = this.markers.map(function(self) {
					return {
						"lat" : parseFloat(self[0]),
						"lon" : parseFloat(self[1])
					};
				});
				imageUrl = Config.mapImageURL + '?lat=' + coord[0] + '&lon=' + coord[1] + '&w=' + this.Config.width
						+ '&h=' + this.Config.height + '&lang=' + PM.getContentLanguage() + '&markers='
						+ encodeURIComponent(JSON.stringify(this.generatedMarkers));
			} else {
				imageUrl = Config.mapImageURL + '?lat=' + coord[0] + '&lon=' + coord[1] + '&zoom=' + zoom + '&w='
						+ this.Config.width + '&h=' + this.Config.height + '&lang=' + PM.getContentLanguage();
			}

		} else if (Config.imageURL) {
			imageUrl = "http://maps.googleapis.com/maps/api/staticmap" + "?center=" + center + "&zoom=" + zoom
					+ "&size=" + this.Config.width + "x" + this.Config.height + "&mobile=true" + "&maptype=mobile"
					+ "&sensor=true&language=" + PM.getContentLanguage();

			imageUrl = Config.imageURL + "?url=" + encodeURIComponent(imageUrl + "&client=gme-bmwag");
			imageUrl += "&output=jpeg&compression=5&progressive=true";
		} else {
			imageUrl = "http://maps.googleapis.com/maps/api/staticmap" + "?center=" + center + "&zoom=" + zoom
					+ "&size=" + this.Config['width'] + "x" + this.Config['height'] + "&mobile=true"
					+ "&maptype=mobile" + "&sensor=true&language=" + PM.getContentLanguage();
		}

		return imageUrl;
	},

	generateMapOverlays : function(lat, lon) {
		// Set center coordinates as pixel coordinates in world map
		center = lat + "," + lon;
		center_x = this.LonToX(lon);
		center_y = this.LatToY(lat);

		this.page_offset_left = $('.visible .webmap #map').position().left;
		this.page_offset_top = $('.visible .webmap #map').position().top;

		if (this.Config.staticMarkersCountries.indexOf(Config.homemarket) != -1) {
			var url = this.getMapImageUrl(center, this.zoom, true);
			this.createMap("map", url, this.Config['width'], this.Config['height'], this.page_offset_left,
					this.page_offset_top);
			return;
		}

		if (this.markers.length > 0) {
			this.calculateZoomLevel();
			this.adjustZoomLevel(lat, lon);
		} else {
			// No POIs found. Setting default zoomlevel to 9.
			this.zoom = 9;
		}

		var url = this.getMapImageUrl(center, this.zoom);

		center_offset_x = Math.floor(this.Config['width'] / 2);
		center_offset_y = Math.floor(this.Config['height'] / 2);

		this.createMap("map", url, this.Config['width'], this.Config['height'], this.page_offset_left,
				this.page_offset_top);

		for ( var index = 0, len = this.markers.length; index < len; ++index) {
			this.createMarker("marker_" + index, "0px -" + (index * (this.pin_height * 2)) + "px", this.pin_width,
					this.pin_height, this.generatedMarkers[index][0], this.generatedMarkers[index][1]);
		}

		this.createCurrentMarker();
		this.determineDrivingDirection();
	},
	determineDrivingDirection : function() {
		var currentPositionMarker = $('.visible .webmap #currentPosition.mapMarker.current');
		if (currentPositionMarker) {
			EFIHelper.getDrivingDirection(function(efiData) {
				var direction = efiData.data["driveDirection"];
				if (direction) {
					currentPositionMarker.addClass(direction);
				}
			});
		}
	},
	createMap : function(id, url, width, height, left, top) {
		var newdiv = $('.visible .webmap #' + id).get(0);
		if (!newdiv) {
			newdiv = document.createElement('div');
			$('.visible .webmap').append(newdiv);
		}
		newdiv.setAttribute('id', id);
		newdiv.style.width = width + "px";
		newdiv.style.height = height + "px";
		newdiv.style.padding = 0 + "px";
		newdiv.style.margin = 0 + "px";
		newdiv.style.left = left + "px";
		newdiv.style.top = top + "px";
		newdiv.style.background = "transparent";
		newdiv.innerHTML = '<img src="' + url + '"></img>';

	},

	createMarker : function(id, position, width, height, left, top) {
		var newdiv = document.createElement('div');
		newdiv.style.backgroundPosition = position;
		newdiv.className = "mapMarker " + id;
		newdiv.style.zIndex = MAP.Config['zIndexInactive'];
		newdiv.style.width = width + "px";
		newdiv.style.height = height + "px";
		newdiv.style.position = 'absolute';
		newdiv.style.padding = 0;
		newdiv.style.margin = 0;
		newdiv.style.left = left + "px";
		newdiv.style.top = top + "px";

		$('.visible .webmap').append(newdiv);
	},

	createCurrentMarker : function() {
		var newdiv = document.createElement('div');
		newdiv.setAttribute('id', 'currentPosition');

		newdiv.style.backgroundRepeat = "no-repeat";
		var locationType = Geocoder.locationType();
		if ('other' == locationType) {
			newdiv.className = "mapMarker other";
		} else if ('dest' == locationType) {
			newdiv.className = "mapMarker destination";
		} else {
			newdiv.className = "mapMarker current";
		}

		newdiv.style.zIndex = MAP.Config['zIndexActive'] - 2;
		newdiv.style.width = "48px";
		newdiv.style.height = "48px";
		newdiv.style.position = 'absolute';
		newdiv.style.padding = 0;
		newdiv.style.margin = 0;
		newdiv.style.left = (this.Config['width'] / 2 - 24) + this.page_offset_left + "px";
		newdiv.style.top = (this.Config['height'] / 2 - 24) + this.page_offset_top + "px";

		$('.visible .webmap').append(newdiv);
	},

	LonToX : function(lon) {
		radius = this.Config['GoogleOffset'] / Math.PI;
		return Math.floor(this.Config['GoogleOffset'] + radius * lon * Math.PI / 180);
	},
	LatToY : function(lat) {
		radius = this.Config['GoogleOffset'] / Math.PI;
		return Math.floor(this.Config['GoogleOffset'] - radius
				* Math.log((1 + Math.sin(lat * Math.PI / 180)) / (1 - Math.sin(lat * Math.PI / 180))) / 2);
	},
	XToLon : function(x) {
		radius = this.Config['GoogleOffset'] / Math.PI;
		return ((Math.floor(x) - this.Config['GoogleOffset']) / radius) * 180 / Math.PI;
	},
	YToLat : function(y) {
		radius = this.Config['GoogleOffset'] / Math.PI;
		return (Math.PI / 2 - 2 * Math.atan(Math.exp((Math.floor(y) - this.Config['GoogleOffset']) / radius))) * 180
				/ Math.PI;
	},

	adjustLonByPixels : function(lon, delta, zoom) {
		return XToLon(LonToX(lon) + (delta << (21 - zoom)));
	},

	adjustLatByPixels : function(lat, delta, zoom) {
		return YToLat(LatToY(lat) + (delta << (21 - zoom)));
	},
	doZoom : function(map, level) {
		var src = map.attr('src');
		var zoomInButton = PM.visiblePanel.find('li.zoomIn');
		var zoomOutButton = PM.visiblePanel.find('li.zoomOut');

		var newSrc = null;
		if (level >= this.Config.maxZoomLevel) {
			newSrc = this.replaceZooming(src, this.Config.maxZoomLevel);
			zoomInButton.addClass('inactive');
			zoomOutButton.removeClass('inactive');
		} else if (level <= this.Config.minZoomLevel) {
			newSrc = this.replaceZooming(src, this.Config.minZoomLevel);
			zoomInButton.removeClass('inactive');
			zoomOutButton.addClass('inactive');
		} else {
			newSrc = this.replaceZooming(src, level);
			zoomInButton.removeClass('inactive');
			zoomOutButton.removeClass('inactive');
		}

		PM.showLoadIndicator(true);
		PM.setLoadIndicator(true);
		map.load(function() {
			PM.showLoadIndicator(false);
			PM.setLoadIndicator(false);
		});
		map.attr('src', newSrc);
	},
	getCurrentZooming : function(mapUrl) {
		if (Config.mapImageURL && mapUrl.indexOf(Config.mapImageURL) == 0) {
			return mapUrl.match(/zoom=(.*)&w/)[1];
		} else {
			return mapUrl.match(/zoom%3D(.*)%26size/)[1];
		}
	},
	replaceZooming : function(mapUrl, level) {
		if (Config.mapImageURL && mapUrl.indexOf(Config.mapImageURL) == 0) {
			return mapUrl.replace(/zoom=(.*)&w/, 'zoom='.concat(level).concat('&w'));
		} else {
			return mapUrl.replace(/zoom%3D(.*)%26size/, 'zoom%3D'.concat(level).concat('%26size'));
		}
	},
	zoomIn : function() {
		var map = PM.visiblePanel.find('img#Map' + PM.visiblePanel.attr('id'));
		if (map.length) {
			var src = map.attr('src');
			var currZoom = this.getCurrentZooming(src);

			if (currZoom == this.Config.maxZoomLevel) {
				return;
			}
			var newZoom = parseInt(currZoom) + 1;
			this.doZoom(map, newZoom);
		}
	},
	zoomOut : function() {
		var map = PM.visiblePanel.find('img#Map' + PM.visiblePanel.attr('id'));
		if (map.length) {
			var src = map.attr('src');
			var currZoom = this.getCurrentZooming(src);

			if (currZoom == this.Config.minZoomLevel) {
				return;
			}
			var newZoom = parseInt(currZoom) - 1;
			this.doZoom(map, newZoom);
		}
	},
	showDetailMap : function(lat, lon) {
		$('#MapDetailPanel').remove();

		var map = '<div class="detailPanel fix" id="MapDetailPanel">';
		map += '<ul class="toolbar">';
		map += '<li onclick="MAP.zoomIn()" title="' + I18N.get('zoomIn')
				+ '" class="zoomIn"><div class="icon zoomIn"></div></li>';
		map += '<li onclick="MAP.zoomOut()" title="' + I18N.get('zoomOut')
				+ '" class="zoomOut"><div class="icon zoomOut"></div></li>';
		map += '</ul>';
		map += '<div class="content">';
		map += '<div>';
		map += '<img id="MapMapDetailPanel" src="' + this.getMapImageUrl(lat + ',' + lon, 15) + '"/>';
		map += '</div>';
		map += '<div class="simplePin" style="width: 47px; height: 75px; position: absolute; left: 275px; top: 170px;"></div>';
		map += '</div>';
		map += '</div>';

		$('#PanelHolder').append(map);
		$('#MapDetailPanel').find('.content').prepend(PM.visiblePanel.find('.content .header').clone());
		PM.show('MapDetailPanel');
	}
};

/**
 * Constants
 */
var EFIerrors = {
	"NO_NAVIGATION" : "100_NO_NAVIGATION",
	"NO_TELESERVICES" : "101_NO_TELESERVICES",
	"NO_GPS" : "102_NO_GPS",
	"NO_TV" : "103_NO_TV",
	"NO_PHONE" : "104_NO_PHONE",
	"NO_BMW_INTERNET" : "105_NO_BMW_INTERNET",
	"NO_DESTINATION" : "200_NO_DESTINATION"
};

/**
 * This is the wrapper for the bevPlugin.
 * 
 * @author Hao Hu, NTT Data Deutschland
 */
var BEVHelper = {
	plugin : null, // holder for the plugin found
	testMode : false,
	init : function() {
		// Check if BEVPluginSimulator is available
		if (typeof BEVPluginSimulator != 'undefined') {
			this.plugin = new BEVPluginSimulator();
			LOG.info('bevPlugin Simulator loaded.');
			this.testMode = true;
		} else {
			this.plugin = document.getElementById("bevPlugin");
			if (this.plugin != null) {
				LOG.info('bevPlugin found.');
			} else {
				LOG.error('bevPlugin not found.');
			}
		}
		LOG.info('BEVHelper is initialized.');
	},
	getGear : function() {
		LOG.info("calling bevPlugin.GetGear()");
		try {
			var response = this.plugin.GetGear();
			if (response && response.gear != null) {
				return response.gear;
			} else {
				LOG.error("no response of gear");
			}
		} catch (e) {
			LOG.error("error occurred in calling bevPlugin.GetGear()");
		}
		return -1;
	},
	getClutch : function() {
		LOG.info("calling bevPlugin.GetClutch()");
		try {
			var response = this.plugin.GetClutch();
			if (response && response.clutch != null) {
				LOG.info("current clutch: " + response.clutch);
				return response.clutch;
			} else {
				LOG.info("no response of clutch");
			}
		} catch (e) {
			LOG.error("error occurred in calling bevPlugin.GetClutch()");
		}
		return -1;
	},
	getSpeed : function() {
		LOG.info("calling bevPlugin.GetSpeed()");
		try {
			var response = this.plugin.GetSpeed();
			if (response && response.speed != null) {
				LOG.info("current speed: " + response.speed);
				return response.speed;
			} else {
				LOG.info("no response of speed");
			}
		} catch (e) {
			LOG.error("error occurred in calling bevPlugin.GetSpeed()");
		}
		return -1;
	}
};

/**
 * Response object of the EFIHelper, which will be given to the defined callback functions.
 */
var EFIData = function(_ack, _detail, _data) {
	this.ACK = _ack;
	this.DETAIL = _detail;
	this.data = _data;
};

/**
 * This is the Wrapper for the EFI Plugin of the vehicle Browser.use
 * 
 * @author Edmund Hierlemann, doubleslash
 * @author Thomas Stadlander, Cirquent
 */
var EFIHelper = {
	plugin : null, // holder for the found plugin
	testMode : false, // for test in desktop browser
	callbackFunction : null, // call this function after getting efi response
	retryTime : 0, // retry times of calling function getPosWGS84
	init : function() {

		// Check if EFIPluginSimulator is available
		if (typeof EFIPluginSimulator != 'undefined') {
			this.plugin = new EFIPluginSimulator();
			LOG.info('EFIHelper Simulator.');
			this.testMode = true;
		} else {
			this.plugin = document.getElementById("harmanEfiplugin");
			if (this.plugin != null) {
				LOG.info('EFIHelper plugin found.');
			} else {
				LOG.error('EFIHelper plugin not found.');
			}
		}
		LOG.info('EFIHelper is initialized.');
	},
	getPosCallback : function(_responseObject) {
		LOG.info('getPosCallback of EFIHelper');

		var efiData = new EFIData();
		efiData.ACK = _responseObject.ACK;
		efiData.DETAIL = _responseObject.DETAIL;
		efiData.data = {};

		if (_responseObject !== undefined && _responseObject.data !== undefined && efiData.ACK == true) {
			var d = _responseObject.data;
			efiData.data["lat"] = d.posLat;
			efiData.data["lon"] = d.posLong;
			LOG.info('current position: ' + d.posLat + ', ' + d.posLong);
		} else {
			EFIHelper.retryTime++;
			if (EFIHelper.retryTime > 3) {
				efiData.data["lon"] = 0;
				efiData.data["lat"] = 0;
				LOG.info('-> Retrying times exceeded, set coordinates to 0,0');
			} else {
				LOG.info('-> Retrying ' + EFIHelper.retryTime + ' times to call EFIHelper.getPosWGS84');
				EFIHelper.getPosWGS84(EFIHelper.posCallbackFunction);
				return;
			}
		}

		EFIHelper.retryTime = 0;
		EFIHelper.posCallbackFunction(efiData);
		Geocoder.startUpdateTimer();
	},
	genericCallback : function(_responseObject) {
		LOG.info('genericCallback of EFIHelper');

		var efiData = new EFIData(), d;
		efiData.ACK = false;
		efiData.data = {};

		if (_responseObject !== undefined && _responseObject.ACK == true) {
			efiData.ACK = _responseObject.ACK;
			efiData.DETAIL = _responseObject.DETAIL;
			if (d = _responseObject.data) {
				if (d.settings !== undefined) {
					efiData.data["settings"] = d.settings;
				}
				if (d.tsType !== undefined) {
					efiData.data["tsType"] = d.tsType;
				}
				if (d.destLong !== undefined) {
					efiData.data["lon"] = d.destLong;
				}
				if (d.destLat !== undefined) {
					efiData.data["lat"] = d.destLat;
				}
				if (d.destDescr !== undefined) {
					efiData.data["desc"] = d.destDescr;
				}
				if (d.type !== undefined) {
					efiData.data["type"] = d.type;
				}
				if (d.posLong !== undefined) {
					efiData.data["lon"] = d.posLong;
				}
				if (d.posLat !== undefined) {
					efiData.data["lat"] = d.posLat;
				}
				if (d.range !== undefined) {
					efiData.data["range"] = d.range;
				}
				if (d.unit !== undefined) {
					efiData.data["unit"] = d.unit;
				}
				if (d.country !== undefined) {
					efiData.data["country"] = d.country;
				}
				if (d.town !== undefined) {
					efiData.data["town"] = d.town;
				}
				if (d.street !== undefined) {
					efiData.data["street"] = d.street;
				}
				if (d.number !== undefined) {
					efiData.data["number"] = d.number;
				}
				if (d.crossing !== undefined) {
					efiData.data["crossing"] = d.crossing;
				}
				if (d.arrTime !== undefined) {
					efiData.data["arrTime"] = d.arrTime;
				}
				if (d.status !== undefined) {
					efiData.data["status"] = d.status;
				}
				if (d.fueltype !== undefined) {
					efiData.data["fueltype"] = d.fueltype;
				}
				if (d.driveDirection !== undefined) {
					efiData.data["driveDirection"] = d.driveDirection;
				}
			}
		}
		EFIHelper.callbackFunction(efiData);
		Geocoder.startUpdateTimer();
	},
	startTeleserviceCall : function(_callback, _tsType) {
		Geocoder.stopUpdateTimer();
		this.callbackFunction = _callback;
		this.plugin.startTeleserviceCall(this.genericCallback, _tsType);
	},
	setDestWGS84 : function(_callback, _destLat, _destLong, _destDescr, _catId) {
		Geocoder.stopUpdateTimer();
		this.callbackFunction = _callback;
		if (!_catId) {
			this.plugin.setDestWGS84(this.genericCallback, _destLong, _destLat, _destDescr);
		} else {// for intermodal routing
			this.plugin.setDestWGS84(this.genericCallback, _destLong, _destLat, _destDescr, _catId);
		}
	},
	getArrivalTime : function(_callback) {
		Geocoder.stopUpdateTimer();
		this.callbackFunction = _callback;
		this.plugin.getArrivalTime(this.genericCallback);
	},
	getAudioSource : function(_callback) {
		Geocoder.stopUpdateTimer();
		this.callbackFunction = _callback;
		this.plugin.getAudioSource(this.genericCallback);
	},
	getCarSettings : function(_callback) {
		Geocoder.stopUpdateTimer();
		this.callbackFunction = _callback;
		this.plugin.getCarSettings(this.genericCallback);
	},
	getCarStatus : function(_callback) {
		// Geocoder.stopUpdateTimer(); do not stop, because this function could be called every 2s. So Position will
		// never be updated.
		this.savedCarStatusCallback = _callback;
		this.plugin.getCarStatus(this.genericCallbackCarStatus);
	},
	savedCarStatusCallback : null,
	genericCallbackCarStatus : function(_responseObject) {
		LOG.info('genericCallbackCarStatus of EFIHelper');

		var efiData = new EFIData();
		efiData.ACK = _responseObject.ACK;
		efiData.DETAIL = _responseObject.DETAIL;
		efiData.data = {};

		if (_responseObject !== undefined && _responseObject.data !== undefined && efiData.ACK == true) {
			var d = _responseObject.data;
			if (d.status !== undefined) {
				efiData.data["status"] = d.status;
			}
		}
		EFIHelper.savedCarStatusCallback(efiData);
	},
	getHandBrakeLightStatus : function(_callback) {
		return this.plugin.getHandBrakeLightStatus();
	},
	getShowTimeDate : function(_callback) {
		return this.plugin.getShowTimeDate();
	},
	getCoDriver : function(_callback) {
		Geocoder.stopUpdateTimer();
		this.callbackFunction = _callback;
		this.plugin.getCoDriver(this.genericCallback);
	},
	getCruisingRange : function(_callback) {
		Geocoder.stopUpdateTimer();
		this.callbackFunction = _callback;
		this.plugin.getCruisingRange(this.genericCallback);
	},
	getDestWGS84 : function(_callback) {
		Geocoder.stopUpdateTimer();
		this.callbackFunction = _callback;
		this.plugin.getDestWGS84(this.genericCallback);
	},
	getDistanceToDestination : function(_callback) {
		Geocoder.stopUpdateTimer();
		this.callbackFunction = _callback;
		this.plugin.getDistanceToDestination(this.genericCallback);
	},
	getDrivingDirection : function(_callback) {
		Geocoder.stopUpdateTimer();
		this.callbackFunction = _callback;
		this.plugin.getDrivingDirection(this.genericCallback);
	},
	getFuelType : function(_callback) {
		Geocoder.stopUpdateTimer();
		this.callbackFunction = _callback;
		this.plugin.getFuelType(this.genericCallback);
	},
	getJourneyComputerData : function(_callback) {
		Geocoder.stopUpdateTimer();
		this.callbackFunction = _callback;
		this.plugin.getJourneyComputerData(this.genericCallback);
	},
	getKilometerStatus : function(_callback) {
		Geocoder.stopUpdateTimer();
		this.callbackFunction = _callback;
		this.plugin.getKilometerStatus(this.genericCallback);
	},
	getPhoneStatus : function(_callback) {
		Geocoder.stopUpdateTimer();
		this.callbackFunction = _callback;
		this.plugin.getPhoneStatus(this.genericCallback);
	},
	getPosAdr : function(_callback) {
		Geocoder.stopUpdateTimer();
		this.callbackFunction = _callback;
		this.plugin.getPosAdr(this.genericCallback);
	},
	posCallbackFunction : null,
	getPosWGS84 : function(_callback) {
		Geocoder.stopUpdateTimer();
		this.posCallbackFunction = _callback;
		this.plugin.getPosWGS84(this.getPosCallback);
	},
	getRadioStation : function(_callback) {
		Geocoder.stopUpdateTimer();
		this.callbackFunction = _callback;
		this.plugin.getRadioStation(this.genericCallback);
	},
	getTVStation : function(_callback) {
		Geocoder.stopUpdateTimer();
		this.callbackFunction = _callback;
		this.plugin.getTVStation(this.genericCallback);
	},
	getUserAgent : function(_callback) {
		Geocoder.stopUpdateTimer();
		this.callbackFunction = _callback;
		this.plugin.getUserAgent(this.genericCallback);
	},
	getVersion : function(_callback) {
		Geocoder.stopUpdateTimer();
		this.callbackFunction = _callback;
		this.plugin.getVersion(this.genericCallback);
	},
	goHome : function(_callback) {
		Geocoder.stopUpdateTimer();
		this.callbackFunction = _callback;
		this.plugin.goHome(this.genericCallback);
	},
	makeVoiceCall : function(_callback, _phoneNumber) {
		Geocoder.stopUpdateTimer();
		this.callbackFunction = _callback;
		this.plugin.makeVoiceCall(this.genericCallback, _phoneNumber);
	},
	sendToAddress : function(_callback) {
		Geocoder.stopUpdateTimer();
		this.callbackFunction = _callback;
		this.plugin.sendToAddress(this.genericCallback);
	},
	setHome : function(_callback, _homeURL) {
		Geocoder.stopUpdateTimer();
		this.callbackFunction = _callback;
		this.plugin.setHome(this.genericCallback, _homeURL);
	},
	setVINRN : function(_callback, _VINRN) {
		Geocoder.stopUpdateTimer();
		this.callbackFunction = _callback;
		this.plugin.setVINRN(this.genericCallback, _VINRN);
	},
	startBIN : function(_callback, _url) {
		Geocoder.stopUpdateTimer();
		this.callbackFunction = _callback;
		this.plugin.startBIN(this.genericCallback, _url);
	},
	/**
	 * _authLevel = 1: do authentication only if necessary _authLevel = 2: ask for password; current user will be
	 * displayed _authLevel = 3: ask for user and password
	 */
	doUSSOauth : function(_callback, _authLevel) {
		Geocoder.stopUpdateTimer();
		this.callbackFunction = _callback;
		var level = parseInt(_authLevel);
		if (isNaN(level) || level < 1 || level > 3) {
			level = 3; // default
		}
		this.plugin.doUSSOauth(this.genericCallback, level);
	},
	naviTripImport : function(_callback, _importUrl, _descr, _filesize) {
		Geocoder.stopUpdateTimer();
		this.callbackFunction = _callback;
		this.plugin.naviTripImport(this.genericCallback, _importUrl, _descr, _filesize);
	},
	PIAExport : function(_callback, PIAIDListStream, PIAIDListFlag, uploadProfileURL) {
		Geocoder.stopUpdateTimer();
		this.callbackFunction = _callback;
		this.plugin.piaExport(this.genericCallback, PIAIDListStream, PIAIDListFlag, uploadProfileURL);
	},
	PIAImport : function(_callback, downloadProfileURL) {
		Geocoder.stopUpdateTimer();
		this.callbackFunction = _callback;
		this.plugin.piaImport(this.genericCallback, downloadProfileURL);
	},
	exitBrowser : function(obj) {
		this.plugin.exitBrowser(obj);
	},
	/**
	 * trace-functions used to create HU-logs
	 * 
	 * @param msg
	 *            message to be logged
	 */
	traceMessage : function(msg) {
		this.plugin.traceMessage(msg);
	},
	traceWarning : function(msg) {
		this.plugin.traceWarning(msg);
	},
	traceError : function(msg) {
		this.plugin.traceError(msg);
	},
	traceFatalError : function(msg) {
		this.plugin.traceFatalError(msg);
	}
};

String.prototype.hashCode = function() {
	var hash = 0;
	if (this.length === 0)
		return hash;
	for ( var i = 0; i < this.length; i++) {
		c = this.charCodeAt(i);
		hash = ((hash << 5) - hash) + c;
		hash = hash & hash; // Convert to 32bit integer
	}
	return hash;
};

/**
 * Logger. Usage: LOG.error('LOG started.'); LOG.info('LOG started.');
 */
var LOG = {
	error : function(text) {
		var logEntry = LOG.generateLogEntry(text);
		if (typeof EFIHelper != "undefined" && logEntry !== undefined) {
			try {
				EFIHelper.traceError(logEntry);
			} catch (e) {
				// if the EFI-function not exists, do nothing
			}
		}
	},
	info : function(text) {
		var logEntry = LOG.generateLogEntry(text);
		if (typeof EFIHelper != "undefined" && logEntry !== undefined) {
			try {
				EFIHelper.traceMessage(logEntry);
			} catch (e) {
				// if the EFI-function not exists, do nothing
			}
		}
	},
	warn : function(text) {
		var logEntry = LOG.generateLogEntry(text);
		if (typeof EFIHelper != "undefined" && logEntry !== undefined) {
			try {
				EFIHelper.traceWarning(logEntry);
			} catch (e) {
				// if the EFI-function not exists, do nothing
			}
		}
	},
	fatalError : function(text) {
		var logEntry = LOG.generateLogEntry(text);
		if (typeof EFIHelper != "undefined" && logEntry !== undefined) {
			try {
				EFIHelper.traceFatalError(logEntry);
			} catch (e) {
				// if the EFI-function not exists, do nothing
			}
		}
	},
	generateLogEntry : function(text) {
		if (typeof text != 'object' && typeof Config != "undefined") {
			return '[' + Config.appIdentifier + '] ' + text;
		} else {
			LOG.error('unable to generate the log entry!');
			return undefined;
		}
	}
};

// all following functions are needed for the speechcontrol plugin.
function speechAction_0() {
	eval(SpeechControl.actions[0]);
}
function speechAction_1() {
	eval(SpeechControl.actions[1]);
}
function speechAction_2() {
	eval(SpeechControl.actions[2]);
}
function speechAction_3() {
	eval(SpeechControl.actions[3]);
}
function speechAction_4() {
	eval(SpeechControl.actions[4]);
}
function speechAction_5() {
	eval(SpeechControl.actions[5]);
}
function speechAction_6() {
	eval(SpeechControl.actions[6]);
}
function speechAction_7() {
	eval(SpeechControl.actions[7]);
}
function speechAction_8() {
	eval(SpeechControl.actions[8]);
}
function speechAction_9() {
	eval(SpeechControl.actions[9]);
}
