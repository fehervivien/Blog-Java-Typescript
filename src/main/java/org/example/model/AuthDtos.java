package org.example.model;



public class AuthDtos {
    public record RegisterRequest(String username, String email, String password, String displayName) {}

    public record LoginRequest(String username, String password) {}

    public record UserResponse(Long id, String username, String email, String displayName, String token) {}
}
