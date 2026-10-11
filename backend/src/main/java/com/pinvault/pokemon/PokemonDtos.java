package com.pinvault.pokemon;

import com.pinvault.collection.CollectionStatus;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public final class PokemonDtos {

    private PokemonDtos() {
    }

    /** Résultat de recherche. TCGdex ne donne pas le total, d'où {@code hasMore}. */
    public record CardSearchResponse(List<CardBrief> content, int page, boolean hasMore) {
    }

    /** {@code imageUrl} est une URL de base : ajouter "/low.webp" ou "/high.webp". */
    public record CardBrief(String id, String localId, String name, String imageUrl) {
    }

    public record CardVariants(boolean normal, boolean reverse, boolean holo, boolean firstEdition) {
    }

    /** Cotes Cardmarket en euros (null si inconnues). */
    public record CardPrices(BigDecimal trend, BigDecimal avg, BigDecimal low, BigDecimal trendHolo, Instant updatedAt) {
    }

    public record CardResponse(
            String id,
            String localId,
            String name,
            String category,
            String rarity,
            String illustrator,
            String imageUrl,
            String setId,
            String setName,
            Integer setCardCount,
            CardVariants variants,
            CardPrices prices) {

        static CardResponse from(PokemonCard c) {
            boolean hasPrice = c.getPriceTrend() != null || c.getPriceAvg() != null || c.getPriceTrendHolo() != null;
            return new CardResponse(c.getId(), c.getLocalId(), c.getName(), c.getCategory(), c.getRarity(),
                    c.getIllustrator(), c.getImageUrl(), c.getSetId(), c.getSetName(), c.getSetCardCount(),
                    new CardVariants(c.isHasNormal(), c.isHasReverse(), c.isHasHolo(), c.isHasFirstEdition()),
                    hasPrice ? new CardPrices(c.getPriceTrend(), c.getPriceAvg(), c.getPriceLow(),
                            c.getPriceTrendHolo(), c.getPriceUpdatedAt()) : null);
        }
    }

    /**
     * Ajout ou modification d'une carte de la collection. Une carte gradée a une société ET une note ;
     * une carte non gradée n'a ni l'une ni l'autre. Les champs facultatifs ont une valeur par défaut.
     */
    public record CardItemRequest(
            @NotBlank @Size(max = 50) String cardId,
            @NotNull CollectionStatus status,
            @Min(1) @Max(999) Integer quantity,
            CardCondition condition,
            CardVariant variant,
            CardLanguage language,
            GradingCompany gradingCompany,
            @DecimalMin("1.0") @DecimalMax("10.0") @Digits(integer = 2, fraction = 1) BigDecimal grade,
            @Size(max = 500) String note) {
    }

    public record CardItemResponse(
            Long id,
            CardResponse card,
            CollectionStatus status,
            int quantity,
            CardCondition condition,
            CardVariant variant,
            CardLanguage language,
            GradingCompany gradingCompany,
            BigDecimal grade,
            String note,
            /* Cote Cardmarket unitaire d'une carte non gradée dans cette variante (null si inconnue). */
            BigDecimal unitPrice,
            BigDecimal totalPrice,
            Instant addedAt) {
    }
}
