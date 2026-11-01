package com.finance.backend.controller;

import com.finance.backend.model.Budget;
import com.finance.backend.service.BudgetService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    private final BudgetService budgetService;

    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    // Get the authenticated user's email
    private String getAuthenticatedUserEmail() {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getPrincipal().equals("anonymousUser")) {
            throw new IllegalStateException("User is not authenticated.");
        }

        // Assumes the authenticated principal name is the user's email.
        return authentication.getName();
    }

    // Create budget
    @PostMapping
    public ResponseEntity<?> createBudget(
            @RequestBody BudgetRequest request) {
        try {
            String userEmail = getAuthenticatedUserEmail();

            Budget budget = budgetService.createBudget(
                    userEmail,
                    request.category(),
                    request.amount(),
                    request.month(),
                    request.year()
            );

            return ResponseEntity.status(HttpStatus.CREATED).body(budget);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Get monthly budgets
    @GetMapping
    public ResponseEntity<?> getBudgets(
            @RequestParam int month,
            @RequestParam int year) {
        try {
            String userEmail = getAuthenticatedUserEmail();

            List<Budget> budgets =
                    budgetService.getBudgets(userEmail, month, year);

            return ResponseEntity.ok(budgets);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Update budget
    @PutMapping("/{id}")
    public ResponseEntity<?> updateBudget(
            @PathVariable String id,
            @RequestBody BudgetRequest request) {
        try {
            String userEmail = getAuthenticatedUserEmail();

            Budget budget = budgetService.updateBudget(
                    userEmail,
                    id,
                    request.category(),
                    request.amount(),
                    request.month(),
                    request.year()
            );

            return ResponseEntity.ok(budget);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Delete budget
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBudget(
            @PathVariable String id) {
        try {
            String userEmail = getAuthenticatedUserEmail();

            budgetService.deleteBudget(userEmail, id);

            return ResponseEntity.noContent().build();

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Request data for creating or updating a budget
    public record BudgetRequest(
            String category,
            double amount,
            int month,
            int year
    ) {}
}