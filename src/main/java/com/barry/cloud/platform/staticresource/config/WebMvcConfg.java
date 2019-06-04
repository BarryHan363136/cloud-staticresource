package com.barry.cloud.platform.staticresource.config;

import com.barry.cloud.platform.staticresource.interceptor.ReqInterceptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * @description:
 * @author: Tongshan.Han
 * @time: 2019/6/4 14:17
 * 参考: https://yq.aliyun.com/articles/617307
 */
@Configuration
public class WebMvcConfg implements WebMvcConfigurer {

    @Autowired
    private ReqInterceptor reqInterceptor;

    /**
     * 此方法可以很方便的实现一个请求到视图的映射，而无需书写controller，例如：
     * */
    @Override
    public void addViewControllers(ViewControllerRegistry registry){
        //registry.addViewController("/login").setViewName("web/login.html");
    }

    /**
     * 添加类型转换器和格式化器
     * @param registry
     */
//    @Override
//    public void addFormatters(FormatterRegistry registry) {
//        registry.addFormatterForFieldType(LocalDate.class, new USLocalDateFormatter());
//    }

    /**
     * 跨域CORS配置
     * registry.addMapping("/**")
     *                 .allowedOrigins("*")
     *                 .allowCredentials(true)
     *                 .allowedMethods("GET", "POST", "DELETE", "PUT")
     *                 .maxAge(3600 * 24);
     * @param registry
     */
//    @Override
//    public void addCorsMappings(CorsRegistry registry) {
//        super.addCorsMappings(registry);
//        registry.addMapping("/cors/**")
//                .allowedHeaders("*")
//                .allowedMethods("POST","GET")
//                .allowedOrigins("*");
//    }

    /**
     * 配置消息转换器--这里我用的是alibaba 开源的 fastjson
     * @param
     * */
//    @Override
//    public void configureMessageConverters(List<HttpMessageConverter<?>> converters) {
//        //1.需要定义一个convert转换消息的对象;
//        FastJsonHttpMessageConverter fastJsonHttpMessageConverter = new FastJsonHttpMessageConverter();
//        //2.添加fastJson的配置信息，比如：是否要格式化返回的json数据;
//        FastJsonConfig fastJsonConfig = new FastJsonConfig();
//        fastJsonConfig.setSerializerFeatures(SerializerFeature.PrettyFormat,
//                SerializerFeature.WriteMapNullValue,
//                SerializerFeature.WriteNullStringAsEmpty,
//                SerializerFeature.DisableCircularReferenceDetect,
//                SerializerFeature.WriteNullListAsEmpty,
//                SerializerFeature.WriteDateUseDateFormat);
//        //3处理中文乱码问题
//        List<MediaType> fastMediaTypes = new ArrayList<>();
//        fastMediaTypes.add(MediaType.APPLICATION_JSON_UTF8);
//        //4.在convert中添加配置信息.
//        fastJsonHttpMessageConverter.setSupportedMediaTypes(fastMediaTypes);
//        fastJsonHttpMessageConverter.setFastJsonConfig(fastJsonConfig);
//        //5.将convert添加到converters当中.
//        converters.add(fastJsonHttpMessageConverter);
//    }

    /**
     * 配置消息转换器--这里我用的是alibaba 开源的 fastjson
     * @param
     * */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        //registry.addResourceHandler("/web/**").addResourceLocations("classpath:/web/");
        //registry.addResourceHandler("/static/**").addResourceLocations("classpath:/static/");
        //registry.addResourceHandler("swagger-ui.html").addResourceLocations("classpath:/META-INF/resources/");
        registry.addResourceHandler("/style/**").addResourceLocations("/WEB-INF/style/");
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(reqInterceptor).addPathPatterns("/*");
    }







}
