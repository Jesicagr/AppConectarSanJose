package com.conectarsj.backend.service;

import com.conectarsj.backend.model.Configuracion;
import com.conectarsj.backend.repository.ConfiguracionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ConfiguracionService {

    private final ConfiguracionRepository repository;

    public ConfiguracionService(ConfiguracionRepository repository) {
        this.repository = repository;
    }

    public Map<String, String> obtenerTodas() {
        return repository.findAll().stream()
                .collect(Collectors.toMap(Configuracion::getClave, c -> c.getValor() != null ? c.getValor() : ""));
    }

    public String obtener(String clave) {
        return repository.findById(clave)
                .map(Configuracion::getValor)
                .orElse("");
    }

    @Transactional
    public void guardar(String clave, String valor) {
        Configuracion config = repository.findById(clave).orElse(new Configuracion(clave, valor));
        config.setValor(valor);
        repository.save(config);
    }

    @Transactional
    public void guardarTodas(Map<String, String> configs) {
        configs.forEach(this::guardar);
    }
}
