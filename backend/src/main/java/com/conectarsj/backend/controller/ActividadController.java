/**
 * CONTROLADOR DE ACTIVIDADES (API REST)
 * Esta clase expone los endpoints (URLs) que consumirá el frontend (Angular).
 * Recibe las peticiones HTTP de la web, se comunica con la capa de Servicio
 * para procesar la información y devuelve las respuestas en formato JSON.
 */

package com.conectarsj.backend.controller;

import com.conectarsj.backend.dto.ActividadResumenDTO;
import com.conectarsj.backend.model.Actividad;
import com.conectarsj.backend.service.ActividadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/api/actividades")
public class ActividadController {

    @Autowired
    private ActividadService actividadService;

    @GetMapping
    public List<Actividad> listarTodas() {
        return actividadService.obtenerTodasOrdenadas();
    }

    @GetMapping("/count")
    public Map<String, Long> contar() {
        return Map.of("total", actividadService.contarTotal());
    }

    @GetMapping("/paginated")
    public Page<ActividadResumenDTO> listarPaginadas(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return actividadService.obtenerResumenPaginado(PageRequest.of(page, size, Sort.by("fechaInicio").descending()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Actividad> obtenerPorId(@PathVariable Long id) {
        return actividadService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/area/{areaId}")
    public List<Actividad> listarPorArea(@PathVariable Integer areaId) {
        return actividadService.obtenerActividadesPorArea(areaId);
    }

    @PostMapping
    public Actividad crear(@RequestBody Actividad actividad) {
        return actividadService.guardar(actividad);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Actividad> actualizar(@PathVariable Long id, @RequestBody Actividad actividad) {
        try {
            Actividad actualizada = actividadService.actualizar(id, actividad);
            return ResponseEntity.ok(actualizada);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
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