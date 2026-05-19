package com.conectarsj.backend.service;

import com.conectarsj.backend.model.Administrador;
import com.conectarsj.backend.repository.AdministradorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private AdministradorRepository administradorRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Administrador admin = administradorRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Administrador no encontrado con email: " + email));

        // Transforma tu entidad de pgAdmin al objeto User que entiende la "cebolla" de Spring Security
        return new User(
                admin.getEmail(),
                admin.getPasswordHash(),
                Collections.emptyList() // Sin roles/permisos complejos por ahora
        );
    }
}