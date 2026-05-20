package com.conectarsj.backend.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "sedes")
@Data
public class Sede {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(length = 200)
    private String direccion;
}