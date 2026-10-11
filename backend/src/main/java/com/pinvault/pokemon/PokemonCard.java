package com.pinvault.pokemon;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;

/** Copie locale d'une fiche TCGdex. L'identifiant est celui de TCGdex (ex. "swsh3-136"). */
@Entity
@Table(name = "pokemon_card")
public class PokemonCard {

    @Id
    @Column(length = 50)
    private String id;

    @Column(name = "local_id", nullable = false, length = 20)
    private String localId;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 20)
    private String category;

    @Column(length = 80)
    private String rarity;

    @Column(length = 150)
    private String illustrator;

    @Column(name = "image_url", length = 300)
    private String imageUrl;

    @Column(name = "set_id", length = 50)
    private String setId;

    @Column(name = "set_name", length = 150)
    private String setName;

    @Column(name = "set_card_count")
    private Integer setCardCount;

    @Column(name = "has_normal", nullable = false)
    private boolean hasNormal;

    @Column(name = "has_reverse", nullable = false)
    private boolean hasReverse;

    @Column(name = "has_holo", nullable = false)
    private boolean hasHolo;

    @Column(name = "has_first_edition", nullable = false)
    private boolean hasFirstEdition;

    @Column(name = "price_trend", precision = 10, scale = 2)
    private BigDecimal priceTrend;

    @Column(name = "price_avg", precision = 10, scale = 2)
    private BigDecimal priceAvg;

    @Column(name = "price_low", precision = 10, scale = 2)
    private BigDecimal priceLow;

    @Column(name = "price_trend_holo", precision = 10, scale = 2)
    private BigDecimal priceTrendHolo;

    @Column(name = "price_updated_at")
    private Instant priceUpdatedAt;

    @Column(name = "fetched_at", nullable = false)
    private Instant fetchedAt;

    protected PokemonCard() {
    }

    public PokemonCard(String id) {
        this.id = id;
    }

    /**
     * Cote unitaire Cardmarket adaptée à la variante : cote « holo » pour les reverse et holo,
     * cote normale sinon. Renvoie null si TCGdex ne connaît pas de prix pour cette carte.
     */
    public BigDecimal marketPrice(CardVariant variant) {
        if (variant != null && variant.isFoil() && priceTrendHolo != null) {
            return priceTrendHolo;
        }
        if (priceTrend != null) {
            return priceTrend;
        }
        return priceAvg;
    }

    public String getId() { return id; }
    public String getLocalId() { return localId; }
    public String getName() { return name; }
    public String getCategory() { return category; }
    public String getRarity() { return rarity; }
    public String getIllustrator() { return illustrator; }
    public String getImageUrl() { return imageUrl; }
    public String getSetId() { return setId; }
    public String getSetName() { return setName; }
    public Integer getSetCardCount() { return setCardCount; }
    public boolean isHasNormal() { return hasNormal; }
    public boolean isHasReverse() { return hasReverse; }
    public boolean isHasHolo() { return hasHolo; }
    public boolean isHasFirstEdition() { return hasFirstEdition; }
    public BigDecimal getPriceTrend() { return priceTrend; }
    public BigDecimal getPriceAvg() { return priceAvg; }
    public BigDecimal getPriceLow() { return priceLow; }
    public BigDecimal getPriceTrendHolo() { return priceTrendHolo; }
    public Instant getPriceUpdatedAt() { return priceUpdatedAt; }
    public Instant getFetchedAt() { return fetchedAt; }

    public void setLocalId(String localId) { this.localId = localId; }
    public void setName(String name) { this.name = name; }
    public void setCategory(String category) { this.category = category; }
    public void setRarity(String rarity) { this.rarity = rarity; }
    public void setIllustrator(String illustrator) { this.illustrator = illustrator; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public void setSetId(String setId) { this.setId = setId; }
    public void setSetName(String setName) { this.setName = setName; }
    public void setSetCardCount(Integer setCardCount) { this.setCardCount = setCardCount; }
    public void setHasNormal(boolean hasNormal) { this.hasNormal = hasNormal; }
    public void setHasReverse(boolean hasReverse) { this.hasReverse = hasReverse; }
    public void setHasHolo(boolean hasHolo) { this.hasHolo = hasHolo; }
    public void setHasFirstEdition(boolean hasFirstEdition) { this.hasFirstEdition = hasFirstEdition; }
    public void setPriceTrend(BigDecimal priceTrend) { this.priceTrend = priceTrend; }
    public void setPriceAvg(BigDecimal priceAvg) { this.priceAvg = priceAvg; }
    public void setPriceLow(BigDecimal priceLow) { this.priceLow = priceLow; }
    public void setPriceTrendHolo(BigDecimal priceTrendHolo) { this.priceTrendHolo = priceTrendHolo; }
    public void setPriceUpdatedAt(Instant priceUpdatedAt) { this.priceUpdatedAt = priceUpdatedAt; }
    public void setFetchedAt(Instant fetchedAt) { this.fetchedAt = fetchedAt; }
}
