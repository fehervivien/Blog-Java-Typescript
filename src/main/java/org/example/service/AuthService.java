package org.example.service;

import org.example.model.AuthDtos.*;
import org.example.model.User;
import org.example.repository.UserRepository;
import org.example.config.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public UserResponse register(RegisterRequest req) {
        if (userRepository.existsByUsername(req.username())) {
            throw new IllegalArgumentException("Ez a felhasználónév már foglalt!");
        }
        if (userRepository.existsByEmail(req.email())) {
            throw new IllegalArgumentException("Ez az e-mail cím már regisztrálva van!");
        }

        String hashedPassword = passwordEncoder.encode(req.password());
        String name = (req.displayName() == null || req.displayName().isBlank())
                ? req.username()
                : req.displayName();

        User user = new User(req.username(), req.email(), hashedPassword, name);
        User saved = userRepository.save(user);

        // Token generálása és visszaadása a frontendnek
        String token = jwtUtil.generateToken(saved.getUsername());
        return new UserResponse(saved.getId(), saved.getUsername(), saved.getEmail(), saved.getDisplayName(), token);
    }

    public UserResponse login(LoginRequest req) {
        User user = userRepository.findByUsername(req.username())
                .orElseThrow(() -> new IllegalArgumentException("Hibás felhasználónév vagy jelszó!"));

        if (!passwordEncoder.matches(req.password(), user.getPassword())) {
            throw new IllegalArgumentException("Hibás felhasználónév vagy jelszó!");
        }

        // Token generálása és visszaadása a frontendnek
        String token = jwtUtil.generateToken(user.getUsername());
        return new UserResponse(user.getId(), user.getUsername(), user.getEmail(), user.getDisplayName(), token);
    }
}