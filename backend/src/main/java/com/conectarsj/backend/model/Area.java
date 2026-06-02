package com.conectarsj.backend.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "areas")
@Data
public class Area {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(length = 50)
    private String icono;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(length = 50)
    private String telefono;

    @Column(name = "es_whatsapp")
    private Boolean esWhatsapp = false;
}
