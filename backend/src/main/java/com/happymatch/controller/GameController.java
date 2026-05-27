package com.happymatch.controller;

import com.happymatch.dto.GameProgressDTO;
import com.happymatch.dto.ShopPurchaseRequest;
import com.happymatch.dto.UseSkillRequest;
import com.happymatch.entity.GameProgress;
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
        Map<String, Object> data = gameService.getProgressData(userId);
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("data", data);
        return ResponseEntity.ok(body);
    }

    @PostMapping("/progress")
    public ResponseEntity<Map<String, Object>> saveProgress(@RequestBody GameProgressDTO dto, HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        GameProgress progress = gameService.saveProgress(userId, dto);
        Map<String, Object> data = gameService.getProgressData(userId);
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("data", data);
        return ResponseEntity.ok(body);
    }

    @PostMapping("/stamina/consume")
    public ResponseEntity<Map<String, Object>> consumeStamina(HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        gameService.consumeStamina(userId);
        Map<String, Object> data = gameService.getProgressData(userId);
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("data", data);
        return ResponseEntity.ok(body);
    }

    @PostMapping("/shop/buy")
    public ResponseEntity<Map<String, Object>> buyItem(@RequestBody ShopPurchaseRequest req, HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        gameService.purchaseItem(userId, req);
        Map<String, Object> data = gameService.getProgressData(userId);
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("data", data);
        return ResponseEntity.ok(body);
    }

    @PostMapping("/skill/use")
    public ResponseEntity<Map<String, Object>> useSkill(@RequestBody UseSkillRequest req, HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        gameService.useSkill(userId, req.getSkillType());
        Map<String, Object> data = gameService.getProgressData(userId);
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("data", data);
        return ResponseEntity.ok(body);
    }

    @GetMapping("/ranking")
    public ResponseEntity<Map<String, Object>> getRanking() {
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("data", gameService.getRanking());
        return ResponseEntity.ok(body);
    }
}
