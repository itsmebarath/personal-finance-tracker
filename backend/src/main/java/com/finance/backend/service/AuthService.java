
package com.finance.backend.service;

import java.util.Locale;
import com.finance.backend.dto.LoginRequest;
import com.finance.backend.dto.LoginResponse;
import com.finance.backend.security.JwtService;
import org.springframework.security.authentication.BadCredentialsException;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.finance.backend.dto.RegisterRequest;
import com.finance.backend.model.User;
import com.finance.backend.repository.UserRepository;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
        UserRepository userRepository,
        PasswordEncoder passwordEncoder,
        JwtService jwtService) {

    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
    this.jwtService = jwtService;
}

    public String register(RegisterRequest request) {

        String normalizedEmail =
                request.getEmail().trim().toLowerCase(Locale.ROOT);

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new IllegalArgumentException(
                    "An account with this email already exists");
        }

        User user = new User();
        user.setName(request.getName().trim());
        user.setEmail(normalizedEmail);
        user.setPassword(
                passwordEncoder.encode(request.getPassword()));

        userRepository.save(user);

        return "Registration successful";

        
    }
    public LoginResponse login(LoginRequest request) {

    String email = request.getEmail()
            .trim()
            .toLowerCase();

    User user = userRepository.findByEmail(email)
            .orElseThrow(() ->
                    new BadCredentialsException(
                            "Invalid email or password"));

    if (!passwordEncoder.matches(
            request.getPassword(),
            user.getPassword())) {

        throw new BadCredentialsException(
                "Invalid email or password");
    }

    String token = jwtService.generateToken(user.getEmail());

    return new LoginResponse(
            "Login successful",
            token,
            user.getEmail());
}
}

