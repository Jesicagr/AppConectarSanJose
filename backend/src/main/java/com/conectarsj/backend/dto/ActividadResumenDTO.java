package com.conectarsj.backend.dto;

import java.time.LocalDate;

public record ActividadResumenDTO(
    Long id,
    String titulo,
    String descripcion,
    LocalDate fechaInicio,
    LocalDate fechaFin,
    String status,
    String encargado,
    String areaNombre,
    String areaIcono,
    String sedeNombre,
    String horario,
    String telefono
) {}
