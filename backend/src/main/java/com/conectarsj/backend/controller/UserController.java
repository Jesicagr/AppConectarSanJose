package com.conectarsj.backend.controller;

import com.conectarsj.backend.dto.RegisterUserRequest;
import com.conectarsj.backend.model.Administrador;
import com.conectarsj.backend.model.Rol;
import com.conectarsj.backend.repository.AdministradorRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
public class UserController {

    private final AdministradorRepository repo;
    private final BCryptPasswordEncoder encoder;

    public UserController(AdministradorRepository repo, BCryptPasswordEncoder encoder) {
        this.repo = repo;
        this.encoder = encoder;
    }

    @GetMapping
    public ResponseEntity<List<Administrador>> listar() {
        return ResponseEntity.ok(repo.findAll());
    }

    @PostMapping
    public ResponseEntity<?> crear(@RequestBody RegisterUserRequest req) {
        if (req.getEmail() == null || req.getEmail().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "El email es requerido"));
        }
        if (req.getPassword() == null || req.getPassword().length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("error", "La contraseña debe tener al menos 6 caracteres"));
        }

        if (repo.findByEmail(req.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Ya existe un usuario con ese email"));
        }

        Rol rol = Rol.ADMIN;
        if (req.getRol() != null && req.getRol().equalsIgnoreCase("SUPER_ADMIN")) {
            rol = Rol.SUPER_ADMIN;
        }

        Administrador admin = new Administrador();
        admin.setEmail(req.getEmail());
        admin.setPasswordHash(encoder.encode(req.getPassword()));
        admin.setRol(rol);

        Administrador guardado = repo.save(admin);
        guardado.setPasswordHash(null);

        return ResponseEntity.status(HttpStatus.CREATED).body(guardado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        if (repo.existsById(id)) {
            repo.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
