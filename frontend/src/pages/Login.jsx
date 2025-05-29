import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { post } from "../services/endpoints";
import useAuthStore from "../store/authStore";
import toast from "react-hot-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await post("/users/login", { email, password });

      if (res.success) {
        setAuth(res.token, res.data); // store token & user
        toast.success("Logged in successfully");
        navigate("/");
      } else {
        toast.error(res.message || "Login failed");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Login error");
    }
  };

  return (
    <section className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-gray-800 text-white shadow-lg rounded-lg p-6">
        <div className="flex items-center justify-center mb-6">
          <img src="/vite.svg" alt="logo" className="h-8 w-8 mr-2" />
          <Link
            to="/"
            className="text-xl font-semibold text-white hover:text-blue-400"
          >
            Twitter
          </Link>
        </div>
        <h2 className="text-xl font-bold text-white mb-4">
          Sign in to your account
        </h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Your email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="xyz@email.com"
              required
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-200 cursor-pointer"
          >
            Sign in
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-400">
          Don’t have an account yet?{" "}
          <Link to="/register" className="text-blue-400 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </section>
  );
};

export default Login;
