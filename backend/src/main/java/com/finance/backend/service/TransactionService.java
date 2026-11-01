
package com.finance.backend.service;

import com.finance.backend.dto.TransactionRequest;
import com.finance.backend.model.Transaction;
import com.finance.backend.repository.TransactionRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.Locale;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;

    public TransactionService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    // Add a new income or expense
    public Transaction addTransaction(
            TransactionRequest request,
            String userEmail) {

        String type = request.getType()
                .trim()
                .toUpperCase(Locale.ROOT);

        if (!type.equals("INCOME") && !type.equals("EXPENSE")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Type must be INCOME or EXPENSE"
            );
        }

        Transaction transaction = new Transaction();

        // Assign ownership from the authenticated user, never the request body.
        transaction.setUserEmail(userEmail);
        transaction.setType(type);
        transaction.setAmount(request.getAmount());
        transaction.setCategory(request.getCategory().trim());
        transaction.setDescription(request.getDescription());
        transaction.setTransactionDate(request.getTransactionDate());
        transaction.setCreatedAt(Instant.now());

        return transactionRepository.save(transaction);
    }

    // Get only the authenticated user's transactions
    public List<Transaction> getMyTransactions(String userEmail) {
        return transactionRepository
                .findByUserEmailOrderByTransactionDateDesc(userEmail);
    }

    // Find a transaction only when it belongs to this user
    public Transaction getMyTransaction(String id, String userEmail) {
        return transactionRepository.findByIdAndUserEmail(id, userEmail)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Transaction not found"
                ));
    }

    // Update a transaction belonging to this user
    public Transaction updateTransaction(
            String id,
            TransactionRequest request,
            String userEmail) {

        Transaction transaction = getMyTransaction(id, userEmail);

        String type = request.getType()
                .trim()
                .toUpperCase(Locale.ROOT);

        if (!type.equals("INCOME") && !type.equals("EXPENSE")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Type must be INCOME or EXPENSE"
            );
        }

        transaction.setType(type);
        transaction.setAmount(request.getAmount());
        transaction.setCategory(request.getCategory().trim());
        transaction.setDescription(request.getDescription());
        transaction.setTransactionDate(request.getTransactionDate());

        // Preserve the original owner and creation timestamp.
        return transactionRepository.save(transaction);
    }

    // Delete only a transaction belonging to this user
    public void deleteTransaction(String id, String userEmail) {
        Transaction transaction = getMyTransaction(id, userEmail);
        transactionRepository.delete(transaction);
    }
}

