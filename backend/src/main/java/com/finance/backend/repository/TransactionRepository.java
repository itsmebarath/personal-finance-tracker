
package com.finance.backend.repository;

import com.finance.backend.model.Transaction;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface TransactionRepository
        extends MongoRepository<Transaction, String> {

    // Find all transactions belonging to a particular user
    List<Transaction> findByUserEmailOrderByTransactionDateDesc(
            String userEmail
    );

    // Find a specific transaction belonging to a user
    Optional<Transaction> findByIdAndUserEmail(
            String id,
            String userEmail
    );
}

