package com.noir.authflow.service;

public interface MailService {
    void sendOtp(String to, String otp);
    void sendPasswordResetLink(String to, String resetLink);
}
