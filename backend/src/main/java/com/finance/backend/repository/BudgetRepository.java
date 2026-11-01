package com.finance.backend.repository;

import com.finance.backend.model.Budget;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface BudgetRepository
        extends MongoRepository<Budget, String> {

    List<Budget> findByUserEmailAndMonthAndYear(
            String userEmail,
            int month,
            int year
    );

    Optional<Budget> findByIdAndUserEmail(
            String id,
            String userEmail
    );

    boolean existsByUserEmailAndCategoryAndMonthAndYear(
            String userEmail,
            String category,
            int month,
            int year
    );
}