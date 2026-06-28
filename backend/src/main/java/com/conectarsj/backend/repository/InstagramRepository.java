package com.conectarsj.backend.repository;

import com.conectarsj.backend.model.PublicacionInstagram;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InstagramRepository extends JpaRepository<PublicacionInstagram, Long> {
    List<PublicacionInstagram> findByUsernameOrderByPostTimestampDesc(String username);
    List<PublicacionInstagram> findAllByOrderByPostTimestampDesc();
    void deleteByUsername(String username);
    long countByUsername(String username);
}
