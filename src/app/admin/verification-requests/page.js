"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { saveAs } from "file-saver";

export default function ReportsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "applications"));
      const apps = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((app) => !["approved", "declined"].includes(app.status)); // 🔹 hide approved/declined
      setApplications(apps);
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status, gmail) => {
    try {
      // Update application status
      await updateDoc(doc(db, "applications", id), { status });

      // Add log entry
      await addDoc(collection(db, "logs"), {
        userID: "admin",
        action: `User ${gmail} was verified (${status})`,
        timestamp: Date.now(),
      });

      // Remove the item from display
      setApplications((prev) => prev.filter((app) => app.id !== id));
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // Download PDF with custom filename
  const downloadPdf = (url, filename = "document.pdf") => {
    saveAs(url, filename);
  };

  if (loading) return <p>Loading requests...</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl text-center font-bold text-gray-700 mb-4">Requests</h2>

      {applications.length === 0 ? (
        <p>No requests found.</p>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="p-4 border rounded shadow flex flex-col gap-2"
            >
              <p>
                <strong>User:</strong> {app.gmail}
              </p>
              <p>
                <strong>Institution:</strong> {app.institution}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span className="text-yellow-600">{app.status}</span>
              </p>
              <p>
                <strong>File:</strong>{" "}
                {app.fileUrl.endsWith(".pdf") ? (
                  <button
                    className="text-blue-600 underline"
                    onClick={() => downloadPdf(app.fileUrl, `${app.gmail}_tor.pdf`)}
                  >
                    Download PDF
                  </button>
                ) : (
                  <a
                    href={app.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    View File
                  </a>
                )}
              </p>

              <div className="flex gap-2 mt-2">
                <button
                  className="px-3 py-1 bg-green-600 text-white rounded"
                  onClick={() => updateStatus(app.id, "approved", app.gmail)}
                >
                  Approve
                </button>
                <button
                  className="px-3 py-1 bg-red-600 text-white rounded"
                  onClick={() => updateStatus(app.id, "declined", app.gmail)}
                >
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
