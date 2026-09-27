CREATE TABLE app_user (
    id            BIGSERIAL PRIMARY KEY,
    username      VARCHAR(50)  NOT NULL UNIQUE,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(20)  NOT NULL DEFAULT 'USER',
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE pin (
    id             BIGSERIAL PRIMARY KEY,
    name           VARCHAR(150) NOT NULL,
    description    VARCHAR(2000),
    character_name VARCHAR(100),
    series         VARCHAR(150),
    park           VARCHAR(40)  NOT NULL,
    edition        VARCHAR(40)  NOT NULL,
    edition_size   INTEGER CHECK (edition_size > 0),
    release_year   INTEGER,
    image_url      VARCHAR(500),
    created_by     BIGINT REFERENCES app_user (id) ON DELETE SET NULL,
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_pin_park ON pin (park);
CREATE INDEX idx_pin_edition ON pin (edition);
CREATE INDEX idx_pin_name_lower ON pin (lower(name));

CREATE TABLE collection_item (
    id       BIGSERIAL PRIMARY KEY,
    user_id  BIGINT      NOT NULL REFERENCES app_user (id) ON DELETE CASCADE,
    pin_id   BIGINT      NOT NULL REFERENCES pin (id) ON DELETE CASCADE,
    status   VARCHAR(20) NOT NULL,
    quantity INTEGER     NOT NULL DEFAULT 1 CHECK (quantity > 0),
    note     VARCHAR(500),
    added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uk_collection_user_pin_status UNIQUE (user_id, pin_id, status)
);

CREATE INDEX idx_collection_user ON collection_item (user_id);
CREATE INDEX idx_collection_pin ON collection_item (pin_id);
