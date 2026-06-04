package com.conectarsj.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

@Embeddable
public class TelefonoContacto {

    @Column(nullable = false, length = 100)
    private String numero;

    @Column(name = "es_whatsapp")
    private boolean esWhatsapp = false;

    @Column(length = 50)
    private String etiqueta;

    public TelefonoContacto() {}

    public TelefonoContacto(String numero, boolean esWhatsapp) {
        this.numero = numero;
        this.esWhatsapp = esWhatsapp;
    }

    public TelefonoContacto(String numero, boolean esWhatsapp, String etiqueta) {
        this.numero = numero;
        this.esWhatsapp = esWhatsapp;
        this.etiqueta = etiqueta;
    }

    public String getNumero() { return numero; }
    public void setNumero(String numero) { this.numero = numero; }
    public boolean isEsWhatsapp() { return esWhatsapp; }
    public void setEsWhatsapp(boolean esWhatsapp) { this.esWhatsapp = esWhatsapp; }
    public String getEtiqueta() { return etiqueta; }
    public void setEtiqueta(String etiqueta) { this.etiqueta = etiqueta; }
}
