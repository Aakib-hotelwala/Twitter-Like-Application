import { Routes, Route, Navigate } from "react-router-dom";
import HomeLayout from "../src/layout/HomeLayout";
import Login from "../src/pages/Login";
import ProtectedRoute from "../src/components/ProtectedRoute";
import useThemeStore from "../src/store/themeStore";
import { useEffect } from "react";
import TweetFeed from "../src/pages/TweetFeed";
import TweetPage from "./pages/TweetPage";
import Register from "./pages/Register";
import EditProfile from "./pages/EditProfile";
import BookmarkedTweets from "./pages/BookmarkedTweets";
import UserProfile from "./pages/UserProfile";

const App = () => {
  const { theme } = useThemeStore();

  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
  }, [theme]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected layout route */}
      <Route element={<ProtectedRoute allowedRoles={["user", "admin"]} />}>
        <Route path="/" element={<HomeLayout />}>
          {/* Nested routes under layout */}
          <Route index element={<TweetFeed />} /> {/* 🟢 default home */}
          <Route path="tweet/:id" element={<TweetPage />} />
          <Route path="profile/:username" element={<UserProfile />} />
          <Route path="bookmarks" element={<BookmarkedTweets />} />
          <Route path="edit-profile" element={<EditProfile />} />
          {/* Add likes/comments later if needed */}
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
};

export default App;
