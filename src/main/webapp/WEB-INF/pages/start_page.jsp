<%@ page session="false" language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ page isELIgnored="false" %>
<html>
<head>
<META http-equiv="Content-Type" content="text/html; charset=UTF-8">

<c:choose>
	<c:when test="${ hostName == tstLocal}">
		<link rel="stylesheet" type="text/css" href="<c:out value="${ctx}" />/style/css/default_bon.css">
		<link rel="stylesheet" type="text/css" href="<c:out value="${ctx}" />/style/css/simulator.css">
		<link rel="stylesheet" type="text/css" href="<c:out value="${ctx}" />/style/css/nbt.css">
	</c:when>
	<c:when test="${ hostName == tstEnv || hostName == intEnv}">
		<c:if test="${ nbtdefault == 'nbtdefault' }">
			<link rel="stylesheet" type="text/css" href="<c:out value="${ctx}" />/style/css/default_bon.css">
			<link rel="stylesheet" type="text/css" href="<c:out value="${ctx}" />/style/css/simulator.css">
		</c:if>
		<link rel="stylesheet" type="text/css" href="<c:out value="${ctx}" />/style/css/nbt.css">
	</c:when>
	<c:otherwise>
		<c:if test="${ nbtdefault == 'nbtdefault' }">
			<link rel="stylesheet" type="text/css" href="<c:out value="${ctx}" />/style/css/default_bon.css">
			<link rel="stylesheet" type="text/css" href="<c:out value="${ctx}" />/style/css/simulator.css">
		</c:if>
		<link rel="stylesheet" type="text/css" href="<c:out value="${ctx}" />/style/css/nbt.css" >
	</c:otherwise>
</c:choose>

<style type="text/css">
div#weatherDetails {
	float: left;
	text-align: center;
}

div#weatherDetails table {
	border-spacing: 0;
	width: 100%;
}

.imageHeader, .imageFooter {
	font-size: 25px;
	line-height: 30px;
	text-align: center;
}

.windspeedtext {
	text-align: left;
}

div.icon.footer {
	margin-right: -50px;
}

.icon.footer.temperature {
	background-image: url('<c:out value="${ctx}" />/style/img/icon_temperature.png');
}

.icon.footer.wind {
	background-image: url('<c:out value="${ctx}" />/style/img/icon_wind.png');
}

.icon.footer.rainprobability {
	background-image: url('<c:out value="${ctx}" />/style/img/icon_rainprobability.png');
}

div#PanelHolder div.visible p {
	line-height: 40px;
	padding: 15px 0;
}

div.winddirection {
	background: url('<c:out value="${ctx}" />/style/img/icon_arrow.png') no-repeat;
	background-size: 30px 30px;
	height: 30px;
	width: 30px;
}

div.weather {
	height: 106px;
	width: 152px;
	margin: auto;
	background-image: url('<c:out value="${ctx}" />/style/img/weathersprite.png'),
		url('<c:out value="${ctx}" />/style/img/weathersprite.png');
}

.winddirection.north {
	-webkit-transform: rotate(180deg);
	-moz-transform: rotate(180deg);
}

.winddirection.northeast {
	-webkit-transform: rotate(225deg);
	-moz-transform: rotate(225deg);
}

.winddirection.east {
	-webkit-transform: rotate(270deg);
	-moz-transform: rotate(270deg);
}

.winddirection.southeast {
	-webkit-transform: rotate(315deg);
	-moz-transform: rotate(315deg);
}

.winddirection.south {
	-webkit-transform: rotate(0deg);
	-moz-transform: rotate(0deg);
}

.winddirection.southwest {
	-webkit-transform: rotate(45deg);
	-moz-transform: rotate(45deg);
}

.winddirection.west {
	-webkit-transform: rotate(90deg);
	-moz-transform: rotate(90deg);
}

.winddirection.northwest {
	-webkit-transform: rotate(135deg);
	-moz-transform: rotate(135deg);
}


 /* ----------------------------------------------- */
/* Stylesheet for big screens (1024px)             */
/* ----------------------------------------------- */
body.screen1024 div#weatherDetails {
	padding: 20px 0;
	width: 940px;
} /* ----------------------------------------------- */
/* Stylesheet for small screens (544px)            */
/* ----------------------------------------------- */
body.screen544 div#weatherDetails {
	width: 470px;
	margin-left: -20px;
	margin-bottom: 15px;
}

body.screen544 .imageHeader, body.screen544 .imageFooter {
	font-size: 23px;
}

body.screen544 div.icon.footer {
	margin-right: -42px;
}

body.screen544 .windInfo {
	visibility: hidden;
}

body.screen544 .windspeedtext {
	text-align: center;
	width: 50px;
}
</style>

</head>

