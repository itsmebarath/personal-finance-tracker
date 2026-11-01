package com.finance.backend.service;

import com.finance.backend.model.Budget;
import com.finance.backend.repository.BudgetRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BudgetService {

    private final BudgetRepository budgetRepository;

    public BudgetService(BudgetRepository budgetRepository) {
        this.budgetRepository = budgetRepository;
    }

    // Create a new budget
    public Budget createBudget(
            String userEmail,
            String category,
            double amount,
            int month,
            int year) {

        validateBudget(category, amount, month, year);

        boolean exists =
                budgetRepository
                        .existsByUserEmailAndCategoryAndMonthAndYear(
                                userEmail, category, month, year);

        if (exists) {
            throw new IllegalArgumentException(
                    "A budget already exists for this category and month.");
        }

        Budget budget = new Budget(
                userEmail, category, amount, month, year);

        return budgetRepository.save(budget);
    }

    // Get budgets for a particular month
    public List<Budget> getBudgets(
            String userEmail,
            int month,
            int year) {

        if (month < 1 || month > 12 || year < 2000) {
            throw new IllegalArgumentException("Invalid month or year.");
        }

        return budgetRepository
                .findByUserEmailAndMonthAndYear(
                        userEmail, month, year);
    }

    // Update an existing budget
    public Budget updateBudget(
            String userEmail,
            String budgetId,
            String category,
            double amount,
            int month,
            int year) {

        validateBudget(category, amount, month, year);

        Budget budget = budgetRepository
                .findByIdAndUserEmail(budgetId, userEmail)
                .orElseThrow(() ->
                        new IllegalArgumentException("Budget not found."));

        boolean duplicate =
                budgetRepository
                        .existsByUserEmailAndCategoryAndMonthAndYear(
                                userEmail, category, month, year);

        boolean sameBudget =
                budget.getCategory().equalsIgnoreCase(category)
                && budget.getMonth() == month
                && budget.getYear() == year;

        if (duplicate && !sameBudget) {
            throw new IllegalArgumentException(
                    "A budget already exists for this category and month.");
        }

        budget.setCategory(category);
        budget.setAmount(amount);
        budget.setMonth(month);
        budget.setYear(year);

        return budgetRepository.save(budget);
    }

    // Delete an existing budget
    public void deleteBudget(
            String userEmail,
            String budgetId) {

        Budget budget = budgetRepository
                .findByIdAndUserEmail(budgetId, userEmail)
                .orElseThrow(() ->
                        new IllegalArgumentException("Budget not found."));

        budgetRepository.delete(budget);
    }

    // Validate budget input
    private void validateBudget(
            String category,
            double amount,
            int month,
            int year) {

        if (category == null || category.isBlank()) {
            throw new IllegalArgumentException(
                    "Category is required.");
        }

        if (!Double.isFinite(amount) || amount <= 0) {
            throw new IllegalArgumentException(
                    "Budget amount must be greater than zero.");
        }

        if (month < 1 || month > 12) {
            throw new IllegalArgumentException(
                    "Month must be between 1 and 12.");
        }

        if (year < 2000) {
            throw new IllegalArgumentException(
                    "Invalid year.");
        }
    }
}