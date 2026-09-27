package com.pinvault.pin;

import org.springframework.data.jpa.domain.Specification;

/** Filtres dynamiques pour la recherche dans le catalogue. */
final class PinSpecifications {

    private PinSpecifications() {
    }

    static Specification<Pin> search(String q, Park park, Edition edition, Integer year) {
        Specification<Pin> spec = (root, query, cb) -> cb.conjunction();
        if (q != null && !q.isBlank()) {
            String like = "%" + q.trim().toLowerCase() + "%";
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("name")), like),
                    cb.like(cb.lower(root.get("characterName")), like),
                    cb.like(cb.lower(root.get("series")), like)));
        }
        if (park != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("park"), park));
        }
        if (edition != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("edition"), edition));
        }
        if (year != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("releaseYear"), year));
        }
        return spec;
    }
}
