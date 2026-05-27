package com.happymatch.service;

import com.happymatch.dto.LoginRequest;
import com.happymatch.dto.RegisterRequest;
import com.happymatch.entity.GameProgress;
import com.happymatch.entity.User;
import com.happymatch.repository.GameProgressRepository;
import com.happymatch.repository.UserRepository;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final GameProgressRepository gameProgressRepository;

    public UserService(UserRepository userRepository, GameProgressRepository gameProgressRepository) {
        this.userRepository = userRepository;
        this.gameProgressRepository = gameProgressRepository;
    }

    public User register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("用户名已存在");
        }
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(BCrypt.hashpw(request.getPassword(), BCrypt.gensalt()));
        user = userRepository.save(user);

        GameProgress progress = new GameProgress();
        progress.setUserId(user.getId());
        gameProgressRepository.save(progress);

        return user;
    }

    public User login(LoginRequest request) {
        Optional<User> userOpt = userRepository.findByUsername(request.getUsername());
        if (userOpt.isEmpty()) {
            throw new RuntimeException("用户名或密码错误");
        }
        User user = userOpt.get();
        if (!BCrypt.checkpw(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("用户名或密码错误");
        }
        return user;
    }

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }
}
