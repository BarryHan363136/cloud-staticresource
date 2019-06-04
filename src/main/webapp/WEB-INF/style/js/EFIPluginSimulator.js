// Simulates responses of the HBAS Browser Plugin

// [!] requires EFIPluginSimulatorCar.js

// needed for login
var tempLoginCallback = null;
// For testing error getTime
var hasError = false;

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

var returnObject = function(_ack, _detail, _data) {
	this.ACK = _ack;
	this.DETAIL = _detail;
	this.data = _data;
};

var time = function(_hour, _minute, _second) {
	this.hour = _hour;
	this.minute = _minute;
	this.second = _second;

};

var radioTextPlus = function(_radioText) {
	this.radioText = _radioText;
};

function BEVPluginSimulator() {
	try {
		$('#SimulatorSpeed').find('option[value="' + car.speed + '"]').attr('selected', 'true');
		$('#SimulatorGear').find('option[value="' + car.gear + '"]').attr('selected', 'true');
		$('#SimulatorClutch').find('option[value="' + car.clutch + '"]').attr('selected', 'true');
	} catch (e) {

	}
}

// ##############################################################################################
// BEV-FUNCTIONS
// ##############################################################################################

// ==============================================================================================
// : GetGear
// ==============================================================================================
BEVPluginSimulator.prototype.GetGear = function() {
	return {
		"gear" : car.gear
	};
};

// ==============================================================================================
// : GetClutch
// ==============================================================================================
BEVPluginSimulator.prototype.GetClutch = function() {
	return {
		"clutch" : car.clutch
	};
};

// ==============================================================================================
// : GetSpeed
// ==============================================================================================
BEVPluginSimulator.prototype.GetSpeed = function() {
	return {
		"speed" : car.speed
	};
};

function EFIPluginSimulator() {
	try {
		$('#SimulatorPosition').find('option[value="' + car.posLat() + ',' + car.posLong() + '"]').attr('selected',
				'true');
		$('#SimulatorDestination').find('option[value="' + car.destLat() + ',' + car.destLong() + '"]').attr(
				'selected', 'true');
	} catch (e) {

	}
}

// ##############################################################################################
// EFI-FUNCTIONS
// ##############################################################################################

// ==============================================================================================
// : startTeleserviceCall 4.1
// ==============================================================================================
EFIPluginSimulator.prototype.startTeleserviceCall = function(_callback, _tsType) {

	car.tsType = _tsType;

	var rO = new returnObject();
	rO.ACK = true;
	rO.DETAIL = "";
	rO.data = {
		"tsType" : car.tsType
	};

	if (car.testCase == 1) {
		rO.ACK = false;
		rO.DETAIL = car.undefinedError;
		rO.data = {};
	}
	if (car.testCase == 2) {
		// 101_NO_TELESERVICES
		rO.ACK = false;
		rO.DETAIL = EFIerrors.NO_TELESERVICES;
		rO.data = {};
	}

	_callback.apply(this, [ rO ]);
};

// ==============================================================================================
// : setDestWGS84 4.2 >>> SET <<<
// ==============================================================================================
EFIPluginSimulator.prototype.setDestWGS84 = function(_callback, _destLong, _destLat, _destDescr) {

	car.destLong = _destLong;
	car.destLat = _destLat;
	car.destDescr = _destDescr;

	var rO = new returnObject();
	rO.ACK = true;
	rO.DETAIL = "";
	rO.data = {
		"destLong" : car.destLong,
		"destLat" : car.destLat,
		"destDescr" : car.destDescr
	};

	if (car.testCase == 1) {
		rO.ACK = false;
		rO.DETAIL = car.undefinedError;
		rO.data = {};
	}

	if (car.testCase == 2) {
		// 100_NO_NAVIGATION
		rO.ACK = false;
		rO.DETAIL = EFIerrors.NO_NAVIGATION;
		rO.data = {};
	}

	_callback.apply(this, [ rO ]);
};

