package com.conectarsj.backend;

import com.conectarsj.backend.model.Administrador;
import com.conectarsj.backend.repository.AdministradorRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@SpringBootApplication
public class ConectarSjBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(ConectarSjBackendApplication.class, args);
    }

    // Este bloque corre una sola vez al arrancar y nos crea el usuario seguro
    @Bean
    CommandLineRunner init(AdministradorRepository repo, BCryptPasswordEncoder encoder) {
        return args -> {
            // Verificamos si ya existe para no duplicarlo cada vez que le des Play
            if (repo.findByEmail("admin@sanjose.com").isEmpty()) {
                Administrador admin = new Administrador();
                admin.setEmail("admin@sanjose.com");
                // Hasheamos la contraseña "admin123" con BCrypt
                admin.setPasswordHash(encoder.encode("admin123"));
                repo.save(admin);
                System.out.println("✅ Usuario de prueba creado: admin@sanjose.com / admin123");
            }
        };
    }
}