package com.pinvault.pokemon;

import java.math.BigDecimal;

/**
 * Langue de la carte. Le coefficient ajuste la cote Cardmarket (toutes langues confondues) :
 * une carte anglaise vaut en général plus qu'une carte italienne ou portugaise.
 * Valeurs indicatives : modifie-les ici selon les prix que tu observes sur Cardmarket.
 */
public enum CardLanguage {
    EN("1.00"),
    FR("0.80"),
    JP("0.70"),
    DE("0.60"),
    IT("0.50"),
    ES("0.50"),
    KO("0.50"),
    PT("0.40"),
    ZH("0.40");

    private final BigDecimal priceFactor;

    CardLanguage(String priceFactor) {
        this.priceFactor = new BigDecimal(priceFactor);
    }

    public BigDecimal priceFactor() {
        return priceFactor;
    }
}
