
package com.finance.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.finance.backend.dto.LoginRequest;
import com.finance.backend.dto.LoginResponse;


import com.finance.backend.dto.RegisterRequest;
import com.finance.backend.service.AuthService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(
            @Valid @RequestBody RegisterRequest request) {

        String message = authService.register(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(message);
    }
    @PostMapping("/login")
public ResponseEntity<LoginResponse> login(
        @Valid @RequestBody LoginRequest request) {

    return ResponseEntity.ok(authService.login(request));
}
}

