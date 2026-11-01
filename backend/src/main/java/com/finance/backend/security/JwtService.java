
package com.finance.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;

@Service
public class JwtService {

    private final SecretKey secretKey;

    public JwtService(@Value("${JWT_SECRET}") String secret) {
        byte[] keyBytes =
                java.util.Base64.getDecoder().decode(secret);

        this.secretKey = Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(String email) {
        long expirationMillis = 1000L * 60 * 60; // 1 hour

        return Jwts.builder()
                .subject(email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis()
                        + expirationMillis))
                .signWith(secretKey)
                .compact();
    }

    // Extract the user's email from the token
    public String extractEmail(String token) {
        return extractAllClaims(token).getSubject();
    }

    // Validate the token's signature and expiration
    public boolean isTokenValid(String token, String email) {
        try {
            String tokenEmail = extractEmail(token);
            return tokenEmail.equals(email);
        } catch (io.jsonwebtoken.JwtException
                 | IllegalArgumentException exception) {
            return false;
        }
    }

    // Parse and verify the token
    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}

