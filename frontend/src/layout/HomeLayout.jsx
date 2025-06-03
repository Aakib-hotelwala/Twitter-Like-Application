import { Outlet, Link } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { FaTwitter } from "react-icons/fa";
import TweetifyLogo from "../assets/Tweetify_Logo.png";

const HomeLayout = () => {
  const { user } = useAuthStore();

  const hashtags = [
    "#ReactJS",
    "#WebDev",
    "#OpenAI",
    "#TailwindCSS",
    "#JavaScript",
  ];

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
              <Link to="/" className="hover:text-white">
                🏠 Home
              </Link>
            </li>
            <li>
              <Link to="/profile" className="hover:text-white">
                👤 Profile
              </Link>
            </li>
            <li>
              <Link to="/likes" className="hover:text-white">
                ❤️ Likes
              </Link>
            </li>
            <li>
              <Link to="/comments" className="hover:text-white">
                💬 Comments
              </Link>
            </li>
            <li>
              <Link to="/following" className="hover:text-white">
                🔁 Following
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
                className="text-left w-full hover:text-red-500"
                onClick=""
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
        <div className="bg-[#16181C] p-4 rounded">
          <input
            type="text"
            placeholder="Search Twitter"
            className="w-full p-2 bg-[#000] border border-gray-700 text-white rounded focus:outline-none focus:border-[#1D9BF0]"
          />
        </div>
        <div className="bg-[#16181C] p-4 rounded">
          <h3 className="font-semibold mb-2 text-white">Trending</h3>
          <ul className="space-y-1 text-sm text-gray-400">
            {hashtags.map((tag, i) => (
              <li key={i} className="hover:text-[#1D9BF0] cursor-pointer">
                {tag}
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
};

export default HomeLayout;
