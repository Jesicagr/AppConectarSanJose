/**
 * REPOSITORIO DE ACTIVIDADES
 * Esta interfaz maneja la comunicación directa con la base de datos.
 * Al heredar de JpaRepository, Spring da automáticamente todos los métodos
 * del CRUD. También está la consulta para ordenar la agenda.
 * */
package com.conectarsj.backend.repository;

import com.conectarsj.backend.model.Actividad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ActividadRepository extends JpaRepository<Actividad, Long> {

    @Query("SELECT DISTINCT a FROM Actividad a JOIN a.horarios h ORDER BY a.fechaInicio ASC")
    List<Actividad> findAllOrdenadoPorAgenda();
}
