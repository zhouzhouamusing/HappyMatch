package com.happymatch.repository;

import com.happymatch.entity.GameProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface GameProgressRepository extends JpaRepository<GameProgress, Long> {
    Optional<GameProgress> findByUserId(Long userId);

    @Query(value = "SELECT u.username, gp.high_score, gp.current_level FROM game_progress gp JOIN user u ON gp.user_id = u.id ORDER BY gp.high_score DESC LIMIT 50", nativeQuery = true)
    List<Object[]> findRankingTop50();
}
