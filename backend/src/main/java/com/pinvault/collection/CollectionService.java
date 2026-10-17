package com.pinvault.collection;

import com.pinvault.collection.CollectionDtos.AddItemRequest;
import com.pinvault.collection.CollectionDtos.CollectionItemResponse;
import com.pinvault.collection.CollectionDtos.UpdateItemRequest;
import com.pinvault.common.ConflictException;
import com.pinvault.common.ForbiddenException;
import com.pinvault.common.NotFoundException;
import com.pinvault.pin.PinDtos.PinResponse;
import com.pinvault.pin.PinRepository;
import com.pinvault.user.AppUser;
import com.pinvault.user.AppUserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CollectionService {

    private final CollectionItemRepository items;
    private final PinRepository pins;
    private final AppUserRepository users;

    public CollectionService(CollectionItemRepository items, PinRepository pins, AppUserRepository users) {
        this.items = items;
        this.pins = pins;
        this.users = users;
    }

    @Transactional(readOnly = true)
    public List<CollectionItemResponse> list(String username, CollectionStatus status) {
        if (!users.existsByUsernameIgnoreCase(username)) {
            throw new NotFoundException("Utilisateur introuvable");
        }
        var result = status == null
                ? items.findByUserUsernameIgnoreCaseOrderByAddedAtDesc(username)
                : items.findByUserUsernameIgnoreCaseAndStatusOrderByAddedAtDesc(username, status);
        return result.stream().map(CollectionService::toResponse).toList();
    }

    @Transactional
    public CollectionItemResponse add(String username, AddItemRequest req) {
        AppUser user = user(username);
        var pin = pins.findById(req.pinId())
                .orElseThrow(() -> new NotFoundException("Pin " + req.pinId() + " introuvable"));
        items.findByUserIdAndPinIdAndStatus(user.getId(), pin.getId(), req.status()).ifPresent(existing -> {
            throw new ConflictException("Ce pin est déjà dans cette liste");
        });
        int quantity = req.quantity() == null ? 1 : req.quantity();
        CollectionItem item = new CollectionItem(user, pin, req.status(), quantity, blankToNull(req.note()));
        item.setDefect(blankToNull(req.defect()));
        item.setBackingCard(req.backingCard());
        return toResponse(items.save(item));
    }

    @Transactional
    public CollectionItemResponse update(String username, Long itemId, UpdateItemRequest req) {
        CollectionItem item = owned(username, itemId);
        item.setQuantity(req.quantity());
        item.setNote(blankToNull(req.note()));
        item.setDefect(blankToNull(req.defect()));
        item.setBackingCard(req.backingCard());
        return toResponse(item);
    }

    @Transactional
    public void remove(String username, Long itemId) {
        items.delete(owned(username, itemId));
    }

    private CollectionItem owned(String username, Long itemId) {
        CollectionItem item = items.findById(itemId)
                .orElseThrow(() -> new NotFoundException("Élément introuvable"));
        if (!item.getUser().getUsername().equalsIgnoreCase(username)) {
            throw new ForbiddenException("Cet élément ne t'appartient pas");
        }
        return item;
    }

    private AppUser user(String username) {
        return users.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new NotFoundException("Utilisateur introuvable"));
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private static CollectionItemResponse toResponse(CollectionItem c) {
        return new CollectionItemResponse(c.getId(), PinResponse.from(c.getPin()), c.getStatus(),
                c.getQuantity(), c.getNote(), c.getDefect(), c.getBackingCard(), c.getAddedAt());
    }
}
