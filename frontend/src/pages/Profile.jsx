import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCalendarAlt, FaUserCircle } from "react-icons/fa";
import { get } from "../services/endpoints";
import ClipLoader from "react-spinners/ClipLoader";

const Profile = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await get("/users/current-user");
        console.log("User fetch response:", res);

        const userData = res.user;
        if (!userData) throw new Error("User data missing");

        setUser(userData);
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };

    fetchUser();
  }, []);

  if (!user)
    return (
      <div className="flex justify-center items-center py-20">
        <ClipLoader color="#9ca3af" size={40} />
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto mt-8 bg-[#16181C] text-white p-4 rounded border border-gray-700">
      {/* Avatar and Edit Button */}
      <div className="flex items-center justify-between px-6 pt-6">
        {user.profilePicture ? (
          <img
            src={user.profilePicture}
            alt={user.username}
            className="w-28 h-28 rounded-full border-4 border-gray-800 object-cover"
          />
        ) : (
          <FaUserCircle className="w-28 h-28 text-gray-600 border-4 border-gray-800 rounded-full" />
        )}
        <button
          onClick={() => navigate("/edit-profile", { state: { user } })}
          className="px-5 py-2 border border-gray-600 rounded-full text-white hover:bg-blue-700 transition cursor-pointer"
        >
          Edit Profile
        </button>
      </div>

      {/* User Info */}
      <div className="px-6 pb-6 mt-4">
        <h2 className="text-2xl font-bold">{user.fullName}</h2>
        <p className="text-gray-400 text-lg">@{user.username}</p>

        {user.bio && <p className="mt-3 text-gray-300">{user.bio}</p>}

        <div className="flex items-center gap-2 text-sm text-gray-500 mt-4">
          <FaCalendarAlt />
          <span>
            Joined{" "}
            {new Date(user.createdAt).toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>

        <div className="flex gap-8 mt-5 text-sm font-semibold">
          <span>
            <span className="text-white">{user.following.length}</span>{" "}
            Following
          </span>
          <span>
            <span className="text-white">{user.followers.length}</span>{" "}
            Followers
          </span>
        </div>
      </div>
    </div>
  );
};

export default Profile;
