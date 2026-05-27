package com.happymatch.dto;

public class GameProgressDTO {
    private Integer currentLevel;
    private Integer highScore;
    private Integer stars;

    public Integer getCurrentLevel() { return currentLevel; }
    public void setCurrentLevel(Integer currentLevel) { this.currentLevel = currentLevel; }
    public Integer getHighScore() { return highScore; }
    public void setHighScore(Integer highScore) { this.highScore = highScore; }
    public Integer getStars() { return stars; }
    public void setStars(Integer stars) { this.stars = stars; }
}
