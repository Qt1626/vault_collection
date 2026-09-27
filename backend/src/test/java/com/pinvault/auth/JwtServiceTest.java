package com.pinvault.auth;

import org.junit.jupiter.api.Test;

import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtServiceTest {

    private static final String SECRET = "test-secret-test-secret-test-secret-123";

    @Test
    void generatedTokenCanBeParsed() {
        JwtService jwt = new JwtService(SECRET, Duration.ofMinutes(5));
        String token = jwt.generateToken("quentin", "USER");
        assertThat(jwt.extractUsername(token)).contains("quentin");
    }

    @Test
    void tamperedTokenIsRejected() {
        JwtService jwt = new JwtService(SECRET, Duration.ofMinutes(5));
        String token = jwt.generateToken("quentin", "USER");
        assertThat(jwt.extractUsername(token + "x")).isEmpty();
    }

    @Test
    void tokenSignedWithAnotherKeyIsRejected() {
        String token = new JwtService(SECRET, Duration.ofMinutes(5)).generateToken("quentin", "USER");
        JwtService other = new JwtService("another-secret-another-secret-another-1", Duration.ofMinutes(5));
        assertThat(other.extractUsername(token)).isEmpty();
    }

    @Test
    void expiredTokenIsRejected() {
        JwtService jwt = new JwtService(SECRET, Duration.ofSeconds(-1));
        assertThat(jwt.extractUsername(jwt.generateToken("quentin", "USER"))).isEmpty();
    }

    @Test
    void shortSecretIsRefused() {
        assertThatThrownBy(() -> new JwtService("too-short", Duration.ofMinutes(5)))
                .isInstanceOf(IllegalStateException.class);
    }
}
