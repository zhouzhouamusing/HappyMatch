package com.happymatch.repository;

import com.happymatch.entity.GameProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface GameProgressRepository extends JpaRepository<GameProgress, Long> {
    Optional<GameProgress> findByUserId(Long userId);
}
