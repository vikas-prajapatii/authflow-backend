package com.noir.authflow.service.impl;

import com.noir.authflow.dto.request.LoginRequest;
import com.noir.authflow.dto.request.RefreshTokenRequest;
import com.noir.authflow.dto.request.RegisterRequest;
import com.noir.authflow.dto.request.VerifyOtpRequest;
import com.noir.authflow.dto.response.ApiResponse;
import com.noir.authflow.dto.response.LoginResponse;
import com.noir.authflow.dto.response.RegisterResponse;
import com.noir.authflow.entity.Otp;
import com.noir.authflow.entity.User;
import com.noir.authflow.exception.UserAlreadyExistsException;
import com.noir.authflow.exception.InvalidTokenException;
import com.noir.authflow.exception.UserNotFoundException;
import com.noir.authflow.mapper.UserMapper;
import com.noir.authflow.repository.UserRepository;
import com.noir.authflow.security.CustomUserDetailsService;
import com.noir.authflow.security.JwtService;
import com.noir.authflow.service.AuthService;
import com.noir.authflow.service.MailService;
import com.noir.authflow.service.OtpService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final OtpService otpService;
    private final MailService mailService;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final CustomUserDetailsService customUserDetailsService;

    @Override
    @Transactional
    public ApiResponse<RegisterResponse> register(RegisterRequest request) {
        if(userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("email already exists");
        }
        User user = userMapper.toEntity(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        User savedUser = userRepository.save(user);
        Otp otp = otpService.generateAndSaveOtp(savedUser);

        mailService.sendOtp(
                savedUser.getEmail(),
                otp.getCode()
        );
        RegisterResponse registerResponse = userMapper.toRegisterResponse(savedUser);
        return ApiResponse.<RegisterResponse>builder()
                .success(true)
                .message("User registered successfully")
                .data(registerResponse)
                .build();
    }

    @Override
    public ApiResponse<LoginResponse> login(LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        UserDetails userDetails = customUserDetailsService.loadUserByUsername(request.getEmail());

        String accessToken =
                jwtService.generateAccessToken(userDetails);

        String refreshToken =
                jwtService.generateRefreshToken(userDetails);

        LoginResponse response = userMapper.toLoginResponse(accessToken, refreshToken);

        return ApiResponse.<LoginResponse>builder()
                .success(true)
                .message("Login successful")
                .data(response)
                .build();
    }
    @Override
    public ApiResponse<String> verifyOtp(VerifyOtpRequest request) {
        otpService.verifyOtp(
                request.getEmail(),
                request.getOtp()
        );
        return ApiResponse.<String>builder()
                .success(true)
                .message("email verified successfully")
                .data("Account activated")
                .build();
    }

    @Override
    public ApiResponse<LoginResponse> refreshToken(
            RefreshTokenRequest request) {
        String username =
                jwtService.extractUsername(
                        request.getRefreshToken());
        UserDetails userDetails =
                customUserDetailsService
                        .loadUserByUsername(username);
        if (!jwtService.isTokenValid(
                request.getRefreshToken(),
                userDetails)) {
            throw new InvalidTokenException(
                    "Invalid Refresh Token");
        }
        String accessToken =
                jwtService.generateAccessToken(
                        userDetails);
        LoginResponse response = userMapper.toLoginResponse(accessToken, request.getRefreshToken());
        return ApiResponse.<LoginResponse>builder()
                .success(true)
                .message("Access token generated")
                .data(response)
                .build();
    }
}
