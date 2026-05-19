package com.conectarsj.backend.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "actividades")
public class Actividad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titulo;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "sede_id")
    private Integer sedeId;

    @Column(name = "fecha_inicio")
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin")
    private LocalDate fechaFin;

    @Column(name = "repetir_todo_anio")
    private Boolean repetirTodoAnio;

    @Column(name = "creado_por")
    private Integer creadoPor;

    // Relación con la tabla de horarios
    @OneToMany(mappedBy = "actividad", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<HorarioActividad> horarios;


    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public Integer getSedeId() { return sedeId; }
    public void setSedeId(Integer sedeId) { this.sedeId = sedeId; }

    public LocalDate getFechaInicio() { return fechaInicio; }
    public void setFechaInicio(LocalDate fechaInicio) { this.fechaInicio = fechaInicio; }

    public LocalDate getFechaFin() { return fechaFin; }
    public void setFechaFin(LocalDate fechaFin) { this.fechaFin = fechaFin; }

    public Boolean getRepetirTodoAnio() { return repetirTodoAnio; }
    public void setRepetirTodoAnio(Boolean repetirTodoAnio) { this.repetirTodoAnio = repetirTodoAnio; }

    public Integer getCreadoPor() { return creadoPor; }
    public void setCreadoPor(Integer creadoPor) { this.creadoPor = creadoPor; }

    public List<HorarioActividad> getHorarios() { return horarios; }
    public void setHorarios(List<HorarioActividad> horarios) { this.horarios = horarios; }
}