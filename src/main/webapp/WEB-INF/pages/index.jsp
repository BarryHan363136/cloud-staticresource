<%@ page session="false" language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ page isELIgnored="false" %>
<html>
<head>
<META http-equiv="Content-Type" content="text/html; charset=UTF-8">
<link rel="stylesheet" type="text/css" href="<c:out value="${ctx}" />/style/css/aaa.css">
<link rel="stylesheet" type="text/css" href="<c:out value="${ctx}" />/style/css/bbb.css">
<link rel="stylesheet" type="text/css" href="<c:out value="${ctx}" />/style/css/ccc.css">
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

