package com.conectarsj.backend.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "contactos_emergencia")
@Data
public class ContactoEmergencia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "nombre_institucion", nullable = false, length = 100)
    private String nombreInstitucion;

    @Column(nullable = false, length = 20)
    private String numero;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "orden_prioridad")
    private Integer ordenPrioridad;
}