// ==============================================================================================
// : getArrivalTime 4.3 <<< GET >>>
// ==============================================================================================
EFIPluginSimulator.prototype.getArrivalTime = function(_callback) {

	var rO = new returnObject();
	rO.ACK = true;
	rO.DETAIL = "";
	rO.data = {
		"arrTime" : car.arrTime
	};

	if (car.testCase == 1) {
		rO.ACK = false;
		rO.DETAIL = car.undefinedError;
		rO.data = {};
	}

	if (car.testCase == 2) {
		// 100_NO_NAVIGATION
		rO.ACK = false;
		rO.DETAIL = EFIerrors.NO_NAVIGATION;
		rO.data = {};
	}
	if (car.testCase == 3) {
		// 200_NO_DESTINATION
		rO.ACK = false;
		rO.DETAIL = EFIerrors.NO_DESTINATION;
		rO.data = {};
	}

	_callback.apply(this, [ rO ]);
};

// ==============================================================================================
// : getAudioSource 4.4 <<< GET >>>
// ==============================================================================================
EFIPluginSimulator.prototype.getAudioSource = function(_callback) {

	var rO = new returnObject();
	rO.ACK = true;
	rO.DETAIL = "";
	rO.data = {
		"source" : car.source
	};

	if (car.testCase == 1) {
		rO.ACK = false;
		rO.DETAIL = car.undefinedError;
		rO.data = {};
	}

	_callback.apply(this, [ rO ]);
};

// ==============================================================================================
// : getCarSettings 4.5 <<< GET >>>
// ==============================================================================================
EFIPluginSimulator.prototype.getCarSettings = function(_callback) {

	var rO = new returnObject();
	rO.ACK = true;
	rO.DETAIL = "";
	rO.data = {
		"settings" : car.settings
	};

	if (car.testCase == 1) {
		rO.ACK = false;
		rO.DETAIL = car.undefinedError;
		rO.data = {};
	}

	_callback.apply(this, [ rO ]);
};

// ==============================================================================================
// : getCarStatus 4.6 <<< GET >>>
// ==============================================================================================
EFIPluginSimulator.prototype.getCarStatus = function(_callback) {

	var rO = new returnObject();
	rO.ACK = true;
	rO.DETAIL = "";
	rO.data = {
		"status" : car.status
	};

	if (car.testCase == 1) {
		rO.ACK = false;
		rO.DETAIL = car.undefinedError;
		rO.data = {};
	}

	_callback.apply(this, [ rO ]);
};

// ==============================================================================================
// : getCoDriver 4.7 <<< GET >>>
// ==============================================================================================
EFIPluginSimulator.prototype.getCoDriver = function(_callback) {

	var rO = new returnObject();
	rO.ACK = true;
	rO.DETAIL = "";
	rO.data = {
		"codriver" : car.codriver
	};

	if (car.testCase == 1) {
		rO.ACK = false;
		rO.DETAIL = car.undefinedError;
		rO.data = {};
	}

	_callback.apply(this, [ rO ]);
};

// ==============================================================================================
// : getCruisingRange 4.8 <<< GET >>>
// ==============================================================================================
EFIPluginSimulator.prototype.getCruisingRange = function(_callback) {

	var rO = new returnObject();
	rO.ACK = true;
	rO.DETAIL = "";
	rO.data = {
		"range" : car.range,
		"unit" : car.unit
	};

	if (car.testCase == 1) {
		rO.ACK = false;
		rO.DETAIL = car.undefinedError;
		rO.data = {};
	}

	_callback.apply(this, [ rO ]);
};

// ==============================================================================================
// : getDestWGS84 4.9 <<< GET >>>
// ==============================================================================================
EFIPluginSimulator.prototype.getDestWGS84 = function(_callback) {

	var rO = new returnObject();
	rO.ACK = true;
	rO.DETAIL = "";
	rO.data = {
		"destLong" : car.destLong(),
		"destLat" : car.destLat(),
		"destDescr" : car.destDescr
	};

	if (car.testCase == 1) {
		rO.ACK = false;
		rO.DETAIL = car.undefinedError;
		rO.data = {};
	}
	if (car.testCase == 2) {
		// 100_NO_NAVIGATION
		rO.ACK = false;
		rO.DETAIL = EFIerrors.NO_NAVIGATION;
		rO.data = {};
	}
	if (car.testCase == 3) {
		// 200_NO_DESTINATION
		rO.ACK = false;
		rO.DETAIL = EFIerrors.NO_DESTINATION;
		rO.data = {};
	}

	_callback.apply(this, [ rO ]);
};

