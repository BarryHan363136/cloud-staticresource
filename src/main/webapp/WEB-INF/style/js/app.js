//Config['startPanelID'] = 'weather_forecast_1';

Config.switchScreenCallback = function(value) {
	setWeatherWidgetsVisibility(value);
};

//var startPanelOptions = {
//		geocoder : "cur",
//};
//
//Config.startPanelOptions = startPanelOptions;

Config.startPanelID = 'weather';
Config.geocoderSupportedCountries = [ 'CN' ];


function testChangeStyle(xValue) {
	PM.changeStyle({errorCode : 0, xSize : xValue})
}

Geocoder.updateCallbacks.push(weatherGeocoderCallback);
function weatherGeocoderCallback (){	
	var locationType = Geocoder.locationType();
	if (locationType !== 'cur' && locationType !== 'dest'){
		return;
	}	
	var maxDistance = 10000; //meter
	var lastGeodata = undefined;
	try{
		lastGeodata = JSON.parse(unescape(PM.visiblePanel.attr('cdpgeodata')));
	}catch(e){
		LOG.error('unable to retrieve the last geodata');
	}

	if (lastGeodata !== undefined) {
		if (Geocoder.getDistance(lastGeodata, Geocoder.positionByLocationType(locationType)) > maxDistance) {
			LOG.info('max. distance reached, loading new weather content...');
			PM.load('weather', 'id4-weather/rest/v1/weatherInfo', {geocoder : locationType});
		}
	}
}

function setWeatherWidgetsVisibility(sevenInchDisplay) {
	if (sevenInchDisplay) {
		// 7''
		doChangeVisibility(3, false);
	} else {
		// 10''
		doChangeVisibility(3, true);
	}
}

function doChangeVisibility(maxVisible, visible) {
	if (visible) {
		$('.windinfo').show();
	} else {
		$('.windinfo').hide();
	}

	$('tr:not(.windinfo)').each(function() {
		$(this).find('td').each(function(index) {
			if (index > maxVisible) {
				if (visible) {
					$(this).show();
				} else {
					$(this).hide();
				}
			}
		});
	});
}

function showPrev() {
	var visibleDiv = $('div[id^="forecast"]:visible');
	var currentId = 0;

	if(visibleDiv.length == 1){
	    var idStr = visibleDiv[0].id;
	    currentId = parseInt(idStr.substr(idStr.indexOf('_') + 1));
	}
	if (currentId > 1){
	    $('#forecast_' + currentId).toggle();
	    currentId--;
	    $('#forecast_' + currentId).toggle();
	    $('li#go_next_link').removeClass('inactive').removeClass('cdp_inactive');
	    var tts = $('#forecast_' + currentId).find('.tts_off');
	    var ttsheader = $('#forecast_' + currentId).find('.ttsheader_off');
	    var tts_old = visibleDiv.find('.tts');
    	if (tts_old){
    		//if any, remove tts class from old div
    		tts_old.addClass('tts_off');
	    	tts_old.removeClass('tts');	
    	}
	    if (tts.contents().length < 1){
	    	//inactivate text to speech button
	    	$('li.textToSpeech').addClass('inactive').addClass('cdp_inactive');
	    }else {
	    	$('li.textToSpeech').removeClass('inactive').removeClass('cdp_inactive');
	    	tts.addClass('tts');
	    	tts.removeClass('tts_off');
	    	
	    	var ttsheader_old = visibleDiv.find('.ttsheader');
	    	ttsheader_old.addClass('ttsheader_off');
	    	ttsheader_old.removeClass('ttsheader');
	    	ttsheader.addClass('ttsheader');
	    	ttsheader.removeClass('ttsheader_off');
	    }
		PM.visiblePanel.setScrollHeight(0);
		if (PM.visiblePanel.outerHeight() <= PM.visiblePanel.getViewportHeight()) {
			PM.visiblePanel.find('li.scrollUp').addClass('inactive');
			PM.visiblePanel.find('li.scrollDown').addClass('inactive');
		}
	}
	if (currentId <= 1){
	    //$('li#go_next_link').addClass('selected');
	    //$('li#go_prev_link').removeClass('selected');
	    $('li#go_prev_link').addClass('inactive').addClass('cdp_inactive');
	}
}

function showNext() {
	var visibleDiv = $('div[id^="forecast"]:visible');
	var length = $('div[id^="forecast"]').length;
	var currentId = 0;

	if(visibleDiv.length == 1){
	    var idStr = visibleDiv[0].id;
	    currentId = parseInt(idStr.substr(idStr.indexOf('_') + 1));
	}
	if (currentId < length){
	    $('#forecast_' + currentId).toggle();
	    currentId++;
	    $('#forecast_' + currentId).toggle();
	    $('li#go_prev_link').removeClass('inactive').removeClass('cdp_inactive');
	    var tts = $('#forecast_' + currentId).find('.tts_off');
	    var ttsheader = $('#forecast_' + currentId).find('.ttsheader_off');
	    var tts_old = visibleDiv.find('.tts');
    	if (tts_old){
    		//if any, remove tts class from old div
    		tts_old.addClass('tts_off');
	    	tts_old.removeClass('tts');	
    	}
	    if (tts.contents().length < 1){
	    	//inactivate text to speech button
	    	$('li.textToSpeech').addClass('inactive').addClass('cdp_inactive');
	    }else {
	    	$('li.textToSpeech').removeClass('inactive').removeClass('cdp_inactive');	    	
	    	tts.addClass('tts');
	    	tts.removeClass('tts_off');
	    	
	    	var ttsheader_old = visibleDiv.find('.ttsheader');
	    	ttsheader_old.addClass('ttsheader_off');
	    	ttsheader_old.removeClass('ttsheader');
	    	ttsheader.addClass('ttsheader');
	    	ttsheader.removeClass('ttsheader_off');
	    }
		PM.visiblePanel.setScrollHeight(0);
		if (PM.visiblePanel.outerHeight() <= PM.visiblePanel.getViewportHeight()) {
			PM.visiblePanel.find('li.scrollUp').addClass('inactive');
			PM.visiblePanel.find('li.scrollDown').addClass('inactive');
		}
	}
	if (currentId >= length){
	    //$('li#go_prev_link').addClass('selected');
	    //$('li#go_next_link').removeClass('selected');
	    $('li#go_next_link').addClass('inactive').addClass('cdp_inactive');
	}
}