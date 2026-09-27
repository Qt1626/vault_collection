package com.pinvault.auth;

import com.pinvault.auth.AuthDtos.AuthResponse;
import com.pinvault.auth.AuthDtos.LoginRequest;
import com.pinvault.auth.AuthDtos.MeResponse;
import com.pinvault.auth.AuthDtos.RegisterRequest;
import com.pinvault.common.NotFoundException;
import com.pinvault.user.AppUserRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final AppUserRepository users;

    public AuthController(AuthService authService, AppUserRepository users) {
        this.authService = authService;
        this.users = users;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest req) {
        return authService.register(req);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest req) {
        return authService.login(req);
    }

    @GetMapping("/me")
    public MeResponse me(@AuthenticationPrincipal UserDetails principal) {
        return users.findByUsernameIgnoreCase(principal.getUsername())
                .map(u -> new MeResponse(u.getId(), u.getUsername(), u.getEmail(), u.getRole().name()))
                .orElseThrow(() -> new NotFoundException("Utilisateur introuvable"));
    }
}
