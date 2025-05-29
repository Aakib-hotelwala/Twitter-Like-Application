const Comment = ({ comment }) => {
  return (
    <div className="border-t border-gray-700 pt-4 mt-4">
      <div className="flex items-start gap-3">
        <img
          src={comment.user.profilePicture || "/default-avatar.png"}
          alt="profile"
          className="w-8 h-8 rounded-full"
        />
        <div>
          <p className="text-sm text-gray-300 font-semibold">
            {comment.user.fullName}{" "}
            <span className="text-gray-500">@{comment.user.username}</span>
          </p>
          <p className="text-gray-200 mt-1">{comment.text}</p>
          <p className="text-xs text-gray-500 mt-1">
            {new Date(comment.createdAt).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Comment;
