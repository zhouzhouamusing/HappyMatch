package com.happymatch.dto;

public class GameProgressDTO {
    private Integer currentLevel;
    private Integer highScore;

    public Integer getCurrentLevel() { return currentLevel; }
    public void setCurrentLevel(Integer currentLevel) { this.currentLevel = currentLevel; }
    public Integer getHighScore() { return highScore; }
    public void setHighScore(Integer highScore) { this.highScore = highScore; }
}
