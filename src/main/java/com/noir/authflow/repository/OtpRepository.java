package com.noir.authflow.repository;

import com.noir.authflow.entity.Otp;
import com.noir.authflow.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OtpRepository extends JpaRepository<Otp,Long> {
    Optional<Otp> findTopByUserOrderByCreatedAtDesc(User user);

}
