-- Pin's : prix de MON exemplaire (ex. relevé dans les ventes réussies eBay).
ALTER TABLE collection_item ADD COLUMN manual_price NUMERIC(10, 2) CHECK (manual_price >= 0);
