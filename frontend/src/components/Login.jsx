import { useState } from "react";
import api from "../api/api";
import { toast } from "react-hot-toast";

function Login({ onLogin, onShowRegister }) {
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [loading, setLoading] = useState(false);

const handleLogin = async (e) => {
e.preventDefault();


try {
  setLoading(true);

  const response = await api.post("/auth/login", {
    email,
    password,
  });

  localStorage.setItem("token", response.data.token);
  localStorage.setItem("email", response.data.email);

  toast.success("Login successful!");

  onLogin();
} catch (error) {
  toast.error(
    error.response?.data?.message || "Invalid email or password"
  );
} finally {
  setLoading(false);
}


};

return ( <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4"> <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg"> <h1 className="mb-2 text-center text-3xl font-bold text-gray-800">
FinTrack </h1>

    <p className="mb-8 text-center text-gray-500">
      Login to manage your finances
    </p>

    <form onSubmit={handleLogin} className="space-y-5">
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
          placeholder="Enter your password"
          required
          className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>

    <p className="mt-6 text-center text-gray-600">
      Don't have an account?{" "}
      <button
        type="button"
        onClick={onShowRegister}
        className="font-semibold text-blue-600 hover:underline"
      >
        Register
      </button>
    </p>
  </div>
</div>


);
}

export default Login;
