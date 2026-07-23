package com.conectarsj.backend.repository;

import com.conectarsj.backend.model.Configuracion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ConfiguracionRepository extends JpaRepository<Configuracion, String> {
    Optional<Configuracion> findByClave(String clave);
}
