package com.pinvault.pokemon;

import com.pinvault.common.ExternalServiceException;
import com.pinvault.pokemon.TcgdexDtos.TcgdexCard;
import com.pinvault.pokemon.TcgdexDtos.TcgdexCardBrief;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

/** Appels HTTP vers l'API publique TCGdex (gratuite, sans clé). */
@Component
public class TcgdexClient {

    private final RestClient http;
    private final String language;

    public TcgdexClient(RestClient.Builder builder,
                        @Value("${app.tcgdex.base-url}") String baseUrl,
                        @Value("${app.tcgdex.language}") String language) {
        var requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(5_000);
        requestFactory.setReadTimeout(10_000);
        this.http = builder.baseUrl(baseUrl).requestFactory(requestFactory).build();
        this.language = language;
    }

    /** Recherche par nom (contient, insensible à la casse). {@code page} commence à 0. */
    public List<TcgdexCardBrief> search(String name, int page, int size) {
        try {
            TcgdexCardBrief[] result = http.get()
                    .uri(uri -> uri.path("/{lang}/cards")
                            .queryParam("name", name)
                            .queryParam("pagination:page", page + 1)
                            .queryParam("pagination:itemsPerPage", size)
                            .build(language))
                    .retrieve()
                    .body(TcgdexCardBrief[].class);
            return result == null ? List.of() : Arrays.asList(result);
        } catch (RestClientException e) {
            throw new ExternalServiceException("La base de cartes TCGdex ne répond pas, réessaie dans un instant", e);
        }
    }

    /** Fiche d'une carte dans la langue configurée (fr). */
    public Optional<TcgdexCard> card(String id) {
        return card(language, id);
    }

    /** Fiche d'une carte dans une langue donnée (sert à récupérer les prix en « en » s'ils manquent en « fr »). */
    public Optional<TcgdexCard> card(String lang, String id) {
        try {
            return Optional.ofNullable(http.get()
                    .uri("/{lang}/cards/{id}", lang, id)
                    .retrieve()
                    .body(TcgdexCard.class));
        } catch (HttpClientErrorException.NotFound e) {
            return Optional.empty();
        } catch (RestClientException e) {
            throw new ExternalServiceException("La base de cartes TCGdex ne répond pas, réessaie dans un instant", e);
        }
    }
}
