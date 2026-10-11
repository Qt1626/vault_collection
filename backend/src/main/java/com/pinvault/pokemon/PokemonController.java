package com.pinvault.pokemon;

import com.pinvault.collection.CollectionStatus;
import com.pinvault.pokemon.PokemonDtos.CardItemRequest;
import com.pinvault.pokemon.PokemonDtos.CardItemResponse;
import com.pinvault.pokemon.PokemonDtos.CardResponse;
import com.pinvault.pokemon.PokemonDtos.CardSearchResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class PokemonController {

    private final PokemonService pokemon;

    public PokemonController(PokemonService pokemon) {
        this.pokemon = pokemon;
    }

    /** Recherche de cartes par nom dans la base TCGdex (public). */
    @GetMapping("/pokemon/cards")
    public CardSearchResponse search(@RequestParam(defaultValue = "") String q,
                                     @RequestParam(defaultValue = "0") int page) {
        return pokemon.search(q, page);
    }

    /** Fiche d'une carte avec sa cote Cardmarket (public). */
    @GetMapping("/pokemon/cards/{id}")
    public CardResponse card(@PathVariable String id) {
        return pokemon.getCard(id);
    }

    @GetMapping("/me/pokemon")
    public List<CardItemResponse> myCards(@AuthenticationPrincipal UserDetails user,
                                          @RequestParam(required = false) CollectionStatus status) {
        return pokemon.list(user.getUsername(), status);
    }

    @PostMapping("/me/pokemon")
    @ResponseStatus(HttpStatus.CREATED)
    public CardItemResponse add(@AuthenticationPrincipal UserDetails user, @Valid @RequestBody CardItemRequest req) {
        return pokemon.add(user.getUsername(), req);
    }

    @PutMapping("/me/pokemon/{itemId}")
    public CardItemResponse update(@AuthenticationPrincipal UserDetails user, @PathVariable Long itemId,
                                   @Valid @RequestBody CardItemRequest req) {
        return pokemon.update(user.getUsername(), itemId, req);
    }

    @DeleteMapping("/me/pokemon/{itemId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remove(@AuthenticationPrincipal UserDetails user, @PathVariable Long itemId) {
        pokemon.remove(user.getUsername(), itemId);
    }

    /** Collection de cartes publique d'un membre. */
    @GetMapping("/users/{username}/pokemon")
    public List<CardItemResponse> userCards(@PathVariable String username,
                                            @RequestParam(required = false) CollectionStatus status) {
        return pokemon.list(username, status);
    }
}
