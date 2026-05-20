package com.conectarsj.backend.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "actividades")
@Data
public class Actividad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String titulo;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    // --- RELACIÓN CON SEDES ---
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "sede_id", nullable = false)
    private Sede sede;

    @Column(name = "fecha_inicio")
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin")
    private LocalDate fechaFin;

    @Column(name = "repetir_todo_anio")
    private Boolean repetirTodoAnio;

    // --- RELACIÓN CON ADMINISTRADOR ---
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creado_por")
    private Administrador creadoPor;


    @Column(length = 255)
    private String descripcion_corta;

    @Column(length = 255)
    private String dia;

    @Column(length = 255)
    private String encargado;

    @Column(length = 255)
    private String horario;

    // --- RELACIÓN MUCHOS A MUCHOS CON AREAS ---
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "actividad_areas",
            joinColumns = @JoinColumn(name = "actividad_id"),
            inverseJoinColumns = @JoinColumn(name = "area_id")
    )
    private List<Area> areas;

    // --- RELACIÓN CON HORARIOS
    @OneToMany(mappedBy = "actividad", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<HorarioActividad> horarios;
}