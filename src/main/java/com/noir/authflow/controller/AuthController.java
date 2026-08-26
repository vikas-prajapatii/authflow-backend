package com.noir.authflow.controller;

import com.noir.authflow.dto.request.LoginRequest;
import com.noir.authflow.dto.request.RefreshTokenRequest;
import com.noir.authflow.dto.request.RegisterRequest;
import com.noir.authflow.dto.request.VerifyOtpRequest;
import com.noir.authflow.dto.response.ApiResponse;
import com.noir.authflow.dto.response.AuthResponse;
import com.noir.authflow.dto.response.LoginResponse;
import com.noir.authflow.dto.response.RegisterResponse;
import com.noir.authflow.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ApiResponse<RegisterResponse> register(
            @Valid @RequestBody RegisterRequest request
    ){
        return authService.register(request);
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @Valid @RequestBody LoginRequest request) {

        return ResponseEntity.ok(
                authService.login(request)
        );
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<String>> verifyOtp(
            @RequestBody @Valid VerifyOtpRequest request) {

        return ResponseEntity.ok(
                authService.verifyOtp(request)
        );
    }

    @GetMapping("/profile")
    public String profile(
            @AuthenticationPrincipal UserDetails userDetails){

        return userDetails.getUsername();
    }
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<LoginResponse>>
    refreshToken(
            @RequestBody
            @Valid
            RefreshTokenRequest request){

        return ResponseEntity.ok(
                authService.refreshToken(request)
        );

    }
}
