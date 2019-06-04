package com.barry.cloud.platform.staticresource;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;

/**
 * TaskApplication [spring boot] 主方法
 *
 * 启动方式，右键->run/debug->Spring Boot App
 *
 * @author
 *
 */
@SpringBootApplication(exclude = {DataSourceAutoConfiguration.class})
public class StaticResourceStarter {

    public static void main(String[] args) {
        SpringApplication.run(StaticResourceStarter.class, args);
    }

}