// ==============================================================================================
// : getDistanceToDestination 4.10 <<< GET >>>
// ==============================================================================================
EFIPluginSimulator.prototype.getDistanceToDestination = function(_callback) {

	var rO = new returnObject();
	rO.ACK = true;
	rO.DETAIL = "";
	rO.data = {
		"destDistance" : car.destDistance,
		"unit" : car.unit
	};

	if (car.testCase == 1) {
		rO.ACK = false;
		rO.DETAIL = car.undefinedError;
		rO.data = {};
	}
	if (car.testCase == 2) {
		// 100_NO_NAVIGATION
		rO.ACK = false;
		rO.DETAIL = EFIerrors.NO_NAVIGATION;
		rO.data = {};
	}
	if (car.testCase == 3) {
		// 200_NO_DESTINATION
		rO.ACK = false;
		rO.DETAIL = EFIerrors.NO_DESTINATION;
		rO.data = {};
	}

	_callback.apply(this, [ rO ]);
};

// ==============================================================================================
// : getDrivingDirection 4.11 <<< GET >>>
// ==============================================================================================
EFIPluginSimulator.prototype.getDrivingDirection = function(_callback) {

	var rO = new returnObject();
	rO.ACK = true;
	rO.DETAIL = "";
	rO.data = {
		"driveDirection" : car.driveDirection,
		"posLat" : car.posLat,
		"posLong" : car.posLong,
		"driveAngle" : car.driveAngle
	};

	if (car.testCase == 1) {
		rO.ACK = false;
		rO.DETAIL = car.undefinedError;
		rO.data = {};
	}
	if (car.testCase == 2) {
		// 102_NO_GPS
		rO.ACK = false;
		rO.DETAIL = EFIerrors.NO_GPS;
		rO.data = {};
	}

	var randomDirection = Math.floor((Math.random() * 100) + 1); // 1~100
	if (randomDirection < 25) {
		rO.data["driveDirection"] = "N";
	}
	if (randomDirection >= 25 && randomDirection < 50) {
		rO.data["driveDirection"] = "W";
	}
	if (randomDirection >= 50 && randomDirection < 75) {
		rO.data["driveDirection"] = "E";
	}
	if (randomDirection >= 75 && randomDirection < 100) {
		rO.data["driveDirection"] = "S";
	}

	_callback.apply(this, [ rO ]);
};

// ==============================================================================================
// : getFuelType 4.12 <<< GET >>>
// ==============================================================================================
EFIPluginSimulator.prototype.getFuelType = function(_callback) {

	var rO = new returnObject();
	rO.ACK = true;
	rO.DETAIL = "";
	rO.data = {
		"fueltype" : car.fueltype
	};

	if (car.testCase == 1) {
		rO.ACK = false;
		rO.DETAIL = car.undefinedError;
		rO.data = {};
	}

	_callback.apply(this, [ rO ]);
};

// ==============================================================================================
// : getJourneyComputerData 4.13 <<< GET >>>
// ==============================================================================================
EFIPluginSimulator.prototype.getJourneyComputerData = function(_callback) {

	var rO = new returnObject();
	rO.ACK = true;
	rO.DETAIL = "";
	rO.data = {
		"departure" : car.departure,
		"duration" : car.duration,
		"journeyDistance" : car.journeyDistance,
		"avgSpeed" : car.avgSpeed,
		"avgConsumption" : car.avgConsumption
	};

	if (car.testCase == 1) {
		rO.ACK = false;
		rO.DETAIL = car.undefinedError;
		rO.data = {};
	}

	_callback.apply(this, [ rO ]);
};

// ==============================================================================================
// : getKilometerStatus 4.14 <<< GET >>>
// ==============================================================================================
EFIPluginSimulator.prototype.getKilometerStatus = function(_callback) {

	var rO = new returnObject();
	rO.ACK = true;
	rO.DETAIL = "";
	rO.data = {
		"totalDistance" : car.totalDistance,
		"unit" : car.unit
	};

	if (car.testCase == 1) {
		rO.ACK = false;
		rO.DETAIL = car.undefinedError;
		rO.data = {};
	}

	_callback.apply(this, [ rO ]);
};

