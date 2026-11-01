
import { useEffect, useState } from "react";
import api from "../api/api";
import {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
} from "../services/budgetService";

const categories = [
  "Food",
  "Transport",
  "Shopping",
  "Entertainment",
  "Bills",
  "Healthcare",
  "Education",
  "Other",
];

const currentDate = new Date();

export default function BudgetManager() {
  const [transactions, setTransactions] = useState([]);
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());
  const [budgets, setBudgets] = useState([]);

  const [form, setForm] = useState({
    category: "Food",
    amount: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Load budgets for the selected month and year
  async function loadBudgets() {
    setLoading(true);
    setError("");

    try {
      const data = await getBudgets(month, year);
      setBudgets(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Unable to load budgets.");
    } finally {
      setLoading(false);
    }
  }

  // Load transactions from the backend
  async function loadTransactions() {
    try {
      const response = await api.get("/transactions");

      setTransactions(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (err) {
      console.error("Unable to load transactions:", err);
    }
  }

  // Reload budgets when the selected month or year changes
  useEffect(() => {
    loadBudgets();
  }, [month, year]);

  // Load transactions when the component first mounts
  useEffect(() => {
    loadTransactions();
  }, []);

  // Handle form changes
  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  // Create or update a budget
  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setMessage("");

    const amount = Number(form.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Enter a budget amount greater than zero.");
      return;
    }

    const budget = {
      category: form.category,
      amount,
      month,
      year,
    };

    try {
      if (editingId !== null) {
        await updateBudget(editingId, budget);
        setMessage("Budget updated successfully.");
      } else {
        await createBudget(budget);
        setMessage("Budget created successfully.");
      }

      setEditingId(null);
      setForm({
        category: "Food",
        amount: "",
      });

      await loadBudgets();
    } catch (err) {
      setError(err.message || "Unable to save budget.");
    }
  }

  // Select a budget for editing
  function startEditing(budget) {
    setEditingId(budget.id);

    setForm({
      category: budget.category,
      amount: String(budget.amount),
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // Delete a budget
  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this budget?"
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      await deleteBudget(id);

      setMessage("Budget deleted successfully.");

      if (editingId === id) {
        cancelEditing();
      }

      await loadBudgets();
    } catch (err) {
      setError(err.message || "Unable to delete budget.");
    }
  }

  // Cancel editing
  function cancelEditing() {
    setEditingId(null);

    setForm({
      category: "Food",
      amount: "",
    });

    setError("");
    setMessage("");
  }

  // Find expenses for the selected month and year
  const monthlyExpenses = transactions.filter((transaction) => {
    if (
      transaction.type !== "EXPENSE" ||
      !transaction.transactionDate
    ) {
      return false;
    }

    // Extract the calendar date without timezone shifting
    const dateString = String(transaction.transactionDate).slice(0, 10);
    const parts = dateString.split("-").map(Number);

    if (parts.length !== 3 || parts.some(Number.isNaN)) {
      return false;
    }

    const [transactionYear, transactionMonth] = parts;

    return (
      transactionMonth === month &&
      transactionYear === year
    );
  });

  // Calculate spending for one category
  function getCategorySpending(category) {
    return monthlyExpenses
      .filter(
        (transaction) => transaction.category === category
      )
      .reduce(
        (total, transaction) =>
          total + Number(transaction.amount || 0),
        0
      );
  }

  const monthName = new Date(
    year,
    month - 1,
    1
  ).toLocaleString("en-IN", {
    month: "long",
  });

  return (
    <section className="space-y-6">
      {/* Page heading */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Budget Management
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Set monthly spending limits and track your expenses.
        </p>
      </div>

      {/* Month and year selectors */}
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm font-medium">
          Month

          <select
            value={month}
            onChange={(event) =>
              setMonth(Number(event.target.value))
            }
            className="ml-2 rounded-lg border border-gray-300 p-2"
          >
            {Array.from({ length: 12 }, (_, index) => (
              <option key={index + 1} value={index + 1}>
                {new Date(2000, index, 1).toLocaleString(
                  "en-IN",
                  { month: "long" }
                )}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-medium">
          Year

          <input
            type="number"
            min="2000"
            max="9999"
            value={year}
            onChange={(event) =>
              setYear(Number(event.target.value))
            }
            className="ml-2 w-24 rounded-lg border border-gray-300 p-2"
          />
        </label>
      </div>

      {/* Budget creation and editing form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
      >
        <h3 className="text-lg font-semibold">
          {editingId !== null
            ? "Edit Budget"
            : "Create Monthly Budget"}
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-gray-700">
            Category

            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border border-gray-300 p-3"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-medium text-gray-700">
            Monthly limit (₹)

            <input
              type="number"
              name="amount"
              min="0.01"
              step="0.01"
              required
              value={form.amount}
              onChange={handleChange}
              onFocus={(event) => event.target.select()}
              placeholder="Enter amount"
              autoComplete="off"
              className="mt-1 block w-full cursor-text rounded-lg border border-gray-300 bg-white p-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700"
          >
            {editingId !== null
              ? "Update Budget"
              : "Add Budget"}
          </button>

          {editingId !== null && (
            <button
              type="button"
              onClick={cancelEditing}
              className="rounded-lg border border-gray-300 px-5 py-2.5"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Error message */}
      {error && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 p-3 text-red-700"
        >
          {error}
        </p>
      )}

      {/* Success message */}
      {message && (
        <p className="rounded-lg bg-green-50 p-3 text-green-700">
          {message}
        </p>
      )}

      {/* Budget list */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold">
          {monthName} {year} Budgets
        </h3>

        {loading ? (
          <p className="text-gray-500">
            Loading budgets...
          </p>
        ) : budgets.length === 0 ? (
          <p className="text-gray-500">
            No budgets found for this month. Create your first
            budget above.
          </p>
        ) : (
          <div className="space-y-4">
            {budgets.map((budget) => {
              const spent = getCategorySpending(
                budget.category
              );

              const limit = Number(budget.amount);
              const remaining = limit - spent;

              const percentage =
                limit > 0 ? (spent / limit) * 100 : 0;

              const progressColor =
                percentage >= 100
                  ? "bg-red-500"
                  : percentage >= 80
                  ? "bg-yellow-500"
                  : "bg-green-500";

              return (
                <div
                  key={budget.id}
                  className="rounded-xl border border-gray-100 p-4"
                >
                  {/* Category and spending information */}
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {budget.category}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        Monthly limit: ₹
                        {limit.toLocaleString("en-IN")}
                      </p>

                      <p className="mt-1 text-sm text-gray-600">
                        Spent: ₹
                        {spent.toLocaleString("en-IN")}
                      </p>

                      <p
                        className={`mt-1 text-sm font-medium ${
                          remaining < 0
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {remaining < 0
                          ? "Over budget by: "
                          : "Remaining: "}
                        ₹
                        {Math.abs(remaining).toLocaleString(
                          "en-IN"
                        )}
                      </p>
                    </div>

                    {/* Edit and delete buttons */}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => startEditing(budget)}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(budget.id)}
                        className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Budget progress bar */}
                  <div className="mt-4">
                    <div className="mb-1 flex justify-between text-xs text-gray-500">
                      <span>Budget usage</span>
                      <span>{percentage.toFixed(1)}%</span>
                    </div>

                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${progressColor}`}
                        style={{
                          width: `${Math.min(
                            Math.max(percentage, 0),
                            100
                          )}%`,
                        }}
                      />
                    </div>

                    {percentage >= 100 ? (
  <p className="mt-2 rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">
    ⚠️ Budget exceeded! You have spent more than your allocated limit.
  </p>
) : percentage >= 80 ? (
  <p className="mt-2 rounded-lg bg-yellow-50 p-3 text-sm font-semibold text-yellow-700">
    ⚠️ Warning! You have used {percentage.toFixed(1)}% of your budget.
  </p>
) : (
  <p className="mt-2 text-sm text-green-600">
    ✓ Your spending is within the budget limit.
  </p>
)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

