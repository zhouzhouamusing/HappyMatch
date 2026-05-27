package com.happymatch.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RegisterRequest {
    @NotBlank(message = "用户名不能为空")
    @Size(min = 2, max = 20, message = "用户名长度为2-20个字符")
    private String username;

    @NotBlank(message = "密码不能为空")
    @Size(min = 4, max = 50, message = "密码长度为4-50个字符")
    private String password;

    @NotBlank(message = "请确认密码")
    private String confirmPassword;

    @NotBlank(message = "请选择密保问题")
    private String securityQuestion;

    @NotBlank(message = "请填写密保答案")
    @Size(min = 1, max = 50, message = "密保答案长度为1-50个字符")
    private String securityAnswer;

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getConfirmPassword() { return confirmPassword; }
    public void setConfirmPassword(String confirmPassword) { this.confirmPassword = confirmPassword; }
    public String getSecurityQuestion() { return securityQuestion; }
    public void setSecurityQuestion(String securityQuestion) { this.securityQuestion = securityQuestion; }
    public String getSecurityAnswer() { return securityAnswer; }
    public void setSecurityAnswer(String securityAnswer) { this.securityAnswer = securityAnswer; }
}