// ==============================================================================================
// : getPhoneStatus 4.15 <<< GET >>>
// ==============================================================================================
EFIPluginSimulator.prototype.getPhoneStatus = function(_callback) {

	var rO = new returnObject();
	rO.ACK = true;
	rO.DETAIL = "";
	rO.data = {
		"phone" : car.phone,
		"BTname" : car.BTname
	};

	if (car.testCase == 1) {
		rO.ACK = false;
		rO.DETAIL = car.undefinedError;
		rO.data = {};
	}

	_callback.apply(this, [ rO ]);
};

// ==============================================================================================
// : getPosAdr 4.16 <<< GET >>>
// ==============================================================================================
EFIPluginSimulator.prototype.getPosAdr = function(_callback) {

	var rO = new returnObject();
	rO.ACK = true;
	rO.DETAIL = "";
	rO.data = {
		"country" : car.country,
		"town" : car.town,
		"street" : car.street,
		"number" : car.number,
		"crossing" : car.crossing
	};

	if (car.testCase == 1) {
		rO.ACK = false;
		rO.DETAIL = car.undefinedError;
		rO.data = {};
	}

	_callback.apply(this, [ rO ]);
};

// ==============================================================================================
// : getPosWGS84 4.17 <<< GET >>>
// ==============================================================================================
EFIPluginSimulator.prototype.getPosWGS84 = function(_callback) {

	var rO = new returnObject();
	rO.ACK = true;
	rO.DETAIL = "";
	rO.data = {
		"posLat" : car.posLat(),
		"posLong" : car.posLong()
	};

	if (car.testCase == 1) {
		rO.ACK = false;
		rO.DETAIL = car.undefinedError;
		rO.data = {};
	}
	if (car.testCase == 2) {
		// 102_NO_GPS
		rO.ACK = false;
		rO.DETAIL = EFIerrors.NO_GPS;
		rO.data = {};
	}

	_callback.apply(this, [ rO ]);
};

// ==============================================================================================
// : getRadioStation 4.18 <<< GET >>>
// ==============================================================================================
EFIPluginSimulator.prototype.getRadioStation = function(_callback) {

	var rO = new returnObject();
	rO.ACK = true;
	rO.DETAIL = "";
	rO.data = {
		"band" : car.band,
		"frequency" : car.frequency,
		"stationName" : car.stationName,
		"radioTextPlus" : car.radioTextPlus
	};

	if (car.testCase == 1) {
		rO.ACK = false;
		rO.DETAIL = car.undefinedError;
		rO.data = {};
	}

	_callback.apply(this, [ rO ]);
};

// ==============================================================================================
// : getTVStation 4.19 <<< GET >>>
// ==============================================================================================
EFIPluginSimulator.prototype.getTVStation = function(_callback) {

	var rO = new returnObject();
	rO.ACK = true;
	rO.DETAIL = "";
	rO.data = {
		"TVstation" : car.TVstation
	};

	if (car.testCase == 1) {
		rO.ACK = false;
		rO.DETAIL = car.undefinedError;
		rO.data = {};
	}
	if (car.testCase == 2) {
		// 103_NO_TV
		rO.ACK = false;
		rO.DETAIL = EFIerrors.NO_TV;
		rO.data = {};
	}

	_callback.apply(this, [ rO ]);
};

// ==============================================================================================
// : getUserAgent 4.20 <<< GET >>>
// ==============================================================================================
EFIPluginSimulator.prototype.getUserAgent = function(_callback) {

	var rO = new returnObject();
	rO.ACK = true;
	rO.DETAIL = "";
	rO.data = {
		"useragent" : car.useragent
	};

	if (car.testCase == 1) {
		rO.ACK = false;
		rO.DETAIL = car.undefinedError;
		rO.data = {};
	}

	_callback.apply(this, [ rO ]);
};

