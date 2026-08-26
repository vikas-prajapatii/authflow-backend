package com.noir.authflow.controller;

import tools.jackson.databind.ObjectMapper;
import com.noir.authflow.dto.request.LoginRequest;
import com.noir.authflow.dto.request.RegisterRequest;
import com.noir.authflow.dto.request.VerifyOtpRequest;
import com.noir.authflow.entity.Otp;
import com.noir.authflow.entity.User;
import com.noir.authflow.repository.OtpRepository;
import com.noir.authflow.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OtpRepository otpRepository;

    @org.springframework.test.context.bean.override.mockito.MockitoBean
    private com.noir.authflow.service.MailService mailService;

    @Autowired
    private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @BeforeEach
    void setUp() {
        jdbcTemplate.execute("ALTER TABLE users ALTER COLUMN code DROP NOT NULL");
        otpRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void testAuthenticationFlow() throws Exception {
        // 1. Register a new user
        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setName("Test User");
        registerRequest.setEmail("test@example.com");
        registerRequest.setPassword("password123");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("User registered successfully"))
                .andExpect(jsonPath("$.data.email").value("test@example.com"));

        // Verify user is saved in DB
        User user = userRepository.findByEmail("test@example.com").orElse(null);
        assertNotNull(user);
        assertFalse(user.getEnabled()); // enabled should be false initially

        // 2. Fetch the generated OTP from DB
        Otp otp = otpRepository.findTopByUserOrderByCreatedAtDesc(user).orElse(null);
        assertNotNull(otp);
        assertNotNull(otp.getCode());

        // 3. Verify OTP
        VerifyOtpRequest verifyOtpRequest = new VerifyOtpRequest();
        verifyOtpRequest.setEmail("test@example.com");
        verifyOtpRequest.setOtp(otp.getCode());

        mockMvc.perform(post("/api/auth/verify-otp")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(verifyOtpRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("email verified successfully"));

        // Verify user is now enabled
        user = userRepository.findByEmail("test@example.com").orElse(null);
        assertNotNull(user);
        assertTrue(user.getEnabled());

        // 4. Login with credentials
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("password123");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Login successful"))
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.data.refreshToken").isNotEmpty());
    }
}
