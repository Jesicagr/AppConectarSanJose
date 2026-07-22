package com.conectarsj.backend.controller;

import com.conectarsj.backend.dto.InstagramPostDTO;
import com.conectarsj.backend.service.InstagramScraperService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/instagram")
public class InstagramController {

    private final InstagramScraperService instagramScraperService;

    public InstagramController(InstagramScraperService instagramScraperService) {
        this.instagramScraperService = instagramScraperService;
    }

    @GetMapping("/image/{id}")
    public ResponseEntity<?> getImage(@PathVariable Long id) {
        byte[] image = instagramScraperService.getImageBytes(id);
        if (image != null && image.length > 0) {
            MediaType mediaType = detectImageType(image);
            return ResponseEntity.ok()
                    .contentType(mediaType)
                    .header("Cache-Control", "max-age=86400")
                    .body(image);
        }
        return ResponseEntity.notFound().build();
    }

    private MediaType detectImageType(byte[] bytes) {
        if (bytes.length >= 3 && bytes[0] == (byte) 0xFF && bytes[1] == (byte) 0xD8 && bytes[2] == (byte) 0xFF) {
            return MediaType.IMAGE_JPEG;
        }
        if (bytes.length >= 8 && bytes[0] == (byte) 0x89 && bytes[1] == (byte) 0x50 && bytes[2] == (byte) 0x4E && bytes[3] == (byte) 0x47) {
            return MediaType.IMAGE_PNG;
        }
        if (bytes.length >= 4 && bytes[0] == (byte) 0x52 && bytes[1] == (byte) 0x49 && bytes[2] == (byte) 0x46 && bytes[3] == (byte) 0x46) {
            return MediaType.parseMediaType("image/webp");
        }
        if (bytes.length >= 4 && bytes[0] == (byte) 0x66 && bytes[1] == (byte) 0x74 && bytes[2] == (byte) 0x79 && bytes[3] == (byte) 0x70) {
            return MediaType.parseMediaType("image/heic");
        }
        return MediaType.IMAGE_JPEG;
    }

    @GetMapping("/posts")
    public List<InstagramPostDTO> obtenerTodos() {
        return instagramScraperService.obtenerPosts();
    }

    @GetMapping("/posts/{username}")
    public List<InstagramPostDTO> obtenerPorUsuario(@PathVariable String username) {
        return instagramScraperService.obtenerPostsPorUsuario(username);
    }

    @PostMapping("/refrescar")
    public ResponseEntity<String> refrescar() {
        instagramScraperService.refrescarTodas();
        return ResponseEntity.ok("Refresco iniciado");
    }

    @PostMapping("/refrescar/{username}")
    public ResponseEntity<String> refrescarCuenta(@PathVariable String username) {
        instagramScraperService.refrescarCuenta(username);
        return ResponseEntity.ok("Cuenta " + username + " refrescada");
    }
}
