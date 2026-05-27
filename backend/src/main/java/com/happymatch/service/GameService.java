package com.happymatch.service;

import com.happymatch.dto.GameProgressDTO;
import com.happymatch.entity.GameProgress;
import com.happymatch.repository.GameProgressRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class GameService {
    private final GameProgressRepository gameProgressRepository;

    public GameService(GameProgressRepository gameProgressRepository) {
        this.gameProgressRepository = gameProgressRepository;
    }

    public GameProgress getProgress(Long userId) {
        return gameProgressRepository.findByUserId(userId)
                .orElseGet(() -> {
                    GameProgress gp = new GameProgress();
                    gp.setUserId(userId);
                    return gameProgressRepository.save(gp);
                });
    }

    public GameProgress saveProgress(Long userId, GameProgressDTO dto) {
        GameProgress progress = getProgress(userId);
        if (dto.getCurrentLevel() != null && dto.getCurrentLevel() > progress.getCurrentLevel()) {
            progress.setCurrentLevel(dto.getCurrentLevel());
        }
        if (dto.getHighScore() != null && dto.getHighScore() > progress.getHighScore()) {
            progress.setHighScore(dto.getHighScore());
        }
        progress.setUpdatedAt(LocalDateTime.now());
        return gameProgressRepository.save(progress);
    }
}
