package com.noir.authflow.security;

import com.noir.authflow.entity.User;
import com.noir.authflow.service.OAuth2Service;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final OAuth2Service oauth2Service;
    private final JwtService jwtService;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication)
            throws IOException, ServletException {

        // Google user
        OAuth2User oauthUser =
                (OAuth2User) authentication.getPrincipal();

        // Save or fetch user
        User user =
                oauth2Service.saveOrUpdate(oauthUser);

        org.springframework.security.core.userdetails.UserDetails userDetails =
                org.springframework.security.core.userdetails.User.builder()
                        .username(user.getEmail())
                        .password(user.getPassword() != null ? user.getPassword() : "")
                        .authorities(user.getRole().name())
                        .disabled(!user.getEnabled())
                        .build();

        // Generate JWT
        String accessToken =
                jwtService.generateAccessToken(userDetails);

        String refreshToken =
                jwtService.generateRefreshToken(userDetails);

        // Temporary response
        response.setContentType("application/json");

        response.getWriter().write("""
        {
          "accessToken":"%s",
          "refreshToken":"%s"
        }
        """.formatted(accessToken, refreshToken));
    }
}