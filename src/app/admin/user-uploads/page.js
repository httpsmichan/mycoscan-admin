"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function ManageUploads() {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "posts"));
        const postsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPosts(postsData);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleDelete = async (postId) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      await deleteDoc(doc(db, "posts", postId));
      setPosts(posts.filter((p) => p.id !== postId));
      if (selectedPost?.id === postId) setSelectedPost(null);
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const fetchComments = async (postId) => {
    try {
      setCommentsLoading(true);
      const commentsRef = collection(db, "posts", postId, "comments");
      const snap = await getDocs(commentsRef);
      const commentsData = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setComments(commentsData);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    if (!confirm("Delete this comment?")) return;
    try {
      await deleteDoc(doc(db, "posts", postId, "comments", commentId));
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const handleSelectPost = async (post) => {
    setSelectedPost(post);
    await fetchComments(post.id);
  };

  const filteredPosts = posts.filter((post) => {
    const searchLower = search.toLowerCase();
    return Object.values(post).some((value) =>
      String(value).toLowerCase().includes(searchLower)
    );
  });

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading posts...</p>
      </div>
    );

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-gray-100 p-4">
      <h1 className="text-xl font-bold text-gray-700 mb-4 text-center">
        Manage Posts
      </h1>

      <input
        type="text"
        placeholder="Search posts..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-6 p-2 w-full max-w-md rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      {filteredPosts.length === 0 ? (
        <p>No posts found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full max-w-6xl">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-lg shadow-sm p-2 flex flex-col items-center text-sm relative cursor-pointer hover:shadow-lg transition"
              onClick={() => handleSelectPost(post)}
            >
              <img
                src={post.imageUrl}
                alt={post.mushroomType}
                className="w-full h-32 object-cover rounded mb-2"
              />
              <h2 className="font-semibold">{post.mushroomType}</h2>
              <p className="text-gray-500">{post.category}</p>
              <p className="text-gray-400 text-xs">
                {post.username} - {post.verified}
              </p>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(post.id);
                }}
                className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedPost && (
  <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    {/* Outer container */}
    <div className="relative bg-white/80 backdrop-blur-md rounded-xl shadow-xl flex flex-col md:flex-row w-full max-w-5xl border border-white/40 overflow-hidden">

      {/* Close button */}
      <button
        onClick={() => {
          setSelectedPost(null);
          setComments([]);
        }}
        className="absolute top-3 right-3 text-gray-700 hover:text-black font-bold text-lg z-50"
      >
        ✕
      </button>

      {/* Post details (left) */}
      <div className="w-full md:w-1/2 p-6 overflow-y-auto max-h-[90vh]">
        <img
          src={selectedPost.imageUrl}
          alt={selectedPost.mushroomType}
          className="w-full h-48 object-cover rounded-lg mb-4 shadow"
        />
        <h2 className="text-xl font-semibold mb-2 text-gray-800">
          {selectedPost.mushroomType}
        </h2>
        <p className="text-gray-700 mb-1">
          <strong>Category:</strong> {selectedPost.category}
        </p>
        <p className="text-gray-700 mb-1">
          <strong>Description:</strong> {selectedPost.description}
        </p>
        <p className="text-gray-700 mb-1">
          <strong>Location:</strong> {selectedPost.location} (
          {selectedPost.latitude}, {selectedPost.longitude})
        </p>
        <p className="text-gray-700 mb-1">
          <strong>User:</strong> {selectedPost.username}
        </p>
        <p className="text-gray-700 mb-1">
          <strong>Verified:</strong> {selectedPost.verified}
        </p>
        <p className="text-gray-700 mb-1">
          <strong>Timestamp:</strong>{" "}
          {new Date(selectedPost.timestamp).toLocaleString()}
        </p>
      </div>

      {/* Comments panel (right) */}
      <div className="w-full md:w-1/2 p-6 border-t md:border-t-0 md:border-l border-gray-300 bg-white/60 backdrop-blur-sm overflow-y-auto max-h-[90vh]">
        <h3 className="font-semibold mb-3 text-gray-800">
          Comments ({comments.length})
        </h3>

        {commentsLoading ? (
          <p className="text-gray-600 text-sm">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="text-gray-600 text-sm">No comments available.</p>
        ) : (
          <ul className="space-y-2">
            {comments.map((comment) => (
              <li
                key={comment.id}
                className="border rounded-lg p-2 bg-white/70 backdrop-blur-sm flex justify-between items-center shadow-sm"
              >
                <div>
                  <p className="text-sm text-gray-800">{comment.text}</p>
                  <p className="text-xs text-gray-500">
                    {comment.user} •{" "}
                    {new Date(comment.timestamp?.seconds * 1000).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() =>
                    handleDeleteComment(selectedPost.id, comment.id)
                  }
                  className="text-red-500 text-xs hover:underline"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  </div>
)}


    </div>
  );
}
