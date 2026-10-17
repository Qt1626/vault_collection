-- Pin's : état de MON exemplaire (défaut éventuel, avec ou sans le carton d'origine).
ALTER TABLE collection_item ADD COLUMN defect VARCHAR(500);
ALTER TABLE collection_item ADD COLUMN backing_card BOOLEAN;   -- NULL = non précisé

-- Cartes Pokémon : prix saisi par le membre (prioritaire sur l'estimation automatique).
ALTER TABLE card_collection_item ADD COLUMN manual_price NUMERIC(10, 2) CHECK (manual_price >= 0);
