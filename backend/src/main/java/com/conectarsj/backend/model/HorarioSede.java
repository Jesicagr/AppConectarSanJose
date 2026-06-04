package com.conectarsj.backend.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalTime;

@Entity
@Table(name = "horarios_sede")
@Getter @Setter
public class HorarioSede {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "dia_desde", length = 15)
    private DiaSemana diaDesde;

    @Enumerated(EnumType.STRING)
    @Column(name = "dia_hasta", length = 15)
    private DiaSemana diaHasta;

    @Column(name = "hora_inicio")
    private LocalTime horaInicio;

    @Column(name = "hora_fin")
    private LocalTime horaFin;

    @ManyToOne
    @JoinColumn(name = "sede_id")
    @JsonBackReference
    private Sede sede;
}
