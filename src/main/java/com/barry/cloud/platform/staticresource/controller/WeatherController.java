package com.barry.cloud.platform.staticresource.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@Slf4j
@Controller
public class WeatherController {

    @RequestMapping(value = "/", method = RequestMethod.GET)
    public String getStart(HttpServletRequest request) {
        log.info("=======================>"+request.getAttribute("ctx"));
        return "start_page";
    }

    @RequestMapping(value = "/rest/v1/weatherInfo", method = RequestMethod.GET)
    public String getWeatherInfo(HttpServletRequest request, HttpServletResponse response, Model model) throws Exception{
        return "weather_info";
    }

    @RequestMapping(value = "/rest/v1/widget", method = RequestMethod.GET)
    public String getWidget(HttpServletRequest request, HttpServletResponse response) throws Exception{
        return "widget";
    }

    @RequestMapping(value = "/rest/v1/splitscreen", method = RequestMethod.GET)
    public String getSplitscreen(HttpServletRequest request, HttpServletResponse response) throws Exception{
        return "splitscreen";
    }

}
