package com.pinvault.pokemon;

import com.pinvault.collection.CollectionStatus;
import com.pinvault.common.BadRequestException;
import com.pinvault.common.ExternalServiceException;
import com.pinvault.common.ForbiddenException;
import com.pinvault.common.NotFoundException;
import com.pinvault.pokemon.PokemonDtos.CardBrief;
import com.pinvault.pokemon.PokemonDtos.CardItemRequest;
import com.pinvault.pokemon.PokemonDtos.CardItemResponse;
import com.pinvault.pokemon.PokemonDtos.CardResponse;
import com.pinvault.pokemon.PokemonDtos.CardSearchResponse;
import com.pinvault.pokemon.PokemonDtos.PriceSource;
import com.pinvault.pokemon.TcgdexDtos.TcgdexCard;
import com.pinvault.pokemon.TcgdexDtos.TcgdexCardmarket;
import com.pinvault.user.AppUser;
import com.pinvault.user.AppUserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;

@Service
public class PokemonService {

    static final int PAGE_SIZE = 24;
    /** Au-delà, la fiche (et donc la cote) est rechargée depuis TCGdex. */
    static final Duration REFRESH_AFTER = Duration.ofHours(24);
    private static final Pattern CARD_ID = Pattern.compile("^[A-Za-z0-9._-]{1,50}$");

    private final TcgdexClient tcgdex;
    private final PokemonCardRepository cards;
    private final CardCollectionItemRepository items;
    private final AppUserRepository users;

    public PokemonService(TcgdexClient tcgdex, PokemonCardRepository cards,
                          CardCollectionItemRepository items, AppUserRepository users) {
        this.tcgdex = tcgdex;
        this.cards = cards;
        this.items = items;
        this.users = users;
    }

    // ---------- Catalogue (TCGdex) ----------

    public CardSearchResponse search(String query, int page) {
        String q = query == null ? "" : query.trim();
        if (q.length() < 2) {
            return new CardSearchResponse(List.of(), 0, false);
        }
        int p = Math.max(page, 0);
        var briefs = tcgdex.search(q, p, PAGE_SIZE).stream()
                .map(b -> new CardBrief(b.id(), b.localId(), b.name(), b.image()))
                .toList();
        return new CardSearchResponse(briefs, p, briefs.size() == PAGE_SIZE);
    }

    @Transactional
    public CardResponse getCard(String id) {
        return CardResponse.from(getOrFetch(id));
    }

    /**
     * Renvoie la fiche depuis la base si elle est récente, sinon la (re)charge depuis TCGdex.
     * Si TCGdex est injoignable, on se contente de la copie locale quand elle existe.
     */
    PokemonCard getOrFetch(String id) {
        if (id == null || !CARD_ID.matcher(id).matches()) {
            throw new NotFoundException("Carte introuvable");
        }
        Optional<PokemonCard> cached = cards.findById(id);
        Instant now = Instant.now();
        if (cached.isPresent() && cached.get().getFetchedAt().isAfter(now.minus(REFRESH_AFTER))) {
            return cached.get();
        }
        try {
            Optional<TcgdexCard> remote = tcgdex.card(id);
            if (remote.isEmpty()) {
                return cached.orElseThrow(() -> new NotFoundException("Carte " + id + " introuvable"));
            }
            TcgdexCard data = remote.get();
            // Les prix sont parfois absents de la fiche française : on tente la fiche anglaise.
            TcgdexCardmarket market = cardmarket(data);
            if (market == null) {
                market = tcgdex.card("en", id).map(PokemonService::cardmarket).orElse(null);
            }
            PokemonCard card = cached.orElseGet(() -> new PokemonCard(id));
            apply(card, data, market, now);
            return cards.save(card);
        } catch (ExternalServiceException e) {
            if (cached.isPresent()) {
                return cached.get();
            }
            throw e;
        }
    }

    private static TcgdexCardmarket cardmarket(TcgdexCard c) {
        return c.pricing() == null ? null : c.pricing().cardmarket();
    }

    private static void apply(PokemonCard card, TcgdexCard data, TcgdexCardmarket market, Instant now) {
        card.setLocalId(data.localId() == null ? "?" : truncate(data.localId(), 20));
        card.setName(truncate(data.name() == null ? data.id() : data.name(), 150));
        card.setCategory(truncate(data.category(), 20));
        card.setRarity(truncate(data.rarity(), 80));
        card.setIllustrator(truncate(data.illustrator(), 150));
        card.setImageUrl(truncate(data.image(), 300));
        if (data.set() != null) {
            card.setSetId(truncate(data.set().id(), 50));
            card.setSetName(truncate(data.set().name(), 150));
            card.setSetCardCount(data.set().cardCount() == null ? null : data.set().cardCount().official());
        }
        var v = data.variants();
        card.setHasNormal(v != null && Boolean.TRUE.equals(v.normal()));
        card.setHasReverse(v != null && Boolean.TRUE.equals(v.reverse()));
        card.setHasHolo(v != null && Boolean.TRUE.equals(v.holo()));
        card.setHasFirstEdition(v != null && Boolean.TRUE.equals(v.firstEdition()));
        card.setPriceTrend(market == null ? null : money(market.trend()));
        card.setPriceAvg(market == null ? null : money(market.avg()));
        card.setPriceLow(market == null ? null : money(market.low()));
        card.setPriceTrendHolo(market == null ? null : money(market.trendHolo()));
        card.setPriceUpdatedAt(market == null ? null : parseInstant(market.updated()));
        card.setFetchedAt(now);
    }

