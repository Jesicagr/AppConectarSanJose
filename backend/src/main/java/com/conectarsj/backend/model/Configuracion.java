package com.conectarsj.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "configuracion")
public class Configuracion {

    @Id
    @Column(name = "clave", length = 100)
    private String clave;

    @Column(name = "valor", columnDefinition = "TEXT")
    private String valor;

    public Configuracion() {}

    public Configuracion(String clave, String valor) {
        this.clave = clave;
        this.valor = valor;
    }

    public String getClave() { return clave; }
    public void setClave(String clave) { this.clave = clave; }
    public String getValor() { return valor; }
    public void setValor(String valor) { this.valor = valor; }
}
