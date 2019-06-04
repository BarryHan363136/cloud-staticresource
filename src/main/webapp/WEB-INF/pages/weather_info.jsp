<%@page session="false" import="java.io.PrintWriter"%>
<%@page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@taglib uri='http://java.sun.com/jsp/jstl/core' prefix='c'%>
<%@ page isELIgnored="false" %>
<%
	out.write("<response market=\"CN\" locale=\"zh_CN\" status=\"200\"><![CDATA[");
%>

<div id="weather" class="detailPanel updateByGeocoder">
	<ul class="toolbar">
		<li onclick="showPrev();" title="${translationMap.BackTitle }" id="go_prev_link" class="inactive cdp_inactive">
			<div class="icon previous"></div>
		</li>
		<li onclick="showNext();" title="${translationMap.NextTitle }" id="go_next_link">
			<div class="icon next"></div>
		</li>
		<li onclick="Geocoder.showGeocoder();" class="selectPlace"
			title="${translationMap.LocationSelection.Title }">
			<div class="icon location_current"></div>
		</li>
	</ul>

	<div class="content">
		<div class="header">
			<div class="icon">
				<img src='<c:out value="${ctx}" />/static/img/logo.png'>
			</div>
			<div class="title">${city }</div>
			<div class="clear"></div>
		</div>

		<c:forEach items="${ weatherForcastList}" var="item" varStatus="status">
			<c:choose>
				<c:when test="${ status.count ==1}">
				<div id="forecast_${status.count }" style="display: block;">
					<div class="text ttsheader">${item.date }</div>
					<div id="weatherDetails">
						<table id="weatherData">
							<tbody>
								<tr>
									<td></td>
									<td id="day"><div class="imageHeader">${translationMap.DayTitle }</div></td>
									<td id="night"><div class="imageHeader">${translationMap.NightTitle }</div></td>
								</tr>
								<tr>
									<td></td>
									<td id="day"><div style="text-align:center"><img src='<c:out value="${ctx}" />/static/img/weather_image/day_${item.dayWeather}.png'></div></td>
									<td id="night"><div style="text-align:center"><img src='<c:out value="${ctx}" />/static/img/weather_image/night_${item.nightWeather}.png'></div></td>
								</tr>
								<tr>
									<td><div class="icon footer temperature"></div></td>
									<td id="night"><div class="imageFooter">${item.dayTemperature}</div></td>
									<td id="night"><div class="imageFooter">${item.nightTemperature}</div></td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="tts">
					<c:if test="${not empty washcarIndex}">
    					<div>${translationMap.WashingIndexTitle }：${washcarIndex }</div>
					</c:if>
					<c:if test="${not empty clothIndex}">
    					<div>${translationMap.DressingIndexTitle }：${clothIndex }</div>
					</c:if>
					<c:if test="${not empty comfortIndex}">
    					<div>${translationMap.ComfortIndexTitle }：${comfortIndex }</div>
					</c:if>
					<c:if test="${not empty travelIndex}">
    					<div>${translationMap.TourismIndexTitle }：${travelIndex }</div>
					</c:if>
					</div>
				</div>
				</c:when>
				<c:otherwise>
				<div id="forecast_${status.count }" style="display: none;">
					<div class="text ttsheader">${item.date }</div>
					<div id="weatherDetails">
						<table id="weatherData">
							<tbody>
								<tr>
									<td></td>
									<td id="day"><div class="imageHeader">${translationMap.DayTitle }</div></td>
									<td id="night"><div class="imageHeader">${translationMap.NightTitle }</div></td>
								</tr>
								<tr>
									<td></td>
									<td id="day"><div style="text-align:center"><img src='<c:out value="${ctx}" />/static/img/weather_image/day_${item.dayWeather}.png'></div></td>
									<td id="night"><div style="text-align:center"><img src='<c:out value="${ctx}" />/static/img/weather_image/night_${item.nightWeather}.png'></div></td>
								</tr>
								<tr>
									<td><div class="icon footer temperature"></div></td>
									<td id="night"><div class="imageFooter">${item.dayTemperature}</div></td>
									<td id="night"><div class="imageFooter">${item.nightTemperature}</div></td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
				</c:otherwise>
			</c:choose>
		</c:forEach>
	</div>
</div>

<%
	out.write("]]></response>");
%>