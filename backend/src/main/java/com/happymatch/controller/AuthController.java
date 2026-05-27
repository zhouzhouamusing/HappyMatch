package com.happymatch.controller;

import com.happymatch.dto.LoginRequest;
import com.happymatch.dto.RegisterRequest;
import com.happymatch.dto.ResetPasswordRequest;
import com.happymatch.entity.User;
import com.happymatch.service.UserService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@Valid @RequestBody RegisterRequest request, HttpSession session) {
        User user = userService.register(request);
        session.setAttribute("userId", user.getId());
        session.setMaxInactiveInterval(1800);

        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("data", Map.of("id", user.getId(), "username", user.getUsername()));
        return ResponseEntity.ok(body);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@Valid @RequestBody LoginRequest request, HttpSession session) {
        User user = userService.login(request);
        session.setAttribute("userId", user.getId());

        if (request.isRememberMe()) {
            session.setMaxInactiveInterval(7 * 24 * 3600);
        } else {
            session.setMaxInactiveInterval(1800);
        }

        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("data", Map.of("id", user.getId(), "username", user.getUsername()));
        return ResponseEntity.ok(body);
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> me(HttpSession session) {
        // AuthFilter already guarantees userId is present for protected endpoints
        Long userId = (Long) session.getAttribute("userId");
        User user = userService.findById(userId).orElse(null);
        if (user == null) {
            session.invalidate();
            Map<String, Object> body = new HashMap<>();
            body.put("success", false);
            body.put("code", 401);
            body.put("message", "用户不存在，请重新登录");
            return ResponseEntity.status(401).body(body);
        }

        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("data", Map.of("id", user.getId(), "username", user.getUsername()));
        return ResponseEntity.ok(body);
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(HttpSession session) {
        session.invalidate();
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("message", "已成功登出");
        return ResponseEntity.ok(body);
    }

    @GetMapping("/security-question")
    public ResponseEntity<Map<String, Object>> getSecurityQuestion(@RequestParam String username) {
        String question = userService.getSecurityQuestion(username);
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("data", Map.of("securityQuestion", question));
        return ResponseEntity.ok(body);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, Object>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        userService.resetPassword(request);
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("message", "密码重置成功，请使用新密码登录");
        return ResponseEntity.ok(body);
    }
}