// ==============================================================================================
// : getVersion 4.21 <<< GET >>>
// ==============================================================================================
EFIPluginSimulator.prototype.getVersion = function(_callback) {

	var rO = new returnObject();
	rO.ACK = true;
	rO.DETAIL = "";
	rO.data = {
		"version" : car.version
	};

	if (car.testCase == 1) {
		rO.ACK = false;
		rO.DETAIL = car.undefinedError;
		rO.data = {};
	}

	// 743_NO_BROWSER_CORE - TODO

	_callback.apply(this, [ rO ]);
};

// ==============================================================================================
// : goHome 4.22
// ==============================================================================================
EFIPluginSimulator.prototype.goHome = function(_callback) {

	var rO = new returnObject();
	rO.ACK = true;
	rO.DETAIL = "";
	rO.data = {
	// This function will never return.
	};

	if (car.testCase == 1) {
		rO.ACK = false;
		rO.DETAIL = car.undefinedError;
		rO.data = {};
	}

	_callback.apply(this, [ rO ]); // TODO
};

// ==============================================================================================
// : makeVoiceCall 4.23
// ==============================================================================================
EFIPluginSimulator.prototype.makeVoiceCall = function(_callback) {

	var rO = new returnObject();
	rO.ACK = true;
	rO.DETAIL = "";
	rO.data = {
		"phoneNumber" : car.phoneNumber,
		"answer" : car.answer,
		"duration" : car.duration
	};

	if (car.testCase == 1) {
		rO.ACK = false;
		rO.DETAIL = car.undefinedError;
		rO.data = {};
	}
	if (car.testCase == 2) {
		// 104_NO_PHONE
		rO.ACK = false;
		rO.DETAIL = EFIerrors.NO_PHONE;
		rO.data = {};
	}

	_callback.apply(this, [ rO ]);
};

// ==============================================================================================
// : 4.24 NAVIS –to be clarified
// ==============================================================================================
// TODO
// 100_NO_NAVIGATION

// ==============================================================================================
// : 4.25 PIA –to be clarified
// ==============================================================================================
// TODO

// ==============================================================================================
// : Restart 4.26
// DEPRECATED
// Never Returns
// TODO
// ==============================================================================================
EFIPluginSimulator.prototype.Restart = function(_callback) {

	var rO = new returnObject();
	rO.ACK = true;
	rO.DETAIL = "";
	rO.data = {
	// This function will never return.
	};

	if (car.testCase == 1) {
		rO.ACK = false;
		rO.DETAIL = car.undefinedError;
		rO.data = {};
	}

	_callback.apply(this, [ rO ]); // TODO
};

// ==============================================================================================
// : sendToAddress 4.27
// TBD
// TODO
// ==============================================================================================
EFIPluginSimulator.prototype.sendToAddress = function(_callback) {

	var rO = new returnObject();
	rO.ACK = true;
	rO.DETAIL = "";
	rO.data = {

	};

	if (car.testCase == 1) {
		rO.ACK = false;
		rO.DETAIL = car.undefinedError;
		rO.data = {};
	}

	_callback.apply(this, [ rO ]);
};

// ==============================================================================================
// : setHome 4.28 >>> SET <<<
// ==============================================================================================
EFIPluginSimulator.prototype.setHome = function(_callback, _homeURL) {

	car.homeURL = _homeURL;

	var rO = new returnObject();
	rO.ACK = true;
	rO.DETAIL = "";
	rO.data = {
		"homeURL" : car.homeURL
	};

	if (car.testCase == 1) {
		rO.ACK = false;
		rO.DETAIL = car.undefinedError;
		rO.data = {};
	}
	if (car.testCase == 2) {
		// 105_NO_BMW_INTERNET
		rO.ACK = false;
		rO.DETAIL = EFIerrors.NO_BMW_INTERNET;
		rO.data = {};
	}

	_callback.apply(this, [ rO ]);
};

// ==============================================================================================
// : setVINRN 4.29 >>> SET <<<
// ==============================================================================================
EFIPluginSimulator.prototype.setVINRN = function(_callback, _VINRN) {

	car.VINRN = _VINRN;

	var rO = new returnObject();
	rO.ACK = true;
	rO.DETAIL = "";
	rO.data = {
		"VINRN" : car.VINRN
	};

	if (car.testCase == 1) {
		rO.ACK = false;
		rO.DETAIL = car.undefinedError;
		rO.data = {};
	}

	_callback.apply(this, [ rO ]);
};

