"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    posts: 0,
    users: 0,
    activeUsers: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const postsRef = collection(db, "posts");
        const usersRef = collection(db, "users");

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayTimestamp = todayStart.getTime();

        const activeUsersQuery = query(
          usersRef,
          where("lastLogin", ">=", todayTimestamp)
        );

        const [postsSnap, usersSnap, activeSnap] = await Promise.all([
          getDocs(postsRef),
          getDocs(usersRef),
          getDocs(activeUsersQuery),
        ]);

        setStats({
          posts: postsSnap.size,
          users: usersSnap.size,
          activeUsers: activeSnap.size,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">📊 Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 bg-white shadow rounded-lg text-center">
          <h3 className="text-lg font-semibold">Total Posts</h3>
          <p className="text-2xl font-bold">{stats.posts}</p>
        </div>
        <div className="p-6 bg-white shadow rounded-lg text-center">
          <h3 className="text-lg font-semibold">Total Users</h3>
          <p className="text-2xl font-bold">{stats.users}</p>
        </div>
        <div className="p-6 bg-white shadow rounded-lg text-center">
          <h3 className="text-lg font-semibold">Active Users (Today)</h3>
          <p className="text-2xl font-bold">{stats.activeUsers}</p>
        </div>
      </div>
    </div>
  );
}
