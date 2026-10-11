package com.pinvault.pokemon;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

/** Format JSON renvoyé par l'API TCGdex (https://tcgdex.dev). Seuls les champs utiles sont lus. */
public final class TcgdexDtos {

    private TcgdexDtos() {
    }

    /** Élément d'une liste de cartes (/cards). */
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record TcgdexCardBrief(String id, String localId, String name, String image) {
    }

    /** Fiche complète d'une carte (/cards/{id}). */
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record TcgdexCard(
            String id,
            String localId,
            String name,
            String image,
            String category,
            String illustrator,
            String rarity,
            TcgdexSet set,
            TcgdexVariants variants,
            TcgdexPricing pricing) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record TcgdexSet(String id, String name, TcgdexCardCount cardCount) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record TcgdexCardCount(Integer official, Integer total) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record TcgdexVariants(Boolean normal, Boolean reverse, Boolean holo, Boolean firstEdition) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record TcgdexPricing(TcgdexCardmarket cardmarket) {
    }

    /** Cotes Cardmarket, en euros. Les champs « -holo » concernent les versions brillantes. */
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record TcgdexCardmarket(
            String updated,
            Double avg,
            Double low,
            Double trend,
            @JsonProperty("trend-holo") Double trendHolo,
            @JsonProperty("avg-holo") Double avgHolo) {
    }
}
