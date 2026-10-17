package com.pinvault.pokemon;

import java.math.BigDecimal;

/**
 * État de la carte, selon l'échelle de Cardmarket. Le coefficient ajuste la cote Cardmarket
 * (qui mélange tous les états) pour estimer la valeur d'un exemplaire dans cet état.
 * Valeurs indicatives : modifie-les ici si elles ne correspondent pas à ce que tu observes.
 */
public enum CardCondition {
    MINT("1.00"),
    NEAR_MINT("1.00"),
    EXCELLENT("0.85"),
    GOOD("0.70"),
    LIGHT_PLAYED("0.60"),
    PLAYED("0.45"),
    POOR("0.30");

    private final BigDecimal priceFactor;

    CardCondition(String priceFactor) {
        this.priceFactor = new BigDecimal(priceFactor);
    }

    public BigDecimal priceFactor() {
        return priceFactor;
    }
}
