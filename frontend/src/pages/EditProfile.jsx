import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import { FiCamera } from "react-icons/fi";
import { put } from "../services/endpoints";
import ClipLoader from "react-spinners/ClipLoader";

const EditProfile = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const user = state?.user;

  const [formData, setFormData] = useState({
    fullName: "",
    bio: "",
    dateOfBirth: "",
    profilePicture: "",
  });

  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        bio: user.bio || "",
        dateOfBirth: user.dateOfBirth
          ? new Date(user.dateOfBirth).toISOString().split("T")[0]
          : "",
        profilePicture: user.profilePicture || "",
      });

      if (user.profilePicture) {
        setPreview(user.profilePicture);
      }
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "profilePicture" && files[0]) {
      const file = files[0];
      setFormData((prev) => ({ ...prev, profilePicture: file }));
      setPreview(URL.createObjectURL(file));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const form = new FormData();
    form.append("fullName", formData.fullName);
    form.append("bio", formData.bio);
    form.append("dateOfBirth", formData.dateOfBirth);

    if (formData.profilePicture && formData.profilePicture instanceof File) {
      form.append("profilePicture", formData.profilePicture);
    }

    try {
      await put("/users/update-profile", form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      navigate("/profile");
    } catch (error) {
      console.error("Profile update failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-[#16181C] p-6 rounded text-white">
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
          { label: "Bio", name: "bio", type: "text" },
          { label: "Date of Birth", name: "dateOfBirth", type: "date" },
        ].map(({ label, name, type }) => (
          <div key={name}>
            <label htmlFor={name} className="block text-sm text-gray-400 mb-1">
              {label}
            </label>
            <input
              type={type}
              id={name}
              name={name}
              value={formData[name]}
              onChange={handleChange}
              placeholder={label}
              className="w-full px-3 py-2 bg-[#1F1F23] border border-[#2f3336] rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded flex items-center justify-center"
          disabled={loading}
        >
          {loading ? <ClipLoader size={20} color="#fff" /> : "Save Changes"}
        </button>
      </form>
    </div>
  );
};

export default EditProfile;