// ==============================================================================================
// : startBIN 4.30
// ==============================================================================================
EFIPluginSimulator.prototype.startBIN = function(_callback, _URL) {

	var rO = new returnObject();
	rO.ACK = true;
	rO.DETAIL = "";
	rO.data = {
		"URL" : car.URL
	};

	if (car.testCase == 1) {
		rO.ACK = false;
		rO.DETAIL = car.undefinedError;
		rO.data = {};
	}
	if (car.testCase == 2) {
		// 105_NO_BMW_INTERNET
		rO.ACK = false;
		rO.DETAIL = EFIerrors.NO_BMW_INTERNET;
		rO.data = {};
	}

	_callback.apply(this, [ rO ]);
};

// ==============================================================================================
// : getHandBrakeLightStatus 4.31 <<< GET >>>
// ==============================================================================================
EFIPluginSimulator.prototype.getHandBrakeLightStatus = function() {
	return car.light_status;
};
// ==============================================================================================
// : doUSSOauth
// ==============================================================================================
EFIPluginSimulator.prototype.doUSSOauth = function(_callback, _authLevelL) {
	tempLoginCallback = _callback;

	var loginPanel = $('#TESTLogin');

	if (!loginPanel.length) {
		p = '<div id="TESTLogin" class="panel">';
		p += '  <div class="header">';
		p += '    <div class="title">TEST - Login</div>';
		p += '    <div class="clear"></div>';
		p += '  </div>';
		p += '  <div class="contentContainer">';
		p += '    <form id="TESTLogin_Formular" onsubmit="return false;">';
		p += '      <input type="hidden" name="target" value=""></input>';
		p += '      <ul class="content">';
		p += '        <li class="input"><div><input name="username" type="text" placeholder="Username"></input></div></li>';
		p += '        <li class="input"><div><input name="password" type="password" placeholder="Password"></input></div></li>';
		p += '        <li class="link" onclick="TESTSubmitLogin($(\'#PanelInputElements_Formular\'));"><div>Submit</div></li>';
		p += '      </ul>';
		p += '    </form>';
		p += '  </div>';
		p += '</div>';

		PM.holder.append(p);
		loginPanel = $('#TESTLogin');
	}
	PM.show('TESTLogin');
};

var TESTSubmitLogin = function(formular) {
	var password = $('input[name="password"]').val();
	var username = $('input[name="username"]').val();
	password = mask(password);
	$.ajax({
		url : TestConfig.LoginURL + '?u=' + username + '&p=' + password + '&a=1',
		type : 'GET',
		completed : function(e) {
			LOG.info(e);
		},
		error : function(e) {
			LOG.error('Login failed');
		},
		success : function(e) {
			LOG.info('Login successful');

			var rO = new returnObject();
			rO.ACK = true;
			tempLoginCallback.apply(this, [ rO ]);
		}
	});
};

var hexKeyInDecimal = Number('0xB9');
var Convert = {
	chars : " !\"#$%&amp;'()*+'-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~",
	hex : '0123456789ABCDEF',
	bin : [ '0000', '0001', '0010', '0011', '0100', '0101', '0110', '0111', '1000', '1001', '1010', '1011', '1100',
			'1101', '1110', '1111' ],
	decToHex : function(d) {
		return (this.hex.charAt((d - d % 16) / 16) + this.hex.charAt(d % 16));
	},
	toBin : function(ch) {
		var d = this.toDec(ch);
		var l = this.hex.charAt(d % 16);
		var h = this.hex.charAt((d - d % 16) / 16);
		var hhex = "ABCDEF";
		var lown = l < 10 ? l : (10 + hhex.indexOf(l));
		var highn = h < 10 ? h : (10 + hhex.indexOf(h));
		// return this.bin[highn] + ' ' + this.bin[lown];
		return this.bin[highn] + this.bin[lown];
	},
	toHex : function(ch) {
		return this.decToHex(this.toDec(ch));
	},
	toDec : function(ch) {
		var p = this.chars.indexOf(ch);
		return (p <= -1) ? 0 : (p + 32);
	}
};
function mask(newPw) {
	var xor_key = hexKeyInDecimal;
	var newHexPw = ""; // the result will be here
	for ( var i = 0; i < newPw.length; ++i) {
		newHexPw += Convert.decToHex((xor_key ^ newPw.charCodeAt(i)));
	}
	return newHexPw;
}

