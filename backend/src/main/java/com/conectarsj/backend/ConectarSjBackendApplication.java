package com.conectarsj.backend;

import com.conectarsj.backend.model.Administrador;
import com.conectarsj.backend.repository.AdministradorRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@SpringBootApplication
@EnableAsync
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
                admin.setPasswordHash(encoder.encode("admin123"));
                repo.save(admin);
                System.out.println("✅ Usuario creado: admin@sanjose.com / admin123");
            }
            if (repo.findByEmail("jesiagr@gmail.com").isEmpty()) {
                Administrador admin = new Administrador();
                admin.setEmail("jesiagr@gmail.com");
                admin.setPasswordHash(encoder.encode("admin1919"));
                repo.save(admin);
                System.out.println("✅ Usuario creado: jesiagr@gmail.com / admin1919");
            }
        };
    }
}