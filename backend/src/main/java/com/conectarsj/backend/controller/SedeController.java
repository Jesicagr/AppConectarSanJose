package com.conectarsj.backend.controller;

import com.conectarsj.backend.model.Sede;
import com.conectarsj.backend.service.SedeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sedes")
public class SedeController {

    @Autowired
    private SedeService sedeService;

    @GetMapping
    public List<Sede> listarTodas() {
        return sedeService.obtenerTodas();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Sede> obtenerPorId(@PathVariable Integer id) {
        return sedeService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Sede crear(@RequestBody Sede sede) {
        return sedeService.guardar(sede);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Sede> actualizar(@PathVariable Integer id, @RequestBody Sede sede) {
        return sedeService.obtenerPorId(id)
                .map(existing -> {
                    if (sede.getNombre() != null) existing.setNombre(sede.getNombre());
                    if (sede.getDescripcion() != null) existing.setDescripcion(sede.getDescripcion());
                    if (sede.getDireccion() != null) existing.setDireccion(sede.getDireccion());
                    if (sede.getTelefono() != null) existing.setTelefono(sede.getTelefono());
                    if (sede.getIcono() != null) existing.setIcono(sede.getIcono());
                    if (sede.getEsWhatsapp() != null) existing.setEsWhatsapp(sede.getEsWhatsapp());
                    if (sede.getLatitud() != null) existing.setLatitud(sede.getLatitud());
                    if (sede.getLongitud() != null) existing.setLongitud(sede.getLongitud());
                    if (sede.getHorarios() != null) {
                        existing.getHorarios().clear();
                        sede.getHorarios().forEach(h -> {
                            h.setId(null);
                            h.setSede(existing);
                            existing.getHorarios().add(h);
                        });
                    }
                    return ResponseEntity.ok(sedeService.guardar(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        if (sedeService.obtenerPorId(id).isPresent()) {
            sedeService.eliminar(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
