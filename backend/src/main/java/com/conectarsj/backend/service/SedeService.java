package com.conectarsj.backend.service;

import com.conectarsj.backend.model.Sede;
import com.conectarsj.backend.repository.SedeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class SedeService {
    @Autowired
    private SedeRepository sedeRepository;

    public List<Sede> obtenerTodas() {
        return sedeRepository.findAll();
    }
}
