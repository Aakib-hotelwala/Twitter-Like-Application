import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaCalendarAlt, FaUserCircle } from "react-icons/fa";
import { get } from "../services/endpoints";
import useAuthStore from "../store/authStore";
import ClipLoader from "react-spinners/ClipLoader";
import TweetsByUsername from "../components/TweetsByUsername";

const UserProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore(); // get logged-in user

  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        let res;
        if (!username || username === currentUser?.username) {
          // If no username in URL or viewing own profile
          res = await get("/users/current-user");
        } else {
          // Viewing another user's profile
          res = await get(`/users/${username}`);
        }
        setProfileUser(res.user);
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [username, currentUser]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <ClipLoader color="#9ca3af" size={40} />
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="text-center text-gray-400 py-20">User not found.</div>
    );
  }

  const isCurrentUser = profileUser.username === currentUser?.username;

  return (
    <>
      <div className="max-w-2xl mx-auto mt-8 bg-[#16181C] text-white p-4 rounded border border-gray-700">
        {/* Avatar + Edit Button */}
        <div className="flex items-center justify-between px-6 pt-6">
          {profileUser.profilePicture ? (
            <img
              src={profileUser.profilePicture}
              alt={profileUser.username}
              className="w-28 h-28 rounded-full border-4 border-gray-800 object-cover"
            />
          ) : (
            <FaUserCircle className="w-28 h-28 text-gray-600 border-4 border-gray-800 rounded-full" />
          )}

          {isCurrentUser && (
            <button
              onClick={() =>
                navigate("/edit-profile", { state: { user: profileUser } })
              }
              className="px-5 py-2 border border-gray-600 rounded-full text-white hover:bg-blue-700 transition cursor-pointer"
            >
              Edit Profile
            </button>
          )}
        </div>

        {/* User Info */}
        <div className="px-6 pb-6 mt-4">
          <h2 className="text-2xl font-bold">{profileUser.fullName}</h2>
          <p className="text-gray-400 text-lg">@{profileUser.username}</p>

          {profileUser.bio && (
            <p className="mt-3 text-gray-300">{profileUser.bio}</p>
          )}

          <div className="flex items-center gap-2 text-sm text-gray-500 mt-4">
            <FaCalendarAlt />
            <span>
              Joined{" "}
              {new Date(profileUser.createdAt).toLocaleString("default", {
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>

          <div className="flex gap-8 mt-5 text-sm font-semibold">
            <span>
              <span className="text-white">{profileUser.following.length}</span>{" "}
              Following
            </span>
            <span>
              <span className="text-white">{profileUser.followers.length}</span>{" "}
              Followers
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-center max-w-2xl mx-auto mt-8 px-4 border-b border-gray-700 pb-2">
        <h3 className="text-xl font-bold text-white ">Tweets</h3>
      </div>

      {/* User's Tweets */}
      <div className="space-y-4 mt-4">
        <TweetsByUsername username={profileUser.username} />
      </div>
    </>
  );
};

export default UserProfile;
