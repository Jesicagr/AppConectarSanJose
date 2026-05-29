package com.conectarsj.backend.controller;

import com.conectarsj.backend.model.Area;
import com.conectarsj.backend.service.AreaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/areas")
@CrossOrigin(origins = "http://localhost:4200")
public class AreaController {

    @Autowired
    private AreaService areaService;

    @GetMapping
    public List<Area> listarTodas() {
        return areaService.obtenerTodas();
    }
}
