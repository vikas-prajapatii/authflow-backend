package com.noir.authflow.service;

import com.noir.authflow.entity.User;
import com.noir.authflow.enums.AuthProvider;
import com.noir.authflow.enums.Role;
import com.noir.authflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OAuth2Service {

    private final UserRepository userRepository;

    public User saveOrUpdate(OAuth2User oauthUser){

        String email = oauthUser.getAttribute("email");
        String name = oauthUser.getAttribute("name");
        String sub = oauthUser.getAttribute("sub");

        return userRepository.findByEmail(email)
                .orElseGet(() -> {

                    User user = new User();

                    user.setEmail(email);
                    user.setName(name);

                    user.setProvider(AuthProvider.GOOGLE);
                    user.setProviderId(sub);
                    user.setEnabled(true);
                    user.setRole(Role.ROLE_JOB_SEEKER);

                    return userRepository.save(user);
                });
    }

}