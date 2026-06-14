package com.conectarsj.backend.dto;

import java.time.LocalDate;
import java.util.List;

public record ActividadResumenDTO(
    Long id,
    String titulo,
    String descripcion,
    LocalDate fechaInicio,
    LocalDate fechaFin,
    String status,
    String encargado,
    List<String> areaNombres,
    List<String> areaIconos,
    String sedeNombre,
    String horario,
    String telefono
) {}
