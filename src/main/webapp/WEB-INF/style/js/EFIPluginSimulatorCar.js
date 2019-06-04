// Data of a car used for the EFIPluginSimulator

// [!] required in EFIPluginSimulator.js

var car = {
	// < Test config>
	"testCase" : 0, // (0 = normal case, 1 = unknown Error, 2 = error1
	// (if defined), 3 = error2 (if defined))
	"undefinedError" : "999_undefined", // displayed Message when ACK ==
	// false && DETAIL == ""
	// </ Test config>

	// 4.1
	"tsType" : 4711, // number
	// 4.2
	"destLat" : function() {
		try {
			var pos = localStorage.getItem('SimulatorDestination').split(',');
			return pos[0];
		} catch (e) {
			return 626561760;
		}
	}, // number
	"destLong" : function() {
		try {
			var pos = localStorage.getItem('SimulatorDestination').split(',');
			return pos[1];
		} catch (e) {
			return 159833987;
		}
	}, // number
	"destDescr" : "#destDescr", // text
	// 4.3
	"arrTime" : "900", // time
	// 4.4
	"source" : "FM", // text = (FM, CD, DVB,…)
	// 4.5
	"settings" : "#settings", // text
	// 4.6
	"status" : false, // number = (false = stays; true = moving)
	// 4.7
	"codriver" : "1", // number = (2 = none; 1 = at least one)
	// 4.8
	"range" : 1000, // number
	"unit" : 1, // number = (1 = Kilometers; 2 = Miles) -DEPRECATED-
	// 4.9
	// (4.1)"destLong" : "", // number
	// (4.1)"destLat" : "", // number
	// (4.1)"destDescr" : "", // text
	// 4.10
	"destDistance" : 999, // number
	// (4.8)"unit" : "1", // number = (1 = Kilometers; 2 = Miles)
	// -DEPRECATED-
	// 4.11
	"driveDirection" : "E", // text = (N, NE, E,…)
	"posLat" : function() {
		try {
			var pos = localStorage.getItem('SimulatorPosition').split(',');
			return pos[0];
		} catch (e) {
			return 574950353;
		}
	}, // number
	"posLong" : function() {
		try {
			var pos = localStorage.getItem('SimulatorPosition').split(',');
			return pos[1];
		} catch (e) {
			return 138018400;
		}
	}, // number
	"driveAngle" : 90, // number
	// 4.12
	"fueltype" : 2, // number = (1 = Petrol, 2 = Diesel)
	// 4.13
	"departure" : new time(9, 8, 7), // time
	"duration" : new time(6, 5, 4), // time
	"journeyDistance" : 500.5, // number
	"avgSpeed" : 80, // number
	"avgConsumption" : 10.5, // number
	// 4.14
	"totalDistance" : 99000.81, // number
	// (4.8)"unit" : "", // number = (1 = Kilometers; 2 = Miles)
	// -DEPRECATED-
	// 4.15
	"phone" : "#phone", // text
	"BTname" : "#BTname", // text
	// 4.16
	"country" : "#country", // text
	"town" : "#town", // text
	"street" : "#street", // text
	"number" : "#number", // text
	"crossing" : "#crossing", // text
	// 4.17
	// (4.11)"posLat" : "#posLat", // number
	// (4.11)"posLong" : "#posLong", // number
	// 4.18
	"band" : "#band", // text
	"frequency" : 98.2, // number
	"stationName" : "#stationName", // text
	"radioTextPlus" : new radioTextPlus("#radioTextPlus"), // object
	// 4.19
	"TVstation" : "#TVstation", // text
	// 4.20
	"useragent" : "#useragent", // text
	// 4.21
	"version" : "#version", // text

	// 4.22 NEVER RETURNS

	// 4.23
	"phoneNumber" : "#phonenumber", // text
	"answer" : 100010001, // number
	// (4.13)"duration" : "", // (!= duration 4.13 name conflict) time

	// 4.24 TBD

	// 4.25 TBD

	// 4.26 NEVER RETURNS

	// 4.27 TBD

	// 4.28
	"homeURL" : "#homeURL", // text
	// 4.29
	"VINRN" : "#VINRN", // text
	// 4.30
	"URL" : "#URL", // text
	// 4.31
	"light_status" : true, // number = (false = hand brake not set; true = hand brake is set)

	// 4.32 TBD

	// 4.33 TBD

	//
	"speed" : 0, // number
	//
	"gear" : 3, // number

	"clutch" : 0, // number

	setPosition : function(lat, lon) {
		localStorage.setItem('SimulatorPosition', this.getCoordinateString(lat, lon));
		try {
			OSM.setPosMarker(Geocoder.convertWGS84ToDegree(car.posLat()), Geocoder.convertWGS84ToDegree(car.posLong()));
		} catch (e) {
			// nothing do
		}
	},
	setDestination : function(lat, lon) {
		localStorage.setItem('SimulatorDestination', this.getCoordinateString(lat, lon));
		try {
			OSM.setDestMarker(Geocoder.convertWGS84ToDegree(car.destLat()), Geocoder.convertWGS84ToDegree(car
					.destLong()));
		} catch (e) {
			// nothing do
		}
	},
	getCoordinateString : function(lat, lon) {
		if (lon == undefined) {
			// only one parameter, so it must be something like '575000677,186401581'
			var temp = lat.split(',');
			lat = temp[0];
			lon = temp[1];
		}

		if (lat >= -90 && lat <= 90) {
			lat = Geocoder.convertDegreeToWGS84(lat);
		}
		if (lon >= -180 && lon <= 180) {
			lon = Geocoder.convertDegreeToWGS84(lon);
		}
		return lat + ',' + lon;
	},
	/**
	 * This will be used of the converter of the CarSimulatorConsole in the right site of the page. The
	 * CarSimulatorConsole is only visible if no real user-agent was set.
	 */
	convertCoordinate : function() {
		try {
			var value = $('#carSimulatorCoordinate').val();
			console.log(value);
			var coordinates = value.split(',');
			console.log(coordinates.length);
			if (coordinates.length == 1) {
				value = this.convertCoodinateValue(coordinates[0]);

			} else if (coordinates.length == 2) {
				value = this.convertCoodinateValue(coordinates[0]) + ',' + this.convertCoodinateValue(coordinates[1]);
			}
			$('#carSimulatorCoordinate').val(value);
		} catch (e) {
		}
	},

	convertCoodinateValue : function(value) {
		if (value >= -180 && value <= 180) {
			value = Geocoder.convertDegreeToWGS84(value);
		} else {
			value = Geocoder.convertWGS84ToDegree(value);
		}
		return value;
	},
	/**
	 * The inputed Coordinates in the CarSimulatorConsole will be used for the current position (car.setPosition)
	 */
	setCoordinatesFromInput : function() {
		car.setPosition($('#carSimulatorCoordinate').val());
	}

};