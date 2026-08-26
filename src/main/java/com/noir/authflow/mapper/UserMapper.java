package com.noir.authflow.mapper;

import com.noir.authflow.dto.request.RegisterRequest;
import com.noir.authflow.dto.response.LoginResponse;
import com.noir.authflow.dto.response.RegisterResponse;
import com.noir.authflow.entity.User;
import com.noir.authflow.enums.AuthProvider;
import com.noir.authflow.enums.Role;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {
    public User toEntity(RegisterRequest req){
        return User.builder()
                .name(req.getName())
                .email(req.getEmail())
                .role(Role.ROLE_EMPLOYER)
                .provider(AuthProvider.LOCAL)
                .enabled(false)
                .build();
    }
    public RegisterResponse toRegisterResponse(User user){
        return RegisterResponse.builder()
                .email(user.getEmail())
                .build();
    }
    public LoginResponse toLoginResponse(String accessToken, String refreshToken){
        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .build();
    }
}
