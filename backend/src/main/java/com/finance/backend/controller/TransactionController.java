
package com.finance.backend.controller;

import com.finance.backend.dto.TransactionRequest;
import com.finance.backend.model.Transaction;
import com.finance.backend.service.TransactionService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    // Add a new income or expense
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Transaction addTransaction(
            @Valid @RequestBody TransactionRequest request,
            Authentication authentication) {

        String userEmail = authentication.getName();

        return transactionService.addTransaction(request, userEmail);
    }

    // Get all transactions belonging to the logged-in user
    @GetMapping
    public List<Transaction> getMyTransactions(
            Authentication authentication) {

        String userEmail = authentication.getName();

        return transactionService.getMyTransactions(userEmail);
    }

    // Get one transaction
    @GetMapping("/{id}")
    public Transaction getTransaction(
            @PathVariable String id,
            Authentication authentication) {

        return transactionService.getMyTransaction(
                id,
                authentication.getName()
        );
    }

    // Update a transaction
    @PutMapping("/{id}")
    public Transaction updateTransaction(
            @PathVariable String id,
            @Valid @RequestBody TransactionRequest request,
            Authentication authentication) {

        return transactionService.updateTransaction(
                id,
                request,
                authentication.getName()
        );
    }

    // Delete a transaction
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTransaction(
            @PathVariable String id,
            Authentication authentication) {

        transactionService.deleteTransaction(
                id,
                authentication.getName()
        );
    }
}

