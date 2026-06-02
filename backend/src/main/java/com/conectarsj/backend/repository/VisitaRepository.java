package com.conectarsj.backend.repository;

import com.conectarsj.backend.model.Visita;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface VisitaRepository extends JpaRepository<Visita, Long> {

    Optional<Visita> findByPaginaAndFecha(String pagina, LocalDate fecha);

    @Query("SELECT COALESCE(SUM(v.contador), 0) FROM Visita v")
    long sumTotal();

    @Query("SELECT COALESCE(SUM(v.contador), 0) FROM Visita v WHERE v.fecha = ?1")
    long sumByFecha(LocalDate fecha);

    @Query("SELECT COALESCE(SUM(v.contador), 0) FROM Visita v WHERE v.fecha >= ?1")
    long sumDesde(LocalDate desde);

    @Query("SELECT v.pagina, SUM(v.contador) FROM Visita v WHERE v.pagina LIKE 'actividad-%' GROUP BY v.pagina")
    java.util.List<Object[]> sumPorActividad();
}
