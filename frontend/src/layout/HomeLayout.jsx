import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { FaTwitter } from "react-icons/fa";
import TweetifyLogo from "../assets/Tweetify_Logo.png";
import { get, post } from "../services/endpoints";
import { useEffect } from "react";
import { useState } from "react";

const HomeLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [hashtags, setHashtags] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  let debounceTimer;

  useEffect(() => {
    const fetchTrendingHashtags = async () => {
      try {
        const res = await get("/tweets/trending-hashtags");
        if (res.success) {
          setHashtags(res.trending); // ← Use the correct key
        }
      } catch (error) {
        console.error("Error fetching hashtags:", error);
      }
    };

    fetchTrendingHashtags();
  }, []);

  const handleSearch = (e) => {
    if (e.key === "Enter" && searchTerm.trim()) {
      const term = searchTerm.trim();

      if (term.startsWith("@")) {
        // Navigate to profile page (remove @ from username)
        navigate(`/profile/${term.substring(1)}`);
      } else {
        // Otherwise treat as hashtag or general search
        navigate(`/?search=${encodeURIComponent(term)}`);
      }
    }
  };

  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    clearTimeout(debounceTimer);

    if (!value.trim()) {
      setSuggestions([]);
      return;
    }

    debounceTimer = setTimeout(async () => {
      try {
        const res = await get(
          `/search/suggestions?query=${encodeURIComponent(value)}`
        );
        if (res.success) {
          const combined = [
            ...(res.users || []).map((user) => ({
              type: "user",
              label: `@${user.username}`,
              value: user.username,
            })),
            ...(res.hashtags || []).map((tag) => ({
              type: "hashtag",
              label: `#${tag.hashtag}`,
              value: tag.hashtag,
            })),
          ];
          setSuggestions(combined);
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      }
    }, 300);
  };

  const handleHashtagClick = (tag) => {
    navigate(`/?search=${encodeURIComponent(tag)}`);
  };

  useEffect(() => {
    const handleClickOutside = () => setShowSuggestions(false);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await post("/users/logout");
      logout(); // clear auth store + localStorage
      navigate("/login", { state: { from: location }, replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="grid grid-cols-12 min-h-screen bg-[#000] text-white">
      {/* LEFT SIDEBAR */}
      <aside className="col-span-3 p-4 space-y-6 border-r border-gray-800 h-screen overflow-y-auto bg-black text-white">
        {/* Profile Info */}

        <div className="flex flex-col items-center bg-[#16181C] p-4 rounded">
          <Link to="/">
            <img src={TweetifyLogo} alt="Tweetify Logo" className="w-16 h-16" />
            <h2 className="text-lg font-semibold mt-2 text-white text-center">
              Tweetify
            </h2>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="bg-[#16181C] p-4 rounded space-y-4">
          <ul className="space-y-3 text-[#1D9BF0] font-medium">
            <li>
              <Link
                to={`/profile/${user?.username}`}
                className="hover:text-white"
              >
                👤 Profile
              </Link>
            </li>
            <li>
              <Link to="/bookmarks" className="hover:text-white">
                📑 Bookmarks
              </Link>
            </li>
          </ul>
        </nav>

        {/* Admin Section */}
        {user?.role === "admin" && (
          <div className="bg-[#16181C] p-4 rounded space-y-3">
            <h3 className="text-sm uppercase text-gray-400">Admin Panel</h3>
            <ul className="space-y-2 text-[#1D9BF0] font-medium">
              <li>
                <Link to="/admin/users" className="hover:text-white">
                  🧑‍💻 All Users
                </Link>
              </li>
              <li>
                <Link to="/admin/toggle-status" className="hover:text-white">
                  🔄 Toggle Status
                </Link>
              </li>
              <li>
                <Link to="/admin/change-role" className="hover:text-white">
                  🛠️ Change Role
                </Link>
              </li>
            </ul>
          </div>
        )}

        {/* Settings & Logout */}
        <div className="bg-[#16181C] p-4 rounded space-y-2">
          <ul className="space-y-2 text-[#1D9BF0] font-medium">
            <li>
              <Link to="/settings" className="hover:text-white">
                ⚙️ Settings
              </Link>
            </li>
            <li>
              <button
                className="text-left w-full hover:text-red-500 cursor-pointer"
                onClick={handleLogout}
              >
                🚪 Logout
              </button>
            </li>
          </ul>
        </div>
      </aside>

      {/* CENTER CONTENT */}
      <main className="col-span-6 p-4 space-y-6 overflow-y-auto max-h-screen">
        <Outlet />
      </main>

      {/* RIGHT SIDEBAR */}
      <aside className="col-span-3 p-4 space-y-4 border-l border-gray-800 h-screen overflow-y-auto">
        <div className="bg-[#16181C] p-4 rounded relative">
          <input
            type="text"
            placeholder="Search Twitter"
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={handleSearch}
            className="w-full p-2 bg-[#000] border border-gray-700 text-white rounded focus:outline-none focus:border-[#1D9BF0]"
          />

          {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute top-full left-0 w-full bg-[#1E1E1E] border border-gray-700 mt-1 z-50 rounded shadow-lg text-white max-h-48 overflow-y-auto">
              {suggestions.map((item, idx) => (
                <li
                  key={idx}
                  onClick={() => {
                    setShowSuggestions(false);
                    setSearchTerm("");
                    if (item.type === "user") {
                      navigate(`/profile/${item.value}`);
                    } else {
                      navigate(`/?search=%23${item.value}`);
                    }
                  }}
                  className="px-4 py-2 hover:bg-[#2a2a2a] cursor-pointer"
                >
                  {item.label}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-[#16181C] p-4 rounded">
          <h3 className="font-semibold mb-2 text-white">Trending</h3>
          <ul className="space-y-1 text-sm text-gray-400">
            {hashtags.length > 0 ? (
              hashtags.map((item, i) => (
                <li
                  key={i}
                  onClick={() => handleHashtagClick(item.hashtag)}
                  className="hover:text-[#1D9BF0] cursor-pointer"
                >
                  {item.hashtag}
                </li>
              ))
            ) : (
              <li className="text-gray-500">No trends available</li>
            )}
          </ul>
        </div>
      </aside>
    </div>
  );
};

export default HomeLayout;
