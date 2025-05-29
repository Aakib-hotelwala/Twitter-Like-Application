import { Outlet, Link } from "react-router-dom";
import useAuthStore from "../store/authStore";

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
      <aside className="col-span-3 p-4 space-y-4 border-r border-gray-800 h-screen overflow-y-auto">
        <div className="bg-[#16181C] p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">
            Welcome, {user?.fullName}
          </h2>
          <img
            src={user?.profilePicture || "/default-avatar.png"}
            alt="profile"
            className="w-16 h-16 rounded-full mx-auto"
          />
        </div>
        <div className="bg-[#16181C] p-4 rounded">
          <ul className="space-y-2 text-[#1D9BF0] font-medium">
            <li>
              <Link to="">Home</Link>
            </li>
            <li>
              <Link to="profile">Profile</Link>
            </li>
            <li>
              <Link to="likes">Likes</Link>
            </li>
            <li>
              <Link to="comments">Comments</Link>
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