// ==============================================================================================
// : naviTripImport
// ==============================================================================================

EFIPluginSimulator.prototype.naviTripImport = function(_callback, _file, _descr, _fileSize) {
	var rO = new returnObject();
	rO.ACK = true;
	rO.DETAIL = "";
	rO.data = {};

	_callback.apply(this, [ rO ]);
};

// ==============================================================================================
// : piaExport
// ==============================================================================================

EFIPluginSimulator.prototype.piaExport = function(_callback, _PIAIDListStream, _PIAIDListFlag, _uploadProfileURL) {
	var rO = new returnObject();
	rO.ACK = true;
	rO.DETAIL = "";
	rO.data = {};

	_callback.apply(this, [ rO ]);
};

// ==============================================================================================
// : piaImport
// ==============================================================================================

EFIPluginSimulator.prototype.piaImport = function(_callback, _downloadProfileURL) {
	var rO = new returnObject();
	rO.ACK = true;
	rO.DETAIL = "";
	rO.data = {};

	_callback.apply(this, [ rO ]);
};

// ==============================================================================================
// : exitBrowser
// ==============================================================================================
EFIPluginSimulator.prototype.exitBrowser = function(obj) {
	window.open('', '_self', '');
	window.close();
};

// ==============================================================================================
// : trace-functions
// ==============================================================================================
EFIPluginSimulator.prototype.traceMessage = function(msg) {
	if (typeof console != "undefined" && typeof msg != 'object') {
		try {
			console.log(msg);
		} catch (e) {
		}
	}
};

EFIPluginSimulator.prototype.traceWarning = function(msg) {
	if (typeof console != "undefined" && typeof msg != 'object') {
		try {
			console.warn(msg);
		} catch (e) {
		}
	}
};

EFIPluginSimulator.prototype.traceError = function(msg) {
	if (typeof console != "undefined" && typeof msg != 'object') {
		try {
			console.error(msg);
		} catch (e) {
		}
	}
};

EFIPluginSimulator.prototype.traceFatalError = function(msg) {
	if (typeof console != "undefined" && typeof msg != 'object') {
		try {
			console.error(msg);
		} catch (e) {
		}
	}
};

// ==============================================================================================
// : getShowTimeDate-functions
// ==============================================================================================
EFIPluginSimulator.prototype.getShowTimeDate = function() {
	var res = new Object();
	var now = new Date();
	if (hasError) {
		res.showHour = '13';
		res.showMinute = '253';
	} else {
		res.showHour = now.getHours();
		res.showMinute = now.getMinutes();
	}
	res.showSecond = now.getSeconds();
	res.showDay = now.getDate();
	res.showMonth = now.getMonth();
	res.showYear = now.getFullYear();
	res.showWeekDay = now.getDay();
	res.statusDisplayTimeDate = 0;
	return res;
};

// ##############################################################################################
// end of EFI-FUNCTIONS
// ##############################################################################################

// ##############################################################################################
// TTS Simulator
// ##############################################################################################
var TTSSimulator = {
	showText : function(header, text) {
		window.alert(header + '\n\n' + text);
	}
};

window.addEventListener('load', function(e) {
	var callByIndex = /index-(\w{2})-(\w{2})/.exec(window.location.pathname);
	var simPosition = $('#SimulatorPosition'), simDestination = $('#SimulatorDestination');
	if (simPosition.length && callByIndex) {
		var homeMarket = callByIndex.pop();
		var pos = simPosition.find('option#' + homeMarket).val();
		simPosition.val(pos);
		car.setPosition(pos);
		simDestination.val(pos);
		car.setDestination(pos);
	}
}, false);
