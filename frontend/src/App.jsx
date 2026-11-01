import { useEffect, useState } from "react";
import api from "./api/api";
import BudgetManager from "./components/BudgetManager";
import { getBudgets } from "./services/budgetService";
import toast from "react-hot-toast";
import Login from "./components/Login";
import Register from "./components/Register";



import {
  Wallet,
  TrendingUp,
  TrendingDown,
  LayoutDashboard,
  ArrowLeftRight,
  ChartNoAxesCombined,
  Settings,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Bell,
  Search,
} from "lucide-react";


import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";




const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);

function Dashboard({ onLogout }) {
  const [transactions, setTransactions] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [budgets, setBudgets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
const [categoryFilter, setCategoryFilter] = useState("ALL");
const [startDate, setStartDate] = useState("");
const [endDate, setEndDate] = useState("");
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
const [showForm, setShowForm] = useState(false);

const incomeCategories = [
  "Salary",
  "Freelancing",
  "Business",
  "Investments",
  "Gifts Received",
  "Other Income",
];

const expenseCategories = [
  "Food",
  "Shopping",
  "Transport",
  "Education",
  "Healthcare",
  "Entertainment",
  "Bills & Utilities",
  "Rent",
  "Travel",
  "Insurance",
  "Other Expenses",
];

async function fetchDashboardBudgets() {
  try {
    const now = new Date();

    const data = await getBudgets(
      now.getMonth() + 1,
      now.getFullYear()
    );

    setBudgets(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error("Dashboard budget loading failed:", error);
  }
}


const [formData, setFormData] = useState({
  type: "EXPENSE",
  amount: "",
  category: "",
  description: "",
  transactionDate: new Date().toISOString().split("T")[0],
});

const [formError, setFormError] = useState("");
const [saving, setSaving] = useState(false);

async function handleAddTransaction(event) {
  event.preventDefault();

  const amount = Number(formData.amount);

if (!Number.isFinite(amount) || amount <= 0) {
  setFormError("Please enter an amount greater than zero.");
  return;
}

if (!formData.category) {
  setFormError("Please select a category.");
  return;
}

if (!formData.transactionDate) {
  setFormError("Please select a transaction date.");
  return;
}

  setFormError("");
  setSaving(true);

  try {
    const response = await api.post("/transactions", {
      ...formData,
      amount: Number(formData.amount),
    });

    setTransactions((previous) => [
      response.data,
      ...previous,
    ]);

    toast.success("Transaction added successfully!");

    setFormData({
      type: "EXPENSE",
      amount: "",
      category: "",
      description: "",
      transactionDate: new Date().toISOString().split("T")[0],
    });

    setShowForm(false);
  } catch (error) {
    setFormError(
      error.response?.data?.message ||
        error.response?.data?.error ||
        "Unable to save transaction. Please check your login and try again."
    );
    toast.error("Unable to save transaction.");
  } finally {
    setSaving(false);
  }
}

// Edit transaction
async function handleEditTransaction(transaction) {
  const newAmount = window.prompt(
    "Enter the new amount:",
    transaction.amount
  );

  if (newAmount === null) return;

  const amount = Number(newAmount);

  if (!Number.isFinite(amount) || amount <= 0) {
    window.alert("Please enter a valid amount greater than zero.");
    return;
  }

  const newCategory = window.prompt(
    "Enter the new category:",
    transaction.category
  );

  if (newCategory === null) return;

  if (!newCategory.trim()) {
    window.alert("Category cannot be empty.");
    return;
  }

  const newDescription = window.prompt(
    "Enter the new description:",
    transaction.description || ""
  );

  if (newDescription === null) return;

  try {
    const response = await api.put(`/transactions/${transaction.id}`, {
      type: transaction.type,
      amount,
      category: newCategory.trim(),
      description: newDescription.trim(),
      transactionDate: transaction.transactionDate,
    });

    setTransactions((previous) =>
      previous.map((item) =>
        item.id === transaction.id ? response.data : item
      )
    );

    window.alert("Transaction updated successfully!");
  } catch (error) {
    window.alert(
      error.response?.data?.message ||
        error.response?.data?.error ||
        "Unable to update transaction. Please check your login."
    );
  }
}

// Delete transaction
async function handleDeleteTransaction(id) {
  const confirmed = window.confirm(
    "Are you sure you want to delete this transaction?"
  );

  if (!confirmed) return;

  try {
    await api.delete(`/transactions/${id}`);

    setTransactions((previous) =>
      previous.filter((transaction) => transaction.id !== id)
    );

    window.alert("Transaction deleted successfully!");
  } catch (error) {
    window.alert(
      error.response?.data?.message ||
        error.response?.data?.error ||
        "Unable to delete transaction. Please check your login."
    );
  }
}

useEffect(() => {
  async function fetchTransactions() {
    try {
      const response = await api.get("/transactions");
      setTransactions(response.data);
    } catch (err) {
      setError(
        err.response?.status === 401 || err.response?.status === 403
          ? "Please log in to view your transactions."
          : "Unable to load transactions. Check your backend connection."
      );
    } finally {
      setLoading(false);
    }
  }

  fetchTransactions();
}, []);

useEffect(() => {
  fetchDashboardBudgets();
}, []);

// Current month and year
const now = new Date();
const currentMonth = now.getMonth() + 1;
const currentYear = now.getFullYear();

// Filter current month's transactions
const monthlyTransactions = transactions.filter((transaction) => {
  if (!transaction.transactionDate) return false;

  const dateParts = String(transaction.transactionDate)
    .slice(0, 10)
    .split("-")
    .map(Number);

  const [transactionYear, transactionMonth] = dateParts;

  return (
    transactionMonth === currentMonth &&
    transactionYear === currentYear
  );
});

// Monthly income
const totalIncome = monthlyTransactions
  .filter((transaction) => transaction.type === "INCOME")
  .reduce(
    (total, transaction) => total + Number(transaction.amount || 0),
    0
  );

// Monthly expenses
const totalExpenses = monthlyTransactions
  .filter((transaction) => transaction.type === "EXPENSE")
  .reduce(
    (total, transaction) => total + Number(transaction.amount || 0),
    0
  );

// Monthly savings
const balance = totalIncome - totalExpenses;

const expenseCategoryData = Object.values(
  transactions
    .filter((transaction) => transaction.type === "EXPENSE")
    .reduce((categories, transaction) => {
      const category = transaction.category || "Other";
      const amount = Number(transaction.amount) || 0;

      if (!categories[category]) {
        categories[category] = {
          name: category,
          value: 0,
        };
      }

      categories[category].value += amount;

      return categories;
    }, {})
);


const totalBudget = budgets.reduce(
  (total, budget) => total + Number(budget.amount || 0),
  0
);



const totalBudgetSpent = transactions
  .filter((transaction) => {
    if (transaction.type !== "EXPENSE" || !transaction.transactionDate) {
      return false;
    }

    const date = new Date(transaction.transactionDate);
    const now = new Date();

    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  })
  .reduce(
    (total, transaction) => total + Number(transaction.amount || 0),
    0
  );

const remainingBudget = totalBudget - totalBudgetSpent;


const filteredTransactions = transactions.filter((transaction) => {
  const search = searchTerm.trim().toLowerCase();

  const matchesSearch =
    (transaction.description || "").toLowerCase().includes(search) ||
    (transaction.category || "").toLowerCase().includes(search) ||
    (transaction.type || "").toLowerCase().includes(search);

  const matchesType =
    typeFilter === "ALL" || transaction.type === typeFilter;

  const matchesCategory =
    categoryFilter === "ALL" ||
    transaction.category === categoryFilter;

  const matchesStartDate =
    !startDate || transaction.transactionDate >= startDate;

  const matchesEndDate =
    !endDate || transaction.transactionDate <= endDate;

  return (
    matchesSearch &&
    matchesType &&
    matchesCategory &&
    matchesStartDate &&
    matchesEndDate
  );
});

const budgetNotifications = budgets
  .map((budget) => {
    const spent = transactions
      .filter((transaction) => {
        if (
          transaction.type !== "EXPENSE" ||
          transaction.category !== budget.category ||
          !transaction.transactionDate
        ) {
          return false;
        }

        const dateString = String(transaction.transactionDate).slice(0, 10);
        const [transactionYear, transactionMonth] =
          dateString.split("-").map(Number);

        const now = new Date();

        return (
          transactionMonth === now.getMonth() + 1 &&
          transactionYear === now.getFullYear()
        );
      })
      .reduce(
        (total, transaction) =>
          total + Number(transaction.amount || 0),
        0
      );

    const percentage =
      Number(budget.amount) > 0
        ? (spent / Number(budget.amount)) * 100
        : 0;

    if (percentage >= 100) {
      return {
        category: budget.category,
        message: "Budget exceeded!",
        percentage,
        level: "danger",
      };
    }

    if (percentage >= 80) {
      return {
        category: budget.category,
        message: "Budget limit reaching!",
        percentage,
        level: "warning",
      };
    }

    return null;
  })
  .filter(Boolean);

// If there is no data, show an empty state message instead of the table
  // Build the chart from real transactions for the last six calendar months.
  const currentDate = new Date();
  const chartMonths = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 5 + index,
      1
    );
    const year = date.getFullYear();
    const monthNumber = String(date.getMonth() + 1).padStart(2, "0");

    return {
      key: `${year}-${monthNumber}`,
      month: date.toLocaleDateString("en-IN", { month: "short" }),
      income: 0,
      expenses: 0,
    };
  });

  const monthlyTotals = Object.fromEntries(
    chartMonths.map((month) => [month.key, month])
  );

  transactions.forEach((transaction) => {
    if (!transaction.transactionDate) return;

    const monthKey = transaction.transactionDate.slice(0, 7);
    const monthData = monthlyTotals[monthKey];

    if (!monthData) return;

    const amount = Number(transaction.amount) || 0;

    if (transaction.type === "INCOME") {
      monthData.income += amount;
    } else if (transaction.type === "EXPENSE") {
      monthData.expenses += amount;
    }
  });

  const chartData = chartMonths.map(({ key, month, income, expenses }) => ({
    month,
    income,
    expenses,
  }));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 md:flex">
      <aside className="w-full border-b border-slate-200 bg-white p-5 md:min-h-screen md:w-64 md:border-b-0 md:border-r">
        <div className="mb-8 flex items-center gap-3">
          <div className="rounded-xl bg-indigo-600 p-2 text-white">
            <Wallet size={23} />
          </div>
          <div>
            <h1 className="text-lg font-bold">FinTrack</h1>
            <p className="text-xs text-slate-500">Personal Finance</p>
          </div>
        </div>

        <nav className="flex gap-2 overflow-x-auto md:flex-col">
          <a href="#dashboard" className="flex items-center gap-3 rounded-xl bg-indigo-50 px-4 py-3 font-semibold text-indigo-700">
            <LayoutDashboard size={19} /> Dashboard
          </a>
          <a href="#transactions" className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-600 hover:bg-slate-100">
            <ArrowLeftRight size={19} /> Transactions
          </a>
          <a
  href="#budgets"
  className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-600 hover:bg-slate-100"
