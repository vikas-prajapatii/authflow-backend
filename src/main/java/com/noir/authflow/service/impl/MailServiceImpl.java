package com.noir.authflow.service.impl;

import com.noir.authflow.service.MailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MailServiceImpl implements MailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;
    @Override
    public void sendOtp(String to, String otp) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper =
                    new MimeMessageHelper(message, true);
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject("Verify your Email");
            helper.setText(buildOtpTemplate(otp), true);
            mailSender.send(message);
        } catch (MessagingException | MailException e) {
            throw new RuntimeException("Failed to send OTP email");
        }

    }

    private String buildOtpTemplate(String otp) {

        return """
                <!DOCTYPE html>
                <html>
                <body style="font-family:Arial;background:#f4f4f4;padding:40px">

                    <div style="max-width:500px;
                                margin:auto;
                                background:white;
                                padding:30px;
                                border-radius:10px">

                        <h2 style="color:#4F46E5">
                            AuthFlow
                        </h2>

                        <p>Hello,</p>

                        <p>Your verification OTP is:</p>

                        <h1 style="
                            letter-spacing:8px;
                            text-align:center;
                            color:#4F46E5;">
                            %s
                        </h1>

                        <p>
                            This OTP will expire in
                            <b>5 minutes</b>.
                        </p>

                        <hr>

                        <small>
                            If you didn't request this email,
                            you can safely ignore it.
                        </small>

                    </div>

                </body>
                </html>
                """.formatted(otp);

    }

    @Override
    public void sendPasswordResetLink(String to, String resetLink) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject("Reset your Password");
            helper.setText(buildResetPasswordTemplate(resetLink), true);
            mailSender.send(message);
        } catch (MessagingException | MailException e) {
            throw new RuntimeException("Failed to send password reset email");
        }
    }

    private String buildResetPasswordTemplate(String resetLink) {
        return """
                <!DOCTYPE html>
                <html>
                <body style="font-family:Arial;background:#f4f4f4;padding:40px">
                    <div style="max-width:500px;
                                margin:auto;
                                background:white;
                                padding:30px;
                                border-radius:10px">
                        <h2 style="color:#4F46E5">
                            AuthFlow
                        </h2>
                        <p>Hello,</p>
                        <p>You requested to reset your password. Click the button below to set a new password:</p>
                        <div style="text-align:center; margin: 30px 0;">
                            <a href="%s" style="
                                background-color:#4F46E5;
                                color:white;
                                padding:12px 24px;
                                text-decoration:none;
                                border-radius:5px;
                                font-weight:bold;
                                display:inline-block;">
                                Reset Password
                            </a>
                        </div>
                        <p>
                            This link will expire in
                            <b>15 minutes</b>.
                        </p>
                        <hr>
                        <small>
                            If you didn't request this, you can safely ignore this email.
                        </small>
                    </div>
                </body>
                </html>
                """.formatted(resetLink);
    }
}