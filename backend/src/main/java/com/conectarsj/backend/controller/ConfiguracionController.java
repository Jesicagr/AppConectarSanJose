package com.conectarsj.backend.controller;

import com.conectarsj.backend.service.ConfiguracionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/configuracion")
public class ConfiguracionController {

    private final ConfiguracionService service;

    public ConfiguracionController(ConfiguracionService service) {
        this.service = service;
    }

    @GetMapping
    public Map<String, String> obtenerTodas() {
        return service.obtenerTodas();
    }

    @GetMapping("/{clave}")
    public ResponseEntity<String> obtener(@PathVariable String clave) {
        String valor = service.obtener(clave);
        if (valor.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(valor);
    }

    @PutMapping
    public ResponseEntity<?> guardar(@RequestBody Map<String, String> body) {
        if (body == null || body.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Body vacío"));
        }
        service.guardarTodas(body);
        return ResponseEntity.ok(Map.of("message", "Configuración actualizada"));
    }

    @PutMapping("/{clave}")
    public ResponseEntity<?> guardarClave(@PathVariable String clave, @RequestBody Map<String, String> body) {
        String valor = body.get("valor");
        if (valor == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Valor es requerido"));
        }
        service.guardar(clave, valor);
        return ResponseEntity.ok(Map.of("clave", clave, "valor", valor));
    }
}