>
  <Wallet size={19} />
  Budgets
</a>
          <a href="#analytics" className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-600 hover:bg-slate-100">
            <ChartNoAxesCombined size={19} /> Analytics
          </a>
          <a href="#settings" className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-600 hover:bg-slate-100">
            <Settings size={19} /> Settings
          </a>
        </nav>

        <div className="mt-10 hidden rounded-2xl bg-indigo-600 p-5 text-white md:block">
          <p className="text-sm font-semibold">Smart money habits</p>
          <p className="mt-2 text-sm text-indigo-100">
            Track your spending and build better financial habits.
          </p>
        </div>
      </aside>

      <main id="dashboard" className="min-w-0 flex-1 p-5 md:p-8">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <h2 className="mt-1 text-2xl font-bold md:text-3xl">Financial Overview</h2>
            <p className="mt-2 text-sm text-slate-500">
              Here's what's happening with your money.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
  type="search"
  placeholder="Search transactions..."
  value={searchTerm}
  onChange={(event) => setSearchTerm(event.target.value)}
  aria-label="Search transactions"
  className="w-48 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-indigo-500"
/>
            <button
  aria-label="Notifications"
  onClick={() => setShowNotifications(!showNotifications)}
  className="relative rounded-xl border border-slate-200 bg-white p-3"
