<%@page session="false" import="java.io.PrintWriter"%>
<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@ taglib uri='http://java.sun.com/jsp/jstl/core' prefix='c'%>
<%@ page isELIgnored="false" %>
<%
	out.write("<response market=\"CN\" locale=\"zh_CN\" status=\"200\"><![CDATA[");
%>

<div id="weather" class="panel nohistory updateByGeocoder">
	<div class="header">
		<div class="icon">
			<img src='<c:out value="${ctx}" />/static/img/logo.png'>
		</div>
		<div class="title">${city }</div>
		<div class="clear"></div>
	</div>
	<div class="contentContainer">
		<ul class="content">
			<li class="text bottom">
				<div>${date }</div>
			</li>
			<li class="text">
				<div>${translationMap.NoDataText }</div>
			</li>
			<li class="link selectPlace update" onclick="Geocoder.showGeocoder();" onfocus="Geocoder.focusSelectPlace(this)" onBlur="Geocoder.blurSelectPlace(this)">
				<div>
					<div class="icon location_current"></div>
					<div>${city }</div>
				</div>
			</li>
		</ul>
	</div>
</div>

<%
	out.write("]]></response>");
%>