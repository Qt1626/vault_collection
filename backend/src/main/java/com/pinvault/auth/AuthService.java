package com.pinvault.auth;

import com.pinvault.auth.AuthDtos.AuthResponse;
import com.pinvault.auth.AuthDtos.LoginRequest;
import com.pinvault.auth.AuthDtos.RegisterRequest;
import com.pinvault.common.ConflictException;
import com.pinvault.user.AppUser;
import com.pinvault.user.AppUserRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final AppUserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(AppUserRepository users, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (users.existsByUsernameIgnoreCase(req.username())) {
            throw new ConflictException("Ce nom d'utilisateur est déjà pris");
        }
        if (users.existsByEmailIgnoreCase(req.email())) {
            throw new ConflictException("Cet email est déjà utilisé");
        }
        AppUser user = users.save(new AppUser(req.username(), req.email().toLowerCase(),
                passwordEncoder.encode(req.password())));
        return toResponse(user);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest req) {
        AppUser user = users.findByUsernameIgnoreCase(req.username())
                .filter(u -> passwordEncoder.matches(req.password(), u.getPasswordHash()))
                .orElseThrow(() -> new BadCredentialsException("bad credentials"));
        return toResponse(user);
    }

    private AuthResponse toResponse(AppUser user) {
        String role = user.getRole().name();
        return new AuthResponse(jwtService.generateToken(user.getUsername(), role), user.getUsername(), role);
    }
}
