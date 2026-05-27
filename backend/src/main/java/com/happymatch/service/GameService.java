package com.happymatch.service;

import com.happymatch.dto.GameProgressDTO;
import com.happymatch.dto.ShopPurchaseRequest;
import com.happymatch.entity.GameProgress;
import com.happymatch.exception.BusinessException;
import com.happymatch.repository.GameProgressRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class GameService {
    private static final int MAX_STAMINA = 30;
    private static final int STAMINA_RECOVERY_MINUTES = 5;
    private static final int LEVEL_STAMINA_COST = 2;
    private static final int REFRESH_PRICE = 20;
    private static final int HAMMER_PRICE = 30;

    private final GameProgressRepository gameProgressRepository;

    public GameService(GameProgressRepository gameProgressRepository) {
        this.gameProgressRepository = gameProgressRepository;
    }

    public GameProgress getProgress(Long userId) {
        GameProgress gp = gameProgressRepository.findByUserId(userId)
                .orElseGet(() -> {
                    GameProgress newGp = new GameProgress();
                    newGp.setUserId(userId);
                    return gameProgressRepository.save(newGp);
                });
        recoverStamina(gp);
        return gp;
    }

    public Map<String, Object> getProgressData(Long userId) {
        GameProgress gp = getProgress(userId);
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("currentLevel", gp.getCurrentLevel());
        data.put("highScore", gp.getHighScore());
        data.put("coins", gp.getCoins());
        data.put("stamina", gp.getStamina());
        data.put("maxStamina", MAX_STAMINA);
        data.put("staminaRecoverySeconds", getSecondsUntilNextRecovery(gp));
        data.put("refreshCount", gp.getRefreshCount());
        data.put("hammerCount", gp.getHammerCount());
        return data;
    }

    @Transactional
    public GameProgress saveProgress(Long userId, GameProgressDTO dto) {
        GameProgress progress = getProgress(userId);
        if (dto.getCurrentLevel() != null && dto.getCurrentLevel() > progress.getCurrentLevel()) {
            progress.setCurrentLevel(dto.getCurrentLevel());
        }
        if (dto.getHighScore() != null && dto.getHighScore() > progress.getHighScore()) {
            progress.setHighScore(dto.getHighScore());
        }
        if (dto.getStars() != null && dto.getStars() > 0) {
            int reward = dto.getStars() * 10;
            progress.setCoins(progress.getCoins() + reward);
        }
        progress.setUpdatedAt(LocalDateTime.now());
        return gameProgressRepository.save(progress);
    }

    @Transactional
    public GameProgress consumeStamina(Long userId) {
        GameProgress gp = getProgress(userId);
        if (gp.getStamina() < LEVEL_STAMINA_COST) {
            throw new BusinessException("体力不足，请等待恢复");
        }
        gp.setStamina(gp.getStamina() - LEVEL_STAMINA_COST);
        gp.setLastStaminaTime(LocalDateTime.now());
        gp.setUpdatedAt(LocalDateTime.now());
        return gameProgressRepository.save(gp);
    }

    @Transactional
    public GameProgress purchaseItem(Long userId, ShopPurchaseRequest req) {
        GameProgress gp = getProgress(userId);
        int quantity = req.getQuantity() != null ? req.getQuantity() : 1;
        int price;
        switch (req.getItemType()) {
            case "refresh":
                price = REFRESH_PRICE * quantity;
                if (gp.getCoins() < price) {
                    throw new BusinessException("金币不足");
                }
                gp.setCoins(gp.getCoins() - price);
                gp.setRefreshCount(gp.getRefreshCount() + quantity);
                break;
            case "hammer":
                price = HAMMER_PRICE * quantity;
                if (gp.getCoins() < price) {
                    throw new BusinessException("金币不足");
                }
                gp.setCoins(gp.getCoins() - price);
                gp.setHammerCount(gp.getHammerCount() + quantity);
                break;
            default:
                throw new BusinessException("无效的商品类型");
        }
        gp.setUpdatedAt(LocalDateTime.now());
        return gameProgressRepository.save(gp);
    }

    @Transactional
    public GameProgress useSkill(Long userId, String skillType) {
        GameProgress gp = getProgress(userId);
        switch (skillType) {
            case "refresh":
                if (gp.getRefreshCount() <= 0) {
                    throw new BusinessException("刷新技能数量不足");
                }
                gp.setRefreshCount(gp.getRefreshCount() - 1);
                break;
            case "hammer":
                if (gp.getHammerCount() <= 0) {
                    throw new BusinessException("锤子技能数量不足");
                }
                gp.setHammerCount(gp.getHammerCount() - 1);
                break;
            default:
                throw new BusinessException("无效的技能类型");
        }
        gp.setUpdatedAt(LocalDateTime.now());
        return gameProgressRepository.save(gp);
    }

    public List<Map<String, Object>> getRanking() {
        List<Object[]> rows = gameProgressRepository.findRankingTop50();
        List<Map<String, Object>> ranking = new ArrayList<>();
        int rank = 1;
        for (Object[] row : rows) {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("rank", rank++);
            entry.put("username", row[0]);
            entry.put("highScore", row[1]);
            entry.put("currentLevel", row[2]);
            ranking.add(entry);
        }
        return ranking;
    }

    private void recoverStamina(GameProgress gp) {
        if (gp.getStamina() >= MAX_STAMINA) return;
        long minutesElapsed = ChronoUnit.MINUTES.between(gp.getLastStaminaTime(), LocalDateTime.now());
        int recovered = (int) (minutesElapsed / STAMINA_RECOVERY_MINUTES);
        if (recovered > 0) {
            int newStamina = Math.min(MAX_STAMINA, gp.getStamina() + recovered);
            gp.setStamina(newStamina);
            long usedMinutes = (long) recovered * STAMINA_RECOVERY_MINUTES;
            gp.setLastStaminaTime(gp.getLastStaminaTime().plusMinutes(usedMinutes));
            gp.setUpdatedAt(LocalDateTime.now());
            gameProgressRepository.save(gp);
        }
    }

    private int getSecondsUntilNextRecovery(GameProgress gp) {
        if (gp.getStamina() >= MAX_STAMINA) return 0;
        long secondsElapsed = ChronoUnit.SECONDS.between(gp.getLastStaminaTime(), LocalDateTime.now());
        int secondsInCycle = (int) (secondsElapsed % (STAMINA_RECOVERY_MINUTES * 60));
        return (STAMINA_RECOVERY_MINUTES * 60) - secondsInCycle;
    }
}
