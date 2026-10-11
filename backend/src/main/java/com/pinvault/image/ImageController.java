package com.pinvault.image;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/images")
public class ImageController {

    private final ImageStorageService storage;

    public ImageController(ImageStorageService storage) {
        this.storage = storage;
    }

    /** Upload d'une photo (utilisateur connecté). Renvoie l'URL à mettre dans le champ imageUrl d'un pin. */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public UploadResponse upload(@RequestParam("file") MultipartFile file) {
        return new UploadResponse("/api/images/" + storage.store(file));
    }

    /** Lecture publique d'une photo. Les noms étant uniques et jamais réécrits, le cache peut être très long. */
    @GetMapping("/{filename:.+}")
    public ResponseEntity<Resource> get(@PathVariable String filename) {
        var image = storage.load(filename);
        return ResponseEntity.ok()
                .contentType(image.mediaType())
                .header(HttpHeaders.CACHE_CONTROL, "public, max-age=31536000, immutable")
                .body(image.resource());
    }

    public record UploadResponse(String url) {
    }
}
