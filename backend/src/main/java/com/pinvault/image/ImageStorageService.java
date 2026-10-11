package com.pinvault.image;

import com.pinvault.common.BadRequestException;
import com.pinvault.common.NotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.PathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.UUID;
import java.util.regex.Pattern;

/**
 * Stocke les photos de pin's sur disque (en Docker : le volume monté sur /data/uploads).
 * Le format est détecté à partir des premiers octets du fichier, pas de l'extension ni du Content-Type
 * envoyés par le client, et le nom de fichier est toujours généré côté serveur.
 */
@Service
public class ImageStorageService {

    /** Noms générés par {@link #store} : UUID + extension connue. Bloque toute traversée de répertoire. */
    private static final Pattern FILENAME = Pattern.compile("^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}\\.(jpg|png|gif|webp)$");

    private final Path root;

    public ImageStorageService(@Value("${app.upload.dir}") String uploadDir) {
        this.root = Path.of(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(root);
        } catch (IOException e) {
            throw new UncheckedIOException("Impossible de créer le dossier d'upload " + root, e);
        }
    }

    /** Enregistre l'image et renvoie le nom de fichier généré. */
    public String store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Aucun fichier reçu");
        }
        ImageFormat format;
        try (InputStream in = file.getInputStream()) {
            format = ImageFormat.detect(in.readNBytes(12));
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
        if (format == null) {
            throw new BadRequestException("Format non supporté : JPEG, PNG, GIF ou WebP uniquement");
        }

        String filename = UUID.randomUUID() + "." + format.extension;
        try (InputStream in = file.getInputStream()) {
            Files.copy(in, root.resolve(filename), StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new UncheckedIOException("Échec de l'enregistrement de l'image", e);
        }
        return filename;
    }

    public StoredImage load(String filename) {
        if (!FILENAME.matcher(filename).matches()) {
            throw new NotFoundException("Image introuvable");
        }
        Path path = root.resolve(filename);
        if (!Files.isRegularFile(path)) {
            throw new NotFoundException("Image introuvable");
        }
        String ext = filename.substring(filename.lastIndexOf('.') + 1);
        return new StoredImage(new PathResource(path), ImageFormat.fromExtension(ext).mediaType);
    }

    public record StoredImage(Resource resource, MediaType mediaType) {
    }

    enum ImageFormat {
        JPEG("jpg", MediaType.IMAGE_JPEG),
        PNG("png", MediaType.IMAGE_PNG),
        GIF("gif", MediaType.IMAGE_GIF),
        WEBP("webp", MediaType.parseMediaType("image/webp"));

        final String extension;
        final MediaType mediaType;

        ImageFormat(String extension, MediaType mediaType) {
            this.extension = extension;
            this.mediaType = mediaType;
        }

        static ImageFormat fromExtension(String ext) {
            return Arrays.stream(values()).filter(f -> f.extension.equals(ext)).findFirst().orElseThrow();
        }

        /** Reconnaît le format grâce à sa signature (« magic number »). */
        static ImageFormat detect(byte[] h) {
            if (h.length >= 3 && (h[0] & 0xFF) == 0xFF && (h[1] & 0xFF) == 0xD8 && (h[2] & 0xFF) == 0xFF) {
                return JPEG;
            }
            if (h.length >= 8 && (h[0] & 0xFF) == 0x89 && h[1] == 'P' && h[2] == 'N' && h[3] == 'G'
                    && h[4] == 0x0D && h[5] == 0x0A && h[6] == 0x1A && h[7] == 0x0A) {
                return PNG;
            }
            if (h.length >= 4 && h[0] == 'G' && h[1] == 'I' && h[2] == 'F' && h[3] == '8') {
                return GIF;
            }
            if (h.length >= 12 && h[0] == 'R' && h[1] == 'I' && h[2] == 'F' && h[3] == 'F'
                    && h[8] == 'W' && h[9] == 'E' && h[10] == 'B' && h[11] == 'P') {
                return WEBP;
            }
            return null;
        }
    }
}
