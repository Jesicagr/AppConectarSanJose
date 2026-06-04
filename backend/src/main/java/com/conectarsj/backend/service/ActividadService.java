/**
 * SERVICIO DE ACTIVIDADES
 * Esta clase contiene la lógica de negocio del módulo de Actividades.
 * Se encarga de intermediar entre los endpoints (Controlador) y la base de datos (Repositorio),
 * asegurando que los datos se procesen correctamente antes de ser guardados o enviados.
 */
package com.conectarsj.backend.service;

import com.conectarsj.backend.dto.ActividadResumenDTO;
import com.conectarsj.backend.model.Actividad;
import com.conectarsj.backend.repository.ActividadRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.jdbc.core.JdbcTemplate;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class ActividadService {

    @Autowired
    private ActividadRepository actividadRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public List<Actividad> obtenerTodasOrdenadas() {
        return actividadRepository.findAllOrdenadoPorAgenda();
    }

    public Page<Actividad> obtenerPaginadas(Pageable pageable) {
        return actividadRepository.findAllOrdenadoPorAgenda(pageable);
    }

    public long contarTotal() {
        return actividadRepository.countTotal();
    }

    public Page<ActividadResumenDTO> obtenerResumenPaginado(Pageable pageable) {
        long total = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM actividades", Long.class);

        String sql = """
            SELECT a.id, a.titulo, a.descripcion, a.fecha_inicio, a.fecha_fin,
                   'Confirmado' AS status, a.encargado, a.telefono,
                   (SELECT ar.nombre FROM areas ar
                    JOIN actividad_areas aa ON aa.area_id = ar.id
                    WHERE aa.actividad_id = a.id
                    ORDER BY ar.nombre LIMIT 1) AS area_nombre,
                   (SELECT ar.icono FROM areas ar
                    JOIN actividad_areas aa ON aa.area_id = ar.id
                    WHERE aa.actividad_id = a.id
                    ORDER BY ar.nombre LIMIT 1) AS area_icono,
                   s.nombre AS sede_nombre,
                   (SELECT STRING_AGG(
                              CONCAT(h.dia_semana, ' ', TO_CHAR(h.hora_inicio, 'HH24:MI'),
                                     COALESCE(' - ' || TO_CHAR(h.hora_fin, 'HH24:MI'), '')),
                              ' | ')
                    FROM horarios_actividad h
                    WHERE h.actividad_id = a.id) AS horario
            FROM actividades a
            JOIN sedes s ON s.id = a.sede_id
            ORDER BY a.fecha_inicio DESC
            OFFSET ? LIMIT ?
        """;

        List<ActividadResumenDTO> dtos = jdbcTemplate.query(
            sql,
            (rs, rowNum) -> {
                LocalDate fechaInicio = rs.getDate("fecha_inicio") != null
                    ? rs.getDate("fecha_inicio").toLocalDate()
                    : null;
                LocalDate fechaFin = rs.getDate("fecha_fin") != null
                    ? rs.getDate("fecha_fin").toLocalDate()
                    : null;
                return new ActividadResumenDTO(
                    rs.getLong("id"),
                    rs.getString("titulo"),
                    rs.getString("descripcion"),
                    fechaInicio,
                    fechaFin,
                    "Confirmado",
                    rs.getString("encargado"),
                    rs.getString("area_nombre"),
                    rs.getString("area_icono"),
                    rs.getString("sede_nombre"),
                    rs.getString("horario"),
                    rs.getString("telefono")
                );
            },
            pageable.getOffset(),
            pageable.getPageSize()
        );

        return new PageImpl<>(dtos, pageable, total);
    }

    public Optional<Actividad> obtenerPorId(Long id) {
        return actividadRepository.findById(id);
    }

    public Actividad guardar(Actividad actividad) {
        if (actividad.getHorarios() != null) {
            actividad.getHorarios().forEach(horario -> horario.setActividad(actividad));
        }
        return actividadRepository.save(actividad);
    }

    public void eliminar(Long id) {
        actividadRepository.deleteById(id);
    }

    @PostConstruct
    public void cleanDuplicateHorarios() {
        try {
            jdbcTemplate.update("""
                DELETE FROM horarios_actividad h1
                USING horarios_actividad h2
                WHERE h1.id > h2.id
                  AND h1.actividad_id = h2.actividad_id
                  AND h1.dia_semana = h2.dia_semana
                  AND h1.hora_inicio = h2.hora_inicio
                  AND (h1.hora_fin IS NULL AND h2.hora_fin IS NULL OR h1.hora_fin = h2.hora_fin)
            """);
        } catch (Exception e) {
            // Si la columna hora_fin aún no existe, ignorar
            System.err.println("⚠ No se pudo limpiar duplicados: " + e.getMessage());
        }
    }

    @Transactional
    public Actividad actualizar(Long id, Actividad datosNuevos) {
        Actividad existente = actividadRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Actividad no encontrada con id: " + id));

        existente.setTitulo(datosNuevos.getTitulo());
        existente.setDescripcion(datosNuevos.getDescripcion());
        existente.setDescripcion_corta(datosNuevos.getDescripcion_corta());
        existente.setSede(datosNuevos.getSede());

        if (datosNuevos.getFechaInicio() != null) {
            existente.setFechaInicio(datosNuevos.getFechaInicio());
        }
        if (datosNuevos.getFechaFin() != null) {
            existente.setFechaFin(datosNuevos.getFechaFin());
        }
        existente.setRepetirTodoAnio(datosNuevos.getRepetirTodoAnio());
        existente.setDia(datosNuevos.getDia());
        existente.setEncargado(datosNuevos.getEncargado());
        existente.setHorario(datosNuevos.getHorario());
        existente.setTelefono(datosNuevos.getTelefono());

        if (datosNuevos.getAreas() != null) {
            existente.getAreas().clear();
            existente.getAreas().addAll(datosNuevos.getAreas());
        }

        if (datosNuevos.getHorarios() != null) {
            existente.getHorarios().clear();
            datosNuevos.getHorarios().forEach(h -> {
                h.setId(null);
                h.setActividad(existente);
                existente.getHorarios().add(h);
            });
        }

        return actividadRepository.save(existente);
    }
}