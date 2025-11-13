package com.mediSync.project.common.service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;

@Service
@RequiredArgsConstructor
public class EmailService {

    @Autowired
    private final JavaMailSender mailSender;

    public void sendEmail(String to,String subject,String text){
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);
        mailSender.send(message);
    }


     // [임시 비밀번호 발급]
     // 10자리 랜덤 문자열 생성 => 사용자에게 HTML 형식의 이메일 발송
     // 생성된 임시 비밀번호를 반환하여 Controller에서 DB에 저장
    public String sendTempPasswordEmail(String email) {

        String tempPassword = createTempPassword();
        String toMail = email; // 수신자의 이메일 주소
        String title = "[중요] 임시 비밀번호가 발급되었습니다."; // 이메일 제목

        String content = buildHtmlContent(tempPassword);

        try {
            MimeMessage mail = mailSender.createMimeMessage();
            MimeMessageHelper mailHelper = new MimeMessageHelper(mail, true, "UTF-8");
            mailHelper.setTo(toMail);
            mailHelper.setSubject(title);
            mailHelper.setText(content, true); // 👈 true로 설정해야 HTML이 적용됩니다.
            mailSender.send(mail);

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("임시 비밀번호 메일 발송에 실패했습니다.");
        }
        return tempPassword;
    }


    // (보안) 10자리 임시 비밀번호 생성 (알파벳 대소문자 + 숫자)
    private String createTempPassword() {
        // (A-Z, a-z, 0-9)
        final String CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        SecureRandom random = new SecureRandom(); // 👈 보안에 권장되는 난수 생성기
        StringBuilder sb = new StringBuilder(10);

        for (int i = 0; i < 10; i++) {
            sb.append(CHARS.charAt(random.nextInt(CHARS.length())));
        }
        return sb.toString();
    }


    // 임시 비밀번호 발송 메일의 HTML 본문 생성
    private String buildHtmlContent(String tempPassword) {
        return "<div style='font-family: \"Apple SD Gothic Neo\", \"Noto Sans KR\", \"Malgun Gothic\", sans-serif; padding: 30px; border-radius: 10px; border: 1px solid #eee; background-color: #f9f9f9;'>"
                + "  <h2 style='font-size: 24px; color: #333; border-bottom: 2px solid #ddd; padding-bottom: 10px;'>임시 비밀번호 발급 안내</h2>"
                + "  <p style='font-size: 16px; color: #555; line-height: 1.6; margin-top: 20px;'>"
                + "    안녕하세요. 회원님의 요청에 따라 임시 비밀번호가 발급되었습니다.<br>"
                + "    아래 비밀번호로 로그인하신 후, 반드시 **보안을 위해 비밀번호를 변경**해 주시기 바랍니다."
                + "  </p>"
                + "  <div style='margin-top: 30px; padding: 20px; background-color: #fff; border-radius: 5px; text-align: center; border: 1px solid #eee;'>"
                + "    <span style='font-size: 18px; color: #777; margin-right: 15px;'>임시 비밀번호:</span>"
                + "    <strong style='font-size: 22px; color: #d9534f; letter-spacing: 1px;'>" + tempPassword + "</strong>"
                + "  </div>"
                + "  <p style='font-size: 14px; color: #aaa; margin-top: 30px;'>* 이 메일은 발신 전용입니다.</p>"
                + "</div>";
    }
}
