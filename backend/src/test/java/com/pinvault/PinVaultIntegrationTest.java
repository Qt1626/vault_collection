package com.pinvault;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Parcours complet contre une vraie base PostgreSQL lancée par Testcontainers (Docker requis). */
@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
class PinVaultIntegrationTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @Autowired
    MockMvc mvc;

    @Autowired
    ObjectMapper json;

    @Test
    void catalogIsPublicAndSeeded() throws Exception {
        mvc.perform(get("/api/pins"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").isNumber());
    }

    @Test
    void writingRequiresAuthentication() throws Exception {
        mvc.perform(post("/api/pins").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void registerCreatePinAndAddToCollection() throws Exception {
        String token = register("alice", "alice@example.com");

        String pinBody = """
                {"name":"Pin test","park":"DISNEYLAND_PARIS","edition":"LIMITED_EDITION","editionSize":500,"releaseYear":2025}
                """;
        JsonNode pin = json.readTree(mvc.perform(post("/api/pins")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON).content(pinBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.createdBy").value("alice"))
                .andReturn().getResponse().getContentAsString());
        long pinId = pin.get("id").asLong();

        String addBody = "{\"pinId\":" + pinId + ",\"status\":\"OWNED\",\"quantity\":2}";
        mvc.perform(post("/api/me/collection")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON).content(addBody))
                .andExpect(status().isCreated());

        // doublon refusé
        mvc.perform(post("/api/me/collection")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON).content(addBody))
                .andExpect(status().isConflict());

        mvc.perform(get("/api/users/alice/collection"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].pin.id").value(pinId))
                .andExpect(jsonPath("$[0].quantity").value(2));

        mvc.perform(get("/api/pins/" + pinId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.owners").value(1));
    }

    @Test
    void onlyAuthorCanEditPin() throws Exception {
        String bob = register("bob", "bob@example.com");
        String eve = register("eve", "eve@example.com");
        String body = "{\"name\":\"Pin de Bob\",\"park\":\"OTHER\",\"edition\":\"OPEN_EDITION\"}";

        long id = json.readTree(mvc.perform(post("/api/pins")
                        .header("Authorization", "Bearer " + bob)
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andReturn().getResponse().getContentAsString()).get("id").asLong();

        mvc.perform(put("/api/pins/" + id)
                        .header("Authorization", "Bearer " + eve)
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isForbidden());
    }

    private String register(String username, String email) throws Exception {
        String body = "{\"username\":\"%s\",\"email\":\"%s\",\"password\":\"motdepasse123\"}".formatted(username, email);
        String res = mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return json.readTree(res).get("token").asText();
    }
}
