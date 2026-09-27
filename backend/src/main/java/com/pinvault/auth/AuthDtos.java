package com.pinvault.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public final class AuthDtos {

    private AuthDtos() {
    }

    public record RegisterRequest(
            @NotBlank @Size(min = 3, max = 50)
            @Pattern(regexp = "^[A-Za-z0-9_.-]+$", message = "lettres, chiffres, _ . - uniquement")
            String username,
            @NotBlank @Email String email,
            @NotBlank @Size(min = 8, max = 100) String password) {
    }

    public record LoginRequest(@NotBlank String username, @NotBlank String password) {
    }

    public record AuthResponse(String token, String username, String role) {
    }

    public record MeResponse(Long id, String username, String email, String role) {
    }
}
