package com.pinvault.pin;

import jakarta.validation.constraints.*;

import java.time.Instant;

public final class PinDtos {

    private PinDtos() {
    }

    public record PinRequest(
            @NotBlank @Size(max = 150) String name,
            @Size(max = 2000) String description,
            @Size(max = 100) String characterName,
            @Size(max = 150) String series,
            @NotNull Park park,
            @NotNull Edition edition,
            @Positive Integer editionSize,
            @Min(1955) @Max(2100) Integer releaseYear,
            @Size(max = 500)
            @Pattern(regexp = "^(https?://\\S+|/api/images/[0-9a-f-]{36}\\.(jpg|png|gif|webp))?$",
                    message = "doit être une URL http(s) ou une image envoyée sur PinVault")
            String imageUrl) {
    }

    public record PinResponse(
            Long id,
            String name,
            String description,
            String characterName,
            String series,
            Park park,
            Edition edition,
            Integer editionSize,
            Integer releaseYear,
            String imageUrl,
            String createdBy,
            Instant createdAt) {

        public static PinResponse from(Pin p) {
            return new PinResponse(p.getId(), p.getName(), p.getDescription(), p.getCharacterName(),
                    p.getSeries(), p.getPark(), p.getEdition(), p.getEditionSize(), p.getReleaseYear(),
                    p.getImageUrl(), p.getCreatedBy() == null ? null : p.getCreatedBy().getUsername(),
                    p.getCreatedAt());
        }
    }

    /** Détail d'un pin avec statistiques communautaires. */
    public record PinDetailResponse(PinResponse pin, long owners, long wishlisted, long forTrade) {
    }
}
