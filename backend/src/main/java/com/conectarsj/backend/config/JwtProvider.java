package com.conectarsj.backend.config;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class JwtProvider {

    private final String jwtSecret = "secretKeySanJose2026ConectarSJSeguraParaElProyectoBackend";

    // Tiempo de expiración de la sesión: 1 día
    private final int jwtExpirationMs = 86400000;

    public String generateToken(Authentication auth) {
        // Captura el usuario que validó Spring Security desde tu UserDetailsService
        User userPrincipal = (User) auth.getPrincipal();

        return Jwts.builder()
                .setSubject(userPrincipal.getUsername()) // Guarda el email (Pág. 14 del Front PDF)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(SignatureAlgorithm.HS256, jwtSecret) // Firma clásica del PDF
                .compact();
    }
}