package com.happymatch.service;

import com.happymatch.dto.LoginRequest;
import com.happymatch.dto.RegisterRequest;
import com.happymatch.dto.ResetPasswordRequest;
import com.happymatch.entity.GameProgress;
import com.happymatch.entity.User;
import com.happymatch.exception.BusinessException;
import com.happymatch.repository.GameProgressRepository;
import com.happymatch.repository.UserRepository;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.regex.Pattern;

@Service
public class UserService {
    private static final Pattern USERNAME_PATTERN = Pattern.compile("^[a-zA-Z0-9_\\u4e00-\\u9fa5]{2,20}$");

    private final UserRepository userRepository;
    private final GameProgressRepository gameProgressRepository;

    public UserService(UserRepository userRepository, GameProgressRepository gameProgressRepository) {
        this.userRepository = userRepository;
        this.gameProgressRepository = gameProgressRepository;
    }

    @Transactional
    public User register(RegisterRequest request) {
        String username = request.getUsername().trim();
        String password = request.getPassword();

        if (!USERNAME_PATTERN.matcher(username).matches()) {
            throw new BusinessException("用户名只能包含中文、字母、数字和下划线，长度2-20位");
        }
        if (password.length() < 4 || password.length() > 50) {
            throw new BusinessException("密码长度为4-50个字符");
        }
        if (!password.equals(request.getConfirmPassword())) {
            throw new BusinessException("两次输入的密码不一致");
        }
        if (userRepository.existsByUsername(username)) {
            throw new BusinessException("该用户名已被注册");
        }

        User user = new User();
        user.setUsername(username);
        user.setPassword(BCrypt.hashpw(password, BCrypt.gensalt(12)));
        user.setSecurityQuestion(request.getSecurityQuestion());
        user.setSecurityAnswer(BCrypt.hashpw(request.getSecurityAnswer().trim().toLowerCase(), BCrypt.gensalt(10)));
        user = userRepository.save(user);

        GameProgress progress = new GameProgress();
        progress.setUserId(user.getId());
        gameProgressRepository.save(progress);

        return user;
    }

    public User login(LoginRequest request) {
        String username = request.getUsername().trim();
        if (username.isEmpty()) {
            throw new BusinessException("用户名不能为空");
        }

        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            throw new BusinessException("用户名或密码错误");
        }

        User user = userOpt.get();
        if (!BCrypt.checkpw(request.getPassword(), user.getPassword())) {
            throw new BusinessException("用户名或密码错误");
        }
        return user;
    }

    public String getSecurityQuestion(String username) {
        String trimmed = username.trim();
        if (trimmed.isEmpty()) {
            throw new BusinessException("请输入用户名");
        }
        Optional<User> userOpt = userRepository.findByUsername(trimmed);
        if (userOpt.isEmpty()) {
            throw new BusinessException("该用户不存在");
        }
        User user = userOpt.get();
        if (user.getSecurityQuestion() == null || user.getSecurityQuestion().isEmpty()) {
            throw new BusinessException("该用户未设置密保问题，无法重置密码");
        }
        return user.getSecurityQuestion();
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        String username = request.getUsername().trim();
        if (username.isEmpty()) {
            throw new BusinessException("用户名不能为空");
        }
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BusinessException("两次输入的密码不一致");
        }
        if (request.getNewPassword().length() < 4 || request.getNewPassword().length() > 50) {
            throw new BusinessException("密码长度为4-50个字符");
        }

        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            throw new BusinessException("该用户不存在");
        }

        User user = userOpt.get();
        if (user.getSecurityAnswer() == null) {
            throw new BusinessException("该用户未设置密保，无法重置密码");
        }
        if (!BCrypt.checkpw(request.getSecurityAnswer().trim().toLowerCase(), user.getSecurityAnswer())) {
            throw new BusinessException("密保答案错误");
        }

        user.setPassword(BCrypt.hashpw(request.getNewPassword(), BCrypt.gensalt(12)));
        userRepository.save(user);
    }

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }
}