>
  <Bell size={19} />

  {budgetNotifications.length > 0 && (
    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
      {budgetNotifications.length}
    </span>
  )}
</button>

{showNotifications && (
  <div className="absolute right-10 top-24 z-50 w-80 rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
    <h3 className="mb-3 font-bold text-slate-800">
      Notifications
    </h3>

    {budgetNotifications.length === 0 ? (
      <p className="text-sm text-slate-500">
        No budget alerts. Your spending is under control!
      </p>
    ) : (
      budgetNotifications.map((notification, index) => (
        <div
          key={index}
          className={`mb-2 rounded-lg p-3 text-sm ${
            notification.level === "danger"
              ? "bg-red-50 text-red-700"
              : "bg-yellow-50 text-yellow-700"
          }`}
        >
          <p className="font-semibold">
            {notification.category}
          </p>

          <p>{notification.message}</p>

          <p className="mt-1">
            Budget used: {notification.percentage.toFixed(1)}%
          </p>
        </div>
      ))
    )}
  </div>
)}
           <div className="flex items-center gap-3">
  <div className="text-right">
    <p className="text-sm font-semibold text-slate-700">
      {localStorage.getItem("email")}
    </p>
    <p className="text-xs text-slate-500">My Account</p>
  </div>

  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">
    B
  </div>

  <button
    onClick={onLogout}
    className="rounded-xl bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-100"
  >
    Logout
  </button>
