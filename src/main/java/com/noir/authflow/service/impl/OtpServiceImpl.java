package com.noir.authflow.service.impl;

import com.noir.authflow.entity.Otp;
import com.noir.authflow.entity.User;
import com.noir.authflow.exception.InvalidOtpException;
import com.noir.authflow.exception.OtpAlreadyVerifiedException;
import com.noir.authflow.exception.OtpExpiredException;
import com.noir.authflow.exception.UserNotFoundException;
import com.noir.authflow.repository.OtpRepository;
import com.noir.authflow.repository.UserRepository;
import com.noir.authflow.service.OtpService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class OtpServiceImpl implements OtpService {

    private final UserRepository userRepository;
    @Value("${app.otp.expiry}")
    private int otpExpiry;

    private final OtpRepository otpRepository;

    @Override
    @Transactional
    public Otp generateAndSaveOtp(User user) {
        String code = generateOtp();
        Otp otp = Otp.builder()
                .code(code)
                .user(user)
                .expiresAt(LocalDateTime.now().plusMinutes(otpExpiry))
                .verified(false)
                .build();
        return otpRepository.save(otp);
    }

    @Override
    @Transactional
    public void verifyOtp(String email, String code) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UserNotFoundException("User not found"));

        Otp otp = otpRepository
                .findTopByUserOrderByCreatedAtDesc(user)
                .orElseThrow(() ->
                        new InvalidOtpException("OTP not found"));

        if (otp.isVerified()) {
            throw new OtpAlreadyVerifiedException("OTP already verified");
        }

        if (otp.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new OtpExpiredException("OTP expired");
        }

        if (!otp.getCode().equals(code)) {
            throw new InvalidOtpException("Invalid OTP");
        }

        otp.setVerified(true);

        user.setEnabled(true);

        otpRepository.save(otp);

        userRepository.save(user);
    }

    private String generateOtp() {
        SecureRandom random = new SecureRandom();
        return String.valueOf(
                100000 + random.nextInt(900000)
        );
    }
}