<body>
	<div id="Main">
		<div id="PanelHolder"></div>
		<div id="GenericTemp" class="panel nohistory"></div>
		<div id="GenericPanelProgress" class="panel nohistory"></div>
	</div>

	<c:if test="${nbtdefault == 'nbtdefault'}">
		<div id="carSimulatorConsole">
			<b>Car SImulator</b><br /> <a href="javascript:"
				onclick="testChangeStyle(1024);">switch UI to 10"</a><br /> <a
				href="javascript:" onclick="testChangeStyle(544);">switch UI to
				7"</a>

			<div style="margin-top: 30px; font-weight: bold; margin-bottom: 5px;">Geocoding</div>
			<div>
				<input id="carSimulatorCoordinate"> <b
					onclick="car.setCoordinatesFromInput()"
					style="float: left; padding: 1px 20px; margin-top: 10px; margin-left: 10px; background-color: #5f5f5f"
					title="Set the coordinates you type above">Set</b> <b
					onclick="car.convertCoordinate()"
					style="float: right; padding: 1px 10px; margin-top: 10px; margin-right: 20px; background-color: #5f5f5f">Convert</b>
				<div class="clear"></div>
			</div>
		</div>
	</c:if>

	<object id="bevPlugin" type="application/x-bmw-bevplugin"
		style="height: 0px; position: absolute; top: 0px;"></object>
	<object id="HMIPlugin" type="application/x-bmw-hmiplugin"
		style="height: 0px; position: absolute; top: 0px;"></object>
	<object id="harmanEfiplugin" type="application/harman-efi-plugin"
		style="height: 0px; position: absolute; top: 0px;"></object>
	<object id="idrivePlugin" name="idrivecontrol"
		type="application/x-bmw-idrivecontrol"
		style="height: 0px; position: absolute; top: 0px;">
		<param name="ROTATE_LEFT" value="38">
		<param name="ROTATE_RIGHT" value="40">
		<param name="PUSH" value="13">
		<param name="SHIFT_LEFT" value="37">
	</object>

	<input type="hidden" id="tstLocal" value="${tstLocal }" />
	<input type="hidden" id="tstEnv" value="${tstEnv }" />
	<input type="hidden" id="intEnv" value="${intEnv }" />
	<input type="hidden" id="prodEnv" value="${prodEnv }" />
	<input type="hidden" id="hostName" value="${hostName }" />
	<input type="hidden" id="nbtdefault" value="${nbtdefault }" />

	<c:choose>
		<c:when test="${ hostName == tstLocal}">
			<script type="text/javascript" src='<c:out value="${ctx}" />/style/js/jquery.min.js'></script>
			<script type="text/javascript" src='<c:out value="${ctx}" />/style/js/nbt.js'></script>
			<script type="text/javascript" src='<c:out value="${ctx}" />/style/js/EFIPluginSimulator.js'></script>
			<script type="text/javascript" src='<c:out value="${ctx}" />/style/js/EFIPluginSimulatorCar.js'></script>
			<script type="text/javascript" src='<c:out value="${ctx}" />/style/js/panelHelper.js'></script>
			<script type="text/javascript" src='<c:out value="${ctx}" />/style/js/app.js'></script>
		</c:when>
		<c:when test="${ hostName == tstEnv || hostName == intEnv}">
			<script type="text/javascript" src='<c:out value="${ctx}" />/style/js/jquery.min.js'></script>
			<script type="text/javascript" src='<c:out value="${ctx}" />/style/js/nbt.js'></script>
			<script type="text/javascript" src='<c:out value="${ctx}" />/style/js/app.js'></script>
			<c:if test="${ nbtdefault == 'nbtdefault' }">
				<script type="text/javascript" src='<c:out value="${ctx}" />/style/js/EFIPluginSimulator.js'></script>
				<script type="text/javascript" src='<c:out value="${ctx}" />/style/js/EFIPluginSimulatorCar.js'></script>
			</c:if>
			<script>
				var startPanelOptions = {
						geocoder : Geocoder.locationType(),
				};
				Config.startPanelOptions = startPanelOptions;
				Config.startPanelUrl = '<c:out value="${ctx}" />/rest/v1/weatherInfo';
				Config.browserCacheUrl = '../cdpnbt3/vehicle/nbt/servlet/browserCache'
				// Config.geocoderUrl = '../cdpnbt3/vehicle/nbt/servlet/geocoder';
				// Config.i18nURL = '../cdpnbt3/vehicle/nbt/servlet/commoni18n';
			</script>
		</c:when>
		<c:otherwise>
			<script type="text/javascript" src='<c:out value="${ctx}" />/style/js/jquery.min.js'></script>
			<script type="text/javascript" src='<c:out value="${ctx}" />/style/js/nbt.js'></script>
			<script type="text/javascript" src='<c:out value="${ctx}" />/style/js/app.js'></script>
			<c:if test="${ nbtdefault == 'nbtdefault' }">
				<script type="text/javascript" src='<c:out value="${ctx}" />/style/js/EFIPluginSimulator.js'></script>
				<script type="text/javascript" src='<c:out value="${ctx}" />/style/js/EFIPluginSimulatorCar.js'></script>
			</c:if>
			<script>
				var startPanelOptions = {
						geocoder : Geocoder.locationType(),
				};
				Config.startPanelOptions = startPanelOptions;
				Config.startPanelUrl = '<c:out value="${ctx}" />/rest/v1/weatherInfo';
				Config.browserCacheUrl = '../cdpnbt3/vehicle/nbt/servlet/browserCache'
				// Config.geocoderUrl = '../cdpnbt3/vehicle/nbt/servlet/geocoder';
				// Config.i18nURL = '../cdpnbt3/vehicle/nbt/servlet/commoni18n';
			</script>
		</c:otherwise>
	</c:choose>
</body>
</html>

