-- Cartes Pokémon : copie locale (cache) des fiches TCGdex, rafraîchie régulièrement pour les prix.
CREATE TABLE pokemon_card (
    id                VARCHAR(50)  PRIMARY KEY,          -- identifiant TCGdex, ex. "swsh3-136"
    local_id          VARCHAR(20)  NOT NULL,             -- numéro dans la série
    name              VARCHAR(150) NOT NULL,
    category          VARCHAR(20),
    rarity            VARCHAR(80),
    illustrator       VARCHAR(150),
    image_url         VARCHAR(300),                      -- URL de base, + "/high.webp" ou "/low.webp"
    set_id            VARCHAR(50),
    set_name          VARCHAR(150),
    set_card_count    INTEGER,
    has_normal        BOOLEAN      NOT NULL DEFAULT FALSE,
    has_reverse       BOOLEAN      NOT NULL DEFAULT FALSE,
    has_holo          BOOLEAN      NOT NULL DEFAULT FALSE,
    has_first_edition BOOLEAN      NOT NULL DEFAULT FALSE,
    price_trend       NUMERIC(10, 2),                    -- Cardmarket, en euros
    price_avg         NUMERIC(10, 2),
    price_low         NUMERIC(10, 2),
    price_trend_holo  NUMERIC(10, 2),
    price_updated_at  TIMESTAMPTZ,
    fetched_at        TIMESTAMPTZ  NOT NULL
);

CREATE INDEX idx_pokemon_card_name_lower ON pokemon_card (lower(name));

-- Cartes dans la collection d'un membre. Pas de contrainte d'unicité : on peut avoir
-- la même carte plusieurs fois avec un état, une variante ou une gradation différents.
CREATE TABLE card_collection_item (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT       NOT NULL REFERENCES app_user (id) ON DELETE CASCADE,
    card_id         VARCHAR(50)  NOT NULL REFERENCES pokemon_card (id),
    status          VARCHAR(20)  NOT NULL,
    quantity        INTEGER      NOT NULL DEFAULT 1 CHECK (quantity > 0),
    card_condition  VARCHAR(20)  NOT NULL,
    variant         VARCHAR(20)  NOT NULL,
    language        VARCHAR(5)   NOT NULL,
    grading_company VARCHAR(20),
    grade           NUMERIC(3, 1) CHECK (grade BETWEEN 1 AND 10),
    note            VARCHAR(500),
    added_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT ck_card_grading CHECK ((grading_company IS NULL) = (grade IS NULL))
);

CREATE INDEX idx_card_collection_user ON card_collection_item (user_id);
CREATE INDEX idx_card_collection_card ON card_collection_item (card_id);
