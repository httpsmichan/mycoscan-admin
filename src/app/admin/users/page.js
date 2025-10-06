"use client";
import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ username: "", email: "" });
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Load users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const userList = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setUsers(userList);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 🔹 Add new user
  const handleAddUser = async () => {
    if (!newUser.username || !newUser.email) return;
    try {
      await addDoc(collection(db, "users"), {
        username: newUser.username,
        email: newUser.email,
        isActive: true,
      });
      setNewUser({ username: "", email: "" });
      fetchUsers();
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  // 🔹 Toggle active
  const handleToggleActive = async (id, currentStatus) => {
    try {
      const userRef = doc(db, "users", id);
      await updateDoc(userRef, { isActive: !currentStatus });
      fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  // 🔹 Start editing user
  const handleEdit = (user) => {
    // clone to avoid editing directly in state
    setEditingUser({ ...user });
  };

  // 🔹 Save updated user
  const handleUpdate = async () => {
    if (!editingUser.username || !editingUser.email) return;
    try {
      const userRef = doc(db, "users", editingUser.id);
      await updateDoc(userRef, {
        username: editingUser.username,
        email: editingUser.email,
      });
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  // 🔹 Delete user
  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "users", id));
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  if (loading) return <p>Loading users...</p>;

  return (
    <div>
      <h2 className="text-xl text-center font-bold text-gray-700 mb-4">Manage Users</h2>

      {/* Add User */}
      <div className="mb-6 flex gap-2">
        <input
          type="text"
          placeholder="Username"
          value={newUser.username}
          onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
          className="px-3 py-2 border rounded-lg"
        />
        <input
          type="email"
          placeholder="Email"
          value={newUser.email}
          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          className="px-3 py-2 border rounded-lg"
        />
        <button
          onClick={handleAddUser}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add
        </button>
      </div>

      {/* User List */}
      <table className="w-full bg-white shadow rounded-lg overflow-hidden">
        <thead className="bg-gray-200">
          <tr>
            <th className="px-4 py-2 text-left">Username</th>
            <th className="px-4 py-2 text-left">Email</th>
            <th className="px-4 py-2">Active</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t">
              <td className="px-4 py-2">
                {editingUser?.id === u.id ? (
                  <input
                    type="text"
                    value={editingUser.username}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        username: e.target.value,
                      })
                    }
                    className="px-2 py-1 border rounded"
                  />
                ) : (
                  u.username
                )}
              </td>
              <td className="px-4 py-2">
                {editingUser?.id === u.id ? (
                  <input
                    type="email"
                    value={editingUser.email}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        email: e.target.value,
                      })
                    }
                    className="px-2 py-1 border rounded"
                  />
                ) : (
                  u.email
                )}
              </td>
              <td className="px-4 py-2 text-center">
                <button
                  onClick={() => handleToggleActive(u.id, u.isActive)}
                  className={`px-3 py-1 rounded-lg ${
                    u.isActive
                      ? "bg-green-500 text-white"
                      : "bg-red-500 text-white"
                  }`}
                >
                  {u.isActive ? "Active" : "Inactive"}
                </button>
              </td>
              <td className="px-4 py-2 text-center space-x-2">
                {editingUser?.id === u.id ? (
                  <button
                    onClick={handleUpdate}
                    className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Save
                  </button>
                ) : (
                  <button
                    onClick={() => handleEdit(u)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                )}
                <button
                  onClick={() => handleDelete(u.id)}
                  className="px-3 py-1 bg-gray-700 text-white rounded-lg hover:bg-gray-900"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}

          {users.length === 0 && (
            <tr>
              <td colSpan="4" className="text-center py-4 text-gray-500">
                No users found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
