
package com.finance.backend.dto;

public class LoginResponse {

    private String message;
    private String token;
    private String email;

    public LoginResponse(String message, String token, String email) {
        this.message = message;
        this.token = token;
        this.email = email;
    }

    public String getMessage() {
        return message;
    }

    public String getToken() {
        return token;
    }

    public String getEmail() {
        return email;
    }
}