    private static BigDecimal money(Double value) {
        return value == null || value <= 0 ? null : BigDecimal.valueOf(value).setScale(2, RoundingMode.HALF_UP);
    }

    private static Instant parseInstant(String value) {
        if (value == null) {
            return null;
        }
        try {
            return OffsetDateTime.parse(value).toInstant();
        } catch (DateTimeParseException e) {
            return null;
        }
    }

    private static String truncate(String value, int max) {
        return value == null || value.length() <= max ? value : value.substring(0, max);
    }

    // ---------- Collection ----------

    @Transactional(readOnly = true)
    public List<CardItemResponse> list(String username, CollectionStatus status) {
        if (!users.existsByUsernameIgnoreCase(username)) {
            throw new NotFoundException("Utilisateur introuvable");
        }
        var result = status == null
                ? items.findByUserUsernameIgnoreCaseOrderByAddedAtDesc(username)
                : items.findByUserUsernameIgnoreCaseAndStatusOrderByAddedAtDesc(username, status);
        return result.stream().map(PokemonService::toResponse).toList();
    }

    @Transactional
    public CardItemResponse add(String username, CardItemRequest req) {
        AppUser user = users.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new NotFoundException("Utilisateur introuvable"));
        CardCollectionItem item = new CardCollectionItem(user, getOrFetch(req.cardId()));
        apply(item, req);
        return toResponse(items.save(item));
    }

    @Transactional
    public CardItemResponse update(String username, Long itemId, CardItemRequest req) {
        CardCollectionItem item = owned(username, itemId);
        apply(item, req);
        return toResponse(item);
    }

    @Transactional
    public void remove(String username, Long itemId) {
        items.delete(owned(username, itemId));
    }

    private CardCollectionItem owned(String username, Long itemId) {
        CardCollectionItem item = items.findById(itemId)
                .orElseThrow(() -> new NotFoundException("Carte introuvable dans ta collection"));
        if (!item.getUser().getUsername().equalsIgnoreCase(username)) {
            throw new ForbiddenException("Cette carte ne t'appartient pas");
        }
        return item;
    }

    private static void apply(CardCollectionItem item, CardItemRequest req) {
        if ((req.gradingCompany() == null) != (req.grade() == null)) {
            throw new BadRequestException(
                    "Pour une carte gradée, indique la société ET la note ; sinon laisse les deux vides");
        }
        item.setStatus(req.status());
        item.setQuantity(req.quantity() == null ? 1 : req.quantity());
        item.setCondition(req.condition() == null ? CardCondition.NEAR_MINT : req.condition());
        item.setVariant(req.variant() == null ? CardVariant.NORMAL : req.variant());
        item.setLanguage(req.language() == null ? CardLanguage.FR : req.language());
        item.setGradingCompany(req.gradingCompany());
        item.setGrade(req.grade() == null ? null : req.grade().setScale(1, RoundingMode.HALF_UP));
        item.setNote(req.note() == null || req.note().isBlank() ? null : req.note().trim());
        item.setManualPrice(req.manualPrice() == null ? null : req.manualPrice().setScale(2, RoundingMode.HALF_UP));
    }

    /**
     * Estimation d'un exemplaire : cote Cardmarket de la variante (qui mélange langues et états)
     * × coefficient de langue × coefficient d'état. Cardmarket ne propose plus d'API ouverte,
     * donc les prix par langue et par état ne sont pas disponibles directement.
     */
    static BigDecimal estimate(BigDecimal marketPrice, CardLanguage language, CardCondition condition) {
        if (marketPrice == null) {
            return null;
        }
        return marketPrice.multiply(language.priceFactor()).multiply(condition.priceFactor())
                .setScale(2, RoundingMode.HALF_UP);
    }

    private static CardItemResponse toResponse(CardCollectionItem i) {
        BigDecimal market = i.getCard().marketPrice(i.getVariant());
        BigDecimal estimated = estimate(market, i.getLanguage(), i.getCondition());
        BigDecimal unit = i.getManualPrice() != null ? i.getManualPrice() : estimated;
        BigDecimal total = unit == null ? null : unit.multiply(BigDecimal.valueOf(i.getQuantity()));
        PriceSource source = i.getManualPrice() != null ? PriceSource.MANUAL
                : estimated != null ? PriceSource.ESTIMATE : null;
        return new CardItemResponse(i.getId(), CardResponse.from(i.getCard()), i.getStatus(), i.getQuantity(),
                i.getCondition(), i.getVariant(), i.getLanguage(), i.getGradingCompany(), i.getGrade(),
                i.getNote(), market, estimated, i.getManualPrice(), unit, total, source, i.getAddedAt());
    }
}
