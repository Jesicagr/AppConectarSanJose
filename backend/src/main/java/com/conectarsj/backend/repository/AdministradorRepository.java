package com.conectarsj.backend.repository;

import com.conectarsj.backend.model.Administrador;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface AdministradorRepository extends JpaRepository<Administrador, Long> {


    Optional<Administrador> findByEmail(String email);

    Optional<Administrador> findByTokenRecuperacion(String token);
}