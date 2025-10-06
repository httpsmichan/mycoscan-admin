"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }) {
  const pathname = usePathname();

  const tabs = [
    { name: "Dashboard", path: "/admin/dashboard" },
    { name: "DVO Mushrooms", path: "/admin/mushroom-encyclopedia" },
    { name: "Requests", path: "/admin/verification-requests" },
    { name: "Manage Users", path: "/admin/users" },
    { name: "Manage Achievements", path: "/admin/achievements" },
    { name: "User Uploads", path: "/admin/user-uploads" },
  ];

  return (
    <div className="flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white flex flex-col p-4 h-screen sticky top-0">
        <h1 className="text-2xl font-bold mb-8">Admin Portal</h1>
        <nav className="flex flex-col gap-3">
          {tabs.map((tab) => (
            <Link
              key={tab.path}
              href={tab.path}
              className={`px-3 py-2 rounded-lg transition ${
                pathname === tab.path ? "bg-gray-700" : "hover:bg-gray-700"
              }`}
            >
              {tab.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 bg-gray-100">{children}</main>
    </div>
  );
}
