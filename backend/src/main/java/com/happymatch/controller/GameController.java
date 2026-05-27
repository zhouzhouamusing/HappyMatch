package com.happymatch.controller;

import com.happymatch.dto.GameProgressDTO;
import com.happymatch.entity.GameProgress;
import com.happymatch.exception.BusinessException;
import com.happymatch.service.GameService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/game")
public class GameController {
    private final GameService gameService;

    public GameController(GameService gameService) {
        this.gameService = gameService;
    }

    @GetMapping("/progress")
    public ResponseEntity<Map<String, Object>> getProgress(HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) {
            throw new BusinessException(401, "未登录");
        }
        GameProgress progress = gameService.getProgress(userId);

        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("data", Map.of(
                "currentLevel", progress.getCurrentLevel(),
                "highScore", progress.getHighScore()
        ));
        return ResponseEntity.ok(body);
    }

    @PostMapping("/progress")
    public ResponseEntity<Map<String, Object>> saveProgress(@RequestBody GameProgressDTO dto, HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) {
            throw new BusinessException(401, "未登录");
        }
        GameProgress progress = gameService.saveProgress(userId, dto);

        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("data", Map.of(
                "currentLevel", progress.getCurrentLevel(),
                "highScore", progress.getHighScore()
        ));
        return ResponseEntity.ok(body);
    }
}
