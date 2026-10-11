package com.pinvault;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pinvault.pokemon.TcgdexClient;
import com.pinvault.pokemon.TcgdexDtos.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Partie Pokémon : l'API TCGdex est simulée pour que les tests tournent sans Internet. */
@SpringBootTest(properties = "app.upload.dir=target/test-uploads")
@AutoConfigureMockMvc
@Testcontainers
class PokemonIntegrationTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @Autowired
    MockMvc mvc;

    @Autowired
    ObjectMapper json;

    @MockBean
    TcgdexClient tcgdex;

    private static final String CARD_ID = "swsh3-136";
    /** Utilisée par un seul test : la base est partagée entre les tests, donc les autres ont déjà mis CARD_ID en cache. */
    private static final String CACHE_TEST_ID = "swsh3-cache";

    @BeforeEach
    void fakeTcgdex() {
        var card = new TcgdexCard(CARD_ID, "136", "Fouinar", "https://assets.tcgdex.net/fr/swsh/swsh3/136",
                "Pokemon", "tetsuya koizumi", "Peu Commune",
                new TcgdexSet("swsh3", "Ténèbres Embrasées", new TcgdexCardCount(189, 201)),
                new TcgdexVariants(true, true, false, false),
                new TcgdexPricing(new TcgdexCardmarket("2026-10-01T00:00:00.000Z", 0.30, 0.02, 0.25, 1.20, 1.10)));
        when(tcgdex.card(CARD_ID)).thenReturn(Optional.of(card));
        when(tcgdex.card(CACHE_TEST_ID)).thenReturn(Optional.of(card));
        when(tcgdex.card(eq("unknown-1"))).thenReturn(Optional.empty());
        when(tcgdex.search(anyString(), anyInt(), anyInt()))
                .thenReturn(List.of(new TcgdexCardBrief(CARD_ID, "136", "Fouinar", card.image())));
    }

    @Test
    void searchIsPublicAndNeedsTwoCharacters() throws Exception {
        mvc.perform(get("/api/pokemon/cards").param("q", "fouinar"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(CARD_ID))
                .andExpect(jsonPath("$.hasMore").value(false));

        mvc.perform(get("/api/pokemon/cards").param("q", "f"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isEmpty());
    }

    @Test
    void cardDetailIsCachedLocally() throws Exception {
        mvc.perform(get("/api/pokemon/cards/" + CACHE_TEST_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Fouinar"))
                .andExpect(jsonPath("$.setName").value("Ténèbres Embrasées"))
                .andExpect(jsonPath("$.variants.reverse").value(true))
                .andExpect(jsonPath("$.prices.trend").value(0.25));

        mvc.perform(get("/api/pokemon/cards/" + CACHE_TEST_ID)).andExpect(status().isOk());
        verify(tcgdex, times(1)).card(CACHE_TEST_ID);

        mvc.perform(get("/api/pokemon/cards/unknown-1")).andExpect(status().isNotFound());
    }

    @Test
    void addGradedReverseCardWithMarketValue() throws Exception {
        String token = register("sacha", "sacha@example.com");
        String body = """
                {"cardId":"%s","status":"OWNED","quantity":2,"condition":"MINT","variant":"REVERSE",
                 "language":"FR","gradingCompany":"PSA","grade":9.5,"note":"Boîte 1"}
                """.formatted(CARD_ID);

        mvc.perform(post("/api/me/pokemon")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.card.name").value("Fouinar"))
                .andExpect(jsonPath("$.variant").value("REVERSE"))
                .andExpect(jsonPath("$.grade").value(9.5))
                .andExpect(jsonPath("$.unitPrice").value(1.2))   // cote « holo » pour une reverse
                .andExpect(jsonPath("$.totalPrice").value(2.4));

        mvc.perform(get("/api/users/sacha/pokemon"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].gradingCompany").value("PSA"));
    }

    @Test
    void gradingNeedsCompanyAndGrade() throws Exception {
        String token = register("ondine", "ondine@example.com");
        String body = "{\"cardId\":\"%s\",\"status\":\"OWNED\",\"gradingCompany\":\"PSA\"}".formatted(CARD_ID);

        mvc.perform(post("/api/me/pokemon")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isBadRequest());
    }

    @Test
    void onlyOwnerCanEditItem() throws Exception {
        String red = register("red", "red@example.com");
        String blue = register("blue", "blue@example.com");
        String body = "{\"cardId\":\"%s\",\"status\":\"WISHLIST\"}".formatted(CARD_ID);

        long id = json.readTree(mvc.perform(post("/api/me/pokemon")
                        .header("Authorization", "Bearer " + red)
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.condition").value("NEAR_MINT"))   // valeurs par défaut
                .andExpect(jsonPath("$.language").value("FR"))
                .andReturn().getResponse().getContentAsString()).get("id").asLong();

        mvc.perform(put("/api/me/pokemon/" + id)
                        .header("Authorization", "Bearer " + blue)
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isForbidden());

        mvc.perform(delete("/api/me/pokemon/" + id).header("Authorization", "Bearer " + red))
                .andExpect(status().isNoContent());
    }

    private String register(String username, String email) throws Exception {
        String body = "{\"username\":\"%s\",\"email\":\"%s\",\"password\":\"motdepasse123\"}".formatted(username, email);
        String res = mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return json.readTree(res).get("token").asText();
    }
}
