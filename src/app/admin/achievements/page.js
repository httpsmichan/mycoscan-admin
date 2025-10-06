"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
} from "firebase/firestore";

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  // form fields
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [badgeImage, setBadgeImage] = useState("");
  const [loading, setLoading] = useState(false);

  // fetch achievements
  const fetchData = async () => {
    const querySnapshot = await getDocs(collection(db, "achievements"));
    const items = querySnapshot.docs.map((docSnap) => ({
      docId: docSnap.id,
      ...docSnap.data(),
    }));
    setAchievements(items);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const clearForm = () => {
    setCategory("");
    setTitle("");
    setDescription("");
    setBadgeImage("");
    setSelectedId(null);
  };

  const handleSelect = (a) => {
    setSelectedId(a.docId);
    setCategory(a.category || "");
    setTitle(a.title || "");
    setDescription(a.description || "");
    setBadgeImage(a.badgeImage || "");
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "mushrooms"); 

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/diaw4uoea/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await res.json();
      setBadgeImage(data.secure_url); 
    } catch (err) {
      console.error("Cloudinary upload error", err);
      alert("❌ Failed to upload image");
    }
  };

  // save or update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = {
      category,
      title,
      description,
      badgeImage,
    };

    try {
      if (selectedId) {
        await updateDoc(doc(db, "achievements", selectedId), data);
        alert("✅ Achievement updated!");
      } else {
        await addDoc(collection(db, "achievements"), data);
        alert("✅ Achievement added!");
      }
      clearForm();
      fetchData();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to save achievement");
    }
    setLoading(false);
  };

  // delete
  const handleDelete = async () => {
    if (!selectedId) return;
    if (!confirm("Delete this achievement?")) return;
    try {
      await deleteDoc(doc(db, "achievements", selectedId));
      alert("🗑️ Deleted!");
      clearForm();
      fetchData();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to delete achievement");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl text-center font-bold text-gray-700 mb-4">Achievements</h2>
        <button
          type="button"
          onClick={clearForm}
          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
        >
          + Add New
        </button>
      </div>

      {/* Achievement List */}
      <div className="flex flex-wrap gap-2 text-sm mb-10">
        {achievements.map((a) => (
          <button
            key={a.docId}
            onClick={() => handleSelect(a)}
            className={`px-3 py-1 border rounded ${
              selectedId === a.docId ? "bg-blue-200" : "bg-gray-100"
            }`}
          >
            {a.title}
          </button>
        ))}
      </div>

      {/* Form */}
      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Category */}
        <div>
          <label className="block font-medium mb-1">Category</label>
          <input
            type="text"
            className="border px-3 py-2 rounded w-full"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. Knowledge"
          />
        </div>

        {/* Title */}
        <div>
          <label className="block font-medium mb-1">Title</label>
          <input
            type="text"
            className="border px-3 py-2 rounded w-full"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Apprentice Mycologist"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block font-medium mb-1">Description</label>
          <textarea
            rows="2"
            className="border px-3 py-2 rounded w-full"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Identify 20 mushrooms."
          />
        </div>

        {/* Badge Image Upload */}
        <div>
          <label className="block font-medium mb-1">Badge Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="mb-2"
          />
          {badgeImage && (
            <img
              src={badgeImage}
              alt="Badge Preview"
              className="w-16 h-16 object-cover border rounded"
            />
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            type="submit"
            className={`px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${
              loading ? "opacity-50" : ""
            }`}
            disabled={loading}
          >
            {selectedId ? "Update" : "Save"}
          </button>
          {selectedId && (
            <button
              type="button"
              onClick={handleDelete}
              className="px-5 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Delete
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
