import { useState } from "react";
import api from "../api/api";
import { toast } from "react-hot-toast";

function Register({ onShowLogin }) {
const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [loading, setLoading] = useState(false);

const handleRegister = async (e) => {
e.preventDefault();


if (password.length < 8) {
  toast.error("Password must contain at least 8 characters");
  return;
}

try {
  setLoading(true);

  await api.post("/auth/register", {
    name,
    email,
    password,
  });

  toast.success("Registration successful! Please login.");

  onShowLogin();
} catch (error) {
  toast.error(
    error.response?.data?.message || "Registration failed"
  );
} finally {
  setLoading(false);
}


};

return ( <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4"> <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg"> <h1 className="mb-2 text-center text-3xl font-bold text-gray-800">
Create Account </h1>


    <p className="mb-8 text-center text-gray-500">
      Start managing your finances with FinTrack
    </p>

    <form onSubmit={handleRegister} className="space-y-5">
      <div>
        <label className="mb-2 block font-medium text-gray-700">
          Full Name
        </label>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          required
          className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label className="mb-2 block font-medium text-gray-700">
          Email
        </label>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label className="mb-2 block font-medium text-gray-700">
          Password
        </label>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Minimum 8 characters"
          minLength={8}
          required
          className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Creating Account..." : "Register"}
      </button>
    </form>

    <p className="mt-6 text-center text-gray-600">
      Already have an account?{" "}
      <button
        type="button"
        onClick={onShowLogin}
        className="font-semibold text-blue-600 hover:underline"
      >
        Login
      </button>
    </p>
  </div>
</div>


);
}

export default Register;
