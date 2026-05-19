/**
 * CONTROLADOR DE ACTIVIDADES (API REST)
 * Esta clase expone los endpoints (URLs) que consumirá el frontend (Angular).
 * Recibe las peticiones HTTP de la web, se comunica con la capa de Servicio
 * para procesar la información y devuelve las respuestas en formato JSON.
 */

package com.conectarsj.backend.controller;

import com.conectarsj.backend.model.Actividad;
import com.conectarsj.backend.service.ActividadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/actividades")
@CrossOrigin(origins = "http://localhost:4200")
public class ActividadController {

    @Autowired
    private ActividadService actividadService;

    @GetMapping
    public List<Actividad> listarTodas() {
        return actividadService.obtenerTodasOrdenadas();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Actividad> obtenerPorId(@PathVariable Long id) {
        return actividadService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Actividad crear(@RequestBody Actividad actividad) {
        return actividadService.guardar(actividad);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        if (actividadService.obtenerPorId(id).isPresent()) {
            actividadService.eliminar(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}