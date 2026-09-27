package com.pinvault.pin;

import com.pinvault.collection.CollectionItemRepository;
import com.pinvault.collection.CollectionStatus;
import com.pinvault.common.ForbiddenException;
import com.pinvault.common.NotFoundException;
import com.pinvault.common.PageResponse;
import com.pinvault.pin.PinDtos.PinDetailResponse;
import com.pinvault.pin.PinDtos.PinRequest;
import com.pinvault.pin.PinDtos.PinResponse;
import com.pinvault.user.AppUser;
import com.pinvault.user.AppUserRepository;
import com.pinvault.user.Role;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PinService {

    private final PinRepository pins;
    private final AppUserRepository users;
    private final CollectionItemRepository collectionItems;

    public PinService(PinRepository pins, AppUserRepository users, CollectionItemRepository collectionItems) {
        this.pins = pins;
        this.users = users;
        this.collectionItems = collectionItems;
    }

    @Transactional(readOnly = true)
    public PageResponse<PinResponse> search(String q, Park park, Edition edition, Integer year, Pageable pageable) {
        return PageResponse.of(pins.findAll(PinSpecifications.search(q, park, edition, year), pageable),
                PinResponse::from);
    }

    @Transactional(readOnly = true)
    public PinDetailResponse get(Long id) {
        Pin pin = find(id);
        return new PinDetailResponse(PinResponse.from(pin),
                collectionItems.countDistinctUsersByPinAndStatus(id, CollectionStatus.OWNED),
                collectionItems.countDistinctUsersByPinAndStatus(id, CollectionStatus.WISHLIST),
                collectionItems.countDistinctUsersByPinAndStatus(id, CollectionStatus.FOR_TRADE));
    }

    @Transactional
    public PinResponse create(PinRequest req, String username) {
        Pin pin = new Pin(user(username));
        apply(pin, req);
        return PinResponse.from(pins.save(pin));
    }

    @Transactional
    public PinResponse update(Long id, PinRequest req, String username) {
        Pin pin = find(id);
        checkCanEdit(pin, user(username));
        apply(pin, req);
        return PinResponse.from(pin);
    }

    @Transactional
    public void delete(Long id, String username) {
        Pin pin = find(id);
        checkCanEdit(pin, user(username));
        pins.delete(pin);
    }

    private void checkCanEdit(Pin pin, AppUser user) {
        boolean isAuthor = pin.getCreatedBy() != null && pin.getCreatedBy().getId().equals(user.getId());
        if (!isAuthor && user.getRole() != Role.ADMIN) {
            throw new ForbiddenException("Seul l'auteur de la fiche ou un admin peut la modifier");
        }
    }

    private Pin find(Long id) {
        return pins.findById(id).orElseThrow(() -> new NotFoundException("Pin " + id + " introuvable"));
    }

    private AppUser user(String username) {
        return users.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new NotFoundException("Utilisateur introuvable"));
    }

    private static void apply(Pin pin, PinRequest req) {
        pin.setName(req.name().trim());
        pin.setDescription(req.description());
        pin.setCharacterName(req.characterName());
        pin.setSeries(req.series());
        pin.setPark(req.park());
        pin.setEdition(req.edition());
        pin.setEditionSize(req.editionSize());
        pin.setReleaseYear(req.releaseYear());
        pin.setImageUrl(req.imageUrl() == null || req.imageUrl().isBlank() ? null : req.imageUrl());
    }
}
