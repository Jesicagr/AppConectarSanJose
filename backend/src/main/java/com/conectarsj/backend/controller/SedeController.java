package com.conectarsj.backend.controller;

import com.conectarsj.backend.model.Sede;
import com.conectarsj.backend.service.SedeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/sedes")
@CrossOrigin(origins = "http://localhost:4200")
public class SedeController {

    @Autowired
    private SedeService sedeService;

    @GetMapping
    public List<Sede> listarTodas() {
        return sedeService.obtenerTodas();
    }
}
