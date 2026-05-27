package com.happymatch.controller;

import com.happymatch.dto.GameProgressDTO;
import com.happymatch.entity.GameProgress;
import com.happymatch.service.GameService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/game")
public class GameController {
    private final GameService gameService;

    public GameController(GameService gameService) {
        this.gameService = gameService;
    }

    @GetMapping("/progress")
    public ResponseEntity<?> getProgress(HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401).body(Map.of("message", "未登录"));
        }
        GameProgress progress = gameService.getProgress(userId);
        return ResponseEntity.ok(Map.of(
                "currentLevel", progress.getCurrentLevel(),
                "highScore", progress.getHighScore()
        ));
    }

    @PostMapping("/progress")
    public ResponseEntity<?> saveProgress(@RequestBody GameProgressDTO dto, HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401).body(Map.of("message", "未登录"));
        }
        GameProgress progress = gameService.saveProgress(userId, dto);
        return ResponseEntity.ok(Map.of(
                "currentLevel", progress.getCurrentLevel(),
                "highScore", progress.getHighScore()
        ));
    }
}
