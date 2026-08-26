package com.noir.authflow.service;

import com.noir.authflow.dto.request.LoginRequest;
import com.noir.authflow.dto.request.RefreshTokenRequest;
import com.noir.authflow.dto.request.RegisterRequest;
import com.noir.authflow.dto.request.VerifyOtpRequest;
import com.noir.authflow.dto.response.ApiResponse;
import com.noir.authflow.dto.response.AuthResponse;
import com.noir.authflow.dto.response.LoginResponse;
import com.noir.authflow.dto.response.RegisterResponse;

public interface AuthService {

    ApiResponse<RegisterResponse> register(RegisterRequest request);

    ApiResponse<LoginResponse> login(LoginRequest request);

    ApiResponse<String> verifyOtp(VerifyOtpRequest request);

    ApiResponse<LoginResponse> refreshToken(RefreshTokenRequest request);

}
