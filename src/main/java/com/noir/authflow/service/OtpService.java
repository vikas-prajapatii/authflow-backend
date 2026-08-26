package com.noir.authflow.service;

import com.noir.authflow.entity.Otp;
import com.noir.authflow.entity.User;

public interface OtpService {

    Otp generateAndSaveOtp(User user);
    void verifyOtp(String email, String otp);

}