"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    posts: 0,
    users: 0,
    activeUsers: 0,
  });

  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const postsSnap = await getDocs(collection(db, "posts"));
        const usersSnap = await getDocs(collection(db, "users"));

        // summary counts
        setStats({
          posts: postsSnap.size,
          users: usersSnap.size,
          activeUsers: usersSnap.docs.filter((d) => {
            const data = d.data();
            const lastLogin = data.lastLogin;
            if (!lastLogin) return false;
            const loginDate = lastLogin.toDate ? lastLogin.toDate() : new Date(lastLogin);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return loginDate >= today;
          }).length,
        });

        // helper: count docs by date (month)
        const countByDay = (snap, field) => {
          const counts = {};
          snap.forEach((doc) => {
            const data = doc.data();
            const ts = data[field];
            if (!ts) return;
            const dateObj = ts.toDate ? ts.toDate() : new Date(ts);
            if (isNaN(dateObj)) return;
            const date = dateObj.toISOString().slice(0, 10);
            counts[date] = (counts[date] || 0) + 1;
          });
          return counts;
        };

        const postsByDay = countByDay(postsSnap, "timestamp");
        const usersByDay = countByDay(usersSnap, "createdAt");

        // generate month days
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const data = [];
        for (let d = 1; d <= daysInMonth; d++) {
          const date = new Date(year, month, d).toISOString().slice(0, 10);
          data.push({
            date: date.slice(5), // show MM-DD
            posts: postsByDay[date] || 0,
            users: usersByDay[date] || 0,
          });
        }

        setChartData(data);
      } catch (error) {
        console.error("🔥 Error fetching stats:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h2 className="text-xl text-center font-bold text-gray-700 mb-4">Dashboard</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
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

      {/* Line Chart */}
      <div className="p-6 bg-white shadow rounded-lg">
        <h3 className="text-lg font-semibold mb-4">This Month's Activity</h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="posts" stroke="#3b82f6" name="Posts" />
            <Line type="monotone" dataKey="users" stroke="#10b981" name="New Users" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