</div>
          </div>
        </header>

        <section className="mb-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <SummaryCard
  title="This Month's Savings"
  amount={balance}
  icon={<Wallet size={21} />}
  color="bg-indigo-100 text-indigo-700"
  note="Income minus expenses"
/>

<SummaryCard
 title="This Month's Income"
  amount={totalIncome}
  icon={<TrendingUp size={21} />}
  color="bg-emerald-100 text-emerald-700"
  note="Money received"
/>

<SummaryCard
 title="This Month's Expenses"
  amount={totalExpenses}
  icon={<TrendingDown size={21} />}
  color="bg-rose-100 text-rose-700"
  note="Money spent"
/>
        </section>


        <section className="mb-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
  <SummaryCard
    title="Total Budget"
    amount={totalBudget}
    icon={<Wallet size={21} />}
    color="bg-indigo-100 text-indigo-700"
    note="Monthly allocated budget"
  />

  <SummaryCard
    title="Total Budget Spent"
    amount={totalBudgetSpent}
    icon={<TrendingDown size={21} />}
    color="bg-rose-100 text-rose-700"
    note="Monthly expenses"
  />

  <SummaryCard
    title="Remaining Budget"
    amount={remainingBudget}
    icon={<Wallet size={21} />}
    color="bg-emerald-100 text-emerald-700"
    note="Budget minus spending"
  />
