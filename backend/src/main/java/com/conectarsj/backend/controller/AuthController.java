package com.conectarsj.backend.controller;

import com.conectarsj.backend.dto.LoginRequest;
import com.conectarsj.backend.dto.JwtResponse;
import com.conectarsj.backend.config.JwtProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authManager;

    @Autowired
    private JwtProvider jwtProvider;

    //ENDPOINT /auth/login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            Authentication auth = authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(),
                            loginRequest.getPassword()
                    )
            );

            String token = jwtProvider.generateToken(auth);
            return ResponseEntity.ok(new JwtResponse(token));

        } catch (AuthenticationException e) {
            // Devuelve 401 si las credenciales fallan
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Usuario o contraseña incorrectos");
        }
    }
}