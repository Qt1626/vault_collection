package com.pinvault.collection;

import com.pinvault.collection.CollectionDtos.AddItemRequest;
import com.pinvault.collection.CollectionDtos.CollectionItemResponse;
import com.pinvault.collection.CollectionDtos.UpdateItemRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class CollectionController {

    private final CollectionService collectionService;

    public CollectionController(CollectionService collectionService) {
        this.collectionService = collectionService;
    }

    /** Ma collection (authentifié). */
    @GetMapping("/me/collection")
    public List<CollectionItemResponse> myCollection(@AuthenticationPrincipal UserDetails user,
                                                     @RequestParam(required = false) CollectionStatus status) {
        return collectionService.list(user.getUsername(), status);
    }

    @PostMapping("/me/collection")
    @ResponseStatus(HttpStatus.CREATED)
    public CollectionItemResponse add(@AuthenticationPrincipal UserDetails user,
                                      @Valid @RequestBody AddItemRequest req) {
        return collectionService.add(user.getUsername(), req);
    }

    @PatchMapping("/me/collection/{itemId}")
    public CollectionItemResponse update(@AuthenticationPrincipal UserDetails user, @PathVariable Long itemId,
                                         @Valid @RequestBody UpdateItemRequest req) {
        return collectionService.update(user.getUsername(), itemId, req);
    }

    @DeleteMapping("/me/collection/{itemId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remove(@AuthenticationPrincipal UserDetails user, @PathVariable Long itemId) {
        collectionService.remove(user.getUsername(), itemId);
    }

    /** Collection publique d'un autre membre. */
    @GetMapping("/users/{username}/collection")
    public List<CollectionItemResponse> userCollection(@PathVariable String username,
                                                       @RequestParam(required = false) CollectionStatus status) {
        return collectionService.list(username, status);
    }
}
