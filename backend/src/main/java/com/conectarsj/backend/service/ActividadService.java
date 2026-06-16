/**
 * SERVICIO DE ACTIVIDADES
 * Esta clase contiene la lógica de negocio del módulo de Actividades.
 * Se encarga de intermediar entre los endpoints (Controlador) y la base de datos (Repositorio),
 * asegurando que los datos se procesen correctamente antes de ser guardados o enviados.
 */
package com.conectarsj.backend.service;

import com.conectarsj.backend.model.Actividad;
import com.conectarsj.backend.repository.ActividadRepository;
import com.conectarsj.backend.exceptions.FechaInvalidaException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ActividadService {

    @Autowired
    private ActividadRepository actividadRepository;

    public List<Actividad> obtenerTodasOrdenadas() {
        return actividadRepository.findAllOrdenadoPorAgenda();
    }

    public Optional<Actividad> obtenerPorId(Long id) {
        return actividadRepository.findById(id);
    }

    public Actividad guardar(Actividad actividad) {
        if (actividad.getFechaInicio() != null && actividad.getFechaInicio().isBefore(LocalDate.now())) {
            throw new FechaInvalidaException("No se puede registrar una actividad con una fecha de inicio anterior a hoy.");
        }
        if (actividad.getHorarios() != null) {
            actividad.getHorarios().forEach(horario -> horario.setActividad(actividad));
        }
        return actividadRepository.save(actividad);
    }

    public void eliminar(Long id) {
        actividadRepository.deleteById(id);
    }
}
