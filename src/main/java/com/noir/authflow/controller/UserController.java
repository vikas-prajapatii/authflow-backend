package com.noir.authflow.controller;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {

//    @GetMapping("/profile")
//    public String profile(Authentication authentication) {
//        return "Welcome " + authentication.getName();
//    }


    @GetMapping("/profile")
    public String profile(@AuthenticationPrincipal OAuth2User user) {

        return user.getAttribute("email");
    }
}