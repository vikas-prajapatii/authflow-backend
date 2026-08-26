package com.noir.authflow.service;

import com.noir.authflow.entity.RefreshToken;
import com.noir.authflow.entity.User;

public interface RefreshTokenService {

    RefreshToken createRefreshToken(User user);

    RefreshToken verifyRefreshToken(String token);

    void revokeToken(User user);

}