</section>

        <section id="analytics" className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold">Income vs. Expenses</h3>
              <p className="mt-1 text-sm text-slate-500">Based on your transactions over the last six months</p>
            </div>
            <span className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600">
              Last 6 months
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `₹${value / 1000}k`}
                />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Area
                  type="monotone"
                  dataKey="income"
                  name="Income"
                  stroke="#4f46e5"
                  fill="url(#incomeGradient)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  name="Expenses"
                  stroke="#f43f5e"
                  fill="url(#expenseGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 flex gap-5 text-sm">
            <span className="flex items-center gap-2 text-slate-600">
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-600" /> Income
            </span>
            <span className="flex items-center gap-2 text-slate-600">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500" /> Expenses
            </span>
          </div>
        </section>

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
  <h3 className="text-lg font-bold">
    Expenses by Category
  </h3>

  <p className="mt-1 text-sm text-slate-500">
    See where your money goes.
  </p>

  {expenseCategoryData.length === 0 ? (
    <p className="py-12 text-center text-slate-500">
      Add expense transactions to see your spending breakdown.
    </p>
  ) : (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={expenseCategoryData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
          >
            {expenseCategoryData.map((entry, index) => (
              <Cell
                key={entry.name}
                fill={
                  [
                    "#4f46e5",
                    "#f43f5e",
                    "#10b981",
                    "#f59e0b",
                    "#0ea5e9",
                    "#8b5cf6",
                    "#64748b",
                  ][index % 7]
                }
              />
            ))}
          </Pie>

          <Tooltip
            formatter={(value) => formatCurrency(value)}
          />

          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )}
</section>
{/* Budget Management */}
<section id="budgets" className="mb-8">
  <BudgetManager />
</section>
        <section id="transactions" className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-5 md:p-6">
            <div>
              <h3 className="text-lg font-bold">Recent Transactions</h3>
              <div className="grid grid-cols-1 gap-4 border-b border-slate-100 bg-slate-50 p-5 sm:grid-cols-2 lg:grid-cols-4">
  <div>
    <label className="mb-1 block text-sm font-medium text-slate-600">
      Transaction Type
    </label>

    


<select
  value={typeFilter}
  onChange={(e) => {
    setTypeFilter(e.target.value);
    setCategoryFilter("ALL");
  }}
  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2"
>
  <option value="ALL">All Types</option>
  <option value="INCOME">Income</option>
  <option value="EXPENSE">Expense</option>
</select>







  </div>

  <div>
    <label className="mb-1 block text-sm font-medium text-slate-600">
      Category
    </label>

    <select
      value={categoryFilter}
      onChange={(event) => setCategoryFilter(event.target.value)}
      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2"
    >
      <option value="ALL">All Categories</option>
      {(typeFilter === "INCOME"
        ? [...new Set([
            ...incomeCategories,
            ...transactions
              .filter((transaction) => transaction.type === "INCOME")
              .map((transaction) => transaction.category)
              .filter(Boolean),
          ])]
        : typeFilter === "EXPENSE"
        ? [...new Set([
            ...expenseCategories,
            ...transactions
              .filter((transaction) => transaction.type === "EXPENSE")
              .map((transaction) => transaction.category)
              .filter(Boolean),
          ])]
        : [...new Set([
            ...incomeCategories,
            ...expenseCategories,
            ...transactions.map((transaction) => transaction.category).filter(Boolean),
          ])]
      )
        .sort()
        .map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
    </select>
  </div>

  <div>
    <label className="mb-1 block text-sm font-medium text-slate-600">
      Start Date
    </label>

    <input
      type="date"
      value={startDate}
      max={endDate || undefined}
      onChange={(event) => setStartDate(event.target.value)}
      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2"
    />
  </div>

  <div>
    <label className="mb-1 block text-sm font-medium text-slate-600">
      End Date
    </label>

    <input
      type="date"
      value={endDate}
      min={startDate || undefined}
      onChange={(event) => setEndDate(event.target.value)}
      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2"
    />
  </div>
</div>
              <p className="mt-1 text-sm text-slate-500">Your latest financial activity</p>
            </div>
           
<button
  onClick={() => {
    setFormError("");
    setShowForm(true);
  }}
  className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 font-semibold text-white hover:bg-indigo-700"
>
  <Plus size={18} /> Add Transaction
</button>


          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-medium">Transaction</th>
<th className="px-6 py-4 font-medium">Category</th>
<th className="px-6 py-4 font-medium">Date</th>
<th className="px-6 py-4 text-right font-medium">Amount</th>
<th className="px-6 py-4 text-center font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
  {loading ? (
    <tr>
      <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
        Loading transactions...
      </td>
    </tr>
  ) : error ? (
    <tr>
      <td colSpan="5" className="px-6 py-8 text-center text-rose-600">
        {error}
      </td>
    </tr>
  ) : filteredTransactions.length === 0 ? (
    <tr>
      <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
        No transactions yet. Add your first transaction!
      </td>
    </tr>
  ) : (
   filteredTransactions.map((transaction) => (
      <tr key={transaction.id} className="border-t border-slate-100">
        <td className="px-6 py-4 font-semibold">
          {transaction.description || transaction.category}
        </td>

        <td className="px-6 py-4 text-slate-500">
          {transaction.category}
        </td>

        <td className="px-6 py-4 text-slate-500">
          {transaction.transactionDate}
        </td>

        <td
          className={`px-6 py-4 text-right font-semibold ${
            transaction.type === "INCOME"
              ? "text-emerald-600"
              : "text-rose-600"
          }`}
        >
          {transaction.type === "INCOME" ? "+" : "-"}
          {formatCurrency(Number(transaction.amount))}
        </td>
        <td className="px-6 py-4">
  <div className="flex items-center justify-center gap-2">
    <button
      type="button"
      onClick={() => handleEditTransaction(transaction)}
      className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100"
    >
      Edit
    </button>

    <button
      type="button"
      onClick={() => handleDeleteTransaction(transaction.id)}
      className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
    >
      Delete
    </button>
  </div>
</td>
      </tr>
      
    ))
  )}
</tbody>
            </table>

            {showForm && (
  <div className="border-t border-slate-200 bg-slate-50 p-5 md:p-6">
    <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-xl font-bold text-slate-900">
          Add New Transaction
        </h3>

        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="rounded-lg px-3 py-2 text-slate-500 hover:bg-slate-100"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleAddTransaction} className="space-y-5">
        {/* Transaction Type */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Transaction Type
          </label>

          <select
            value={formData.type}
            onChange={(event) =>
              setFormData({
                ...formData,
                type: event.target.value,
                category: "",
              })
            }
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
          >
            <option value="EXPENSE">Expense</option>
            <option value="INCOME">Income</option>
            



          </select>
        </div>

        {/* Amount */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Amount (₹)
          </label>

          <input
            type="number"
            min="0.01"
            step="0.01"
            required
            value={formData.amount}
            onChange={(event) =>
              setFormData({
                ...formData,
                amount: event.target.value,
              })
            }
            placeholder="Enter amount"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
          />
        </div>

        {/* Category */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Category
          </label>

          <select
            required
            value={formData.category}
            onChange={(event) =>
              setFormData({
                ...formData,
                category: event.target.value,
              })
            }
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
          >
            <option value="">Select category</option>
            {(formData.type === "INCOME" ? incomeCategories : expenseCategories).map(
              (category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              )
            )}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Description
          </label>

          <input
            type="text"
            value={formData.description}
            onChange={(event) =>
              setFormData({
                ...formData,
                description: event.target.value,
              })
            }
            placeholder="e.g. Lunch or monthly salary"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
          />
        </div>

        {/* Date */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Transaction Date
          </label>

          <input
            type="date"
            required
            value={formData.transactionDate}
            onChange={(event) =>
              setFormData({
                ...formData,
                transactionDate: event.target.value,
              })
            }
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
          />
        </div>

        {/* Error Message */}
        {formError && (
          <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-600">
            {formError}
          </p>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Transaction"}
        </button>
      </form>
    </div>
  </div>
)}
          </div>
        </section>

        <footer className="py-6 text-center text-sm text-slate-400">
          FinTrack · Manage your money with confidence.
        </footer>
      </main>
    </div>
  );
}

function SummaryCard({ title, amount, icon, color, note, trend }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{title}</span>
        <span className={`rounded-xl p-3 ${color}`}>{icon}</span>
      </div>
      <p className="mt-5 text-2xl font-bold tracking-tight md:text-3xl">
        {formatCurrency(amount)}
      </p>
      <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
        {trend}
        {note}
      </div>
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(localStorage.getItem("token"))
  );

  const [showRegister, setShowRegister] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return showRegister ? (
      <Register onShowLogin={() => setShowRegister(false)} />
    ) : (
      <Login
        onLogin={handleLogin}
        onShowRegister={() => setShowRegister(true)}
      />
    );
  }

  return <Dashboard onLogout={handleLogout} />;
}

export default App;

