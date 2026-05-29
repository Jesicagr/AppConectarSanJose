package com.conectarsj.backend.service;

import com.conectarsj.backend.model.Area;
import com.conectarsj.backend.repository.AreaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class AreaService {
    @Autowired
    private AreaRepository areaRepository;

    public List<Area> obtenerTodas() {
        return areaRepository.findAll();
    }
}
