package com.happymatch.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "game_progress")
public class GameProgress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    @Column(name = "current_level", nullable = false)
    private Integer currentLevel = 1;

    @Column(name = "high_score", nullable = false)
    private Integer highScore = 0;

    @Column(name = "coins", nullable = false)
    private Integer coins = 0;

    @Column(name = "stamina", nullable = false)
    private Integer stamina = 30;

    @Column(name = "last_stamina_time", nullable = false)
    private LocalDateTime lastStaminaTime = LocalDateTime.now();

    @Column(name = "refresh_count", nullable = false)
    private Integer refreshCount = 0;

    @Column(name = "hammer_count", nullable = false)
    private Integer hammerCount = 0;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Integer getCurrentLevel() { return currentLevel; }
    public void setCurrentLevel(Integer currentLevel) { this.currentLevel = currentLevel; }
    public Integer getHighScore() { return highScore; }
    public void setHighScore(Integer highScore) { this.highScore = highScore; }
    public Integer getCoins() { return coins; }
    public void setCoins(Integer coins) { this.coins = coins; }
    public Integer getStamina() { return stamina; }
    public void setStamina(Integer stamina) { this.stamina = stamina; }
    public LocalDateTime getLastStaminaTime() { return lastStaminaTime; }
    public void setLastStaminaTime(LocalDateTime lastStaminaTime) { this.lastStaminaTime = lastStaminaTime; }
    public Integer getRefreshCount() { return refreshCount; }
    public void setRefreshCount(Integer refreshCount) { this.refreshCount = refreshCount; }
    public Integer getHammerCount() { return hammerCount; }
    public void setHammerCount(Integer hammerCount) { this.hammerCount = hammerCount; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
