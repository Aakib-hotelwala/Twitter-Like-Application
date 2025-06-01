import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { post } from "../services/endpoints";
import { FaUserCircle } from "react-icons/fa";
import { FiCamera } from "react-icons/fi";
import ClipLoader from "react-spinners/ClipLoader";

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    bio: "",
    dateOfBirth: "",
    profilePicture: null,
  });

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      const file = files[0];
      setFormData({ ...formData, profilePicture: file });
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(file);
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) data.append(key, value);
      });

      const res = await post("/users/register", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.success) {
        toast.success("Registered successfully");
        navigate("/login");
      } else {
        toast.error(res.message || "Registration failed");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Registration error");
    } finally {
      setLoading(false); // stop loading
    }
  };

  return (
    <section className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#16181C] text-white shadow-2xl rounded-2xl p-8">
        {/* Logo */}
        <div className="flex items-center justify-center mb-6">
          <img src="/vite.svg" alt="logo" className="h-8 w-8 mr-2" />
          <p className="text-2xl font-bold text-white hover:text-blue-500">
            Twitter
          </p>
        </div>

        <h2 className="text-2xl font-semibold text-white mb-4">
          Create your account
        </h2>

        {/* Profile Icon + Upload */}
        <div className="flex justify-center mb-6 relative">
          <div className="relative">
            {preview ? (
              <img
                src={preview}
                alt="Profile Preview"
                className="w-24 h-24 rounded-full object-cover border-2 border-blue-500"
              />
            ) : (
              <FaUserCircle className="w-24 h-24 text-gray-600 border-2 border-blue-500 rounded-full" />
            )}

            <label
              htmlFor="profilePicture"
              className="absolute -bottom-2 -right-2 bg-blue-600 p-2 rounded-full cursor-pointer hover:bg-blue-700 transition"
            >
              <FiCamera className="text-white h-5 w-5" />
            </label>
            <input
              type="file"
              id="profilePicture"
              name="profilePicture"
              accept="image/*"
              className="hidden"
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {[
            { label: "Full Name", name: "fullName", type: "text" },
            { label: "Username", name: "username", type: "text" },
            { label: "Email", name: "email", type: "email" },
            { label: "Password", name: "password", type: "password" },
            { label: "Bio", name: "bio", type: "text" },
            { label: "Date of Birth", name: "dateOfBirth", type: "date" },
          ].map(({ label, name, type }) => (
            <div key={name}>
              <label
                htmlFor={name}
                className="block text-sm text-gray-400 mb-1"
              >
                {label}
              </label>
              <input
                type={type}
                id={name}
                name={name}
                value={formData[name]}
                onChange={handleChange}
                placeholder={label}
                required={[
                  "fullName",
                  "username",
                  "email",
                  "password",
                ].includes(name)}
                className="w-full px-3 py-2 bg-[#1F1F23] border border-[#2f3336] rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-semibold transition duration-200 cursor-pointer flex justify-center items-center ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? <ClipLoader size={20} color="#fff" /> : "Sign up"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-500 hover:underline font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </section>
  );
};

export default Register;
