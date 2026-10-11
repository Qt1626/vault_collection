package com.pinvault.pokemon;

public enum CardVariant {
    NORMAL,
    REVERSE,
    HOLO,
    FIRST_EDITION;

    /** Variantes brillantes : leur cote Cardmarket est la cote « holo ». */
    public boolean isFoil() {
        return this == REVERSE || this == HOLO;
    }
}
