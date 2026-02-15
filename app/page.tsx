"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ---------------- AUTH CHECK ----------------
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        router.push("/login");
      } else {
        setUser(data.session.user);
      }

      setLoading(false);
    };

    getUser();
  }, [router]);

  // ---------------- FETCH BOOKMARKS ----------------
  const fetchBookmarks = async () => {
    const { data, error } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false });

    if (!error) {
      setBookmarks(data || []);
    }
  };

  // ---------------- REALTIME ----------------
  useEffect(() => {
    if (!user) return;

    fetchBookmarks();

    const channel = supabase
      .channel(`user-bookmarks-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookmarks",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("Realtime:", payload);

          if (payload.eventType === "INSERT") {
            setBookmarks((prev) => [payload.new, ...prev]);
          }

          if (payload.eventType === "DELETE") {
            setBookmarks((prev) => prev.filter((b) => b.id !== payload.old.id));
          }

          if (payload.eventType === "UPDATE") {
            setBookmarks((prev) =>
              prev.map((b) => (b.id === payload.new.id ? payload.new : b)),
            );
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // ---------------- ADD BOOKMARK ----------------
  const addBookmark = async () => {
    if (!title.trim() || !url.trim()) return;

    const { error } = await supabase.from("bookmarks").insert([
      {
        title,
        url,
        user_id: user.id,
      },
    ]);

    if (error) {
      console.error("Insert error:", error);
    } else {
      setTitle("");
      setUrl("");
    }
  };

  // ---------------- DELETE BOOKMARK ----------------
  const deleteBookmark = async (id: string) => {
    const { error } = await supabase.from("bookmarks").delete().eq("id", id);

    if (!error) {
      // instantly remove from UI
      setBookmarks((prev) => prev.filter((bookmark) => bookmark.id !== id));
    }
  };

  // ---------------- LOGOUT ----------------
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading)
    return <p className="text-center mt-10 text-gray-600">Loading...</p>;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex justify-center py-12 px-4">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl p-8">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              🔖 Smart Bookmark
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Logged in as {user.email}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
          >
            Logout
          </button>
        </div>

        {/* ADD BOOKMARK */}
        <div className="bg-gray-50 rounded-2xl p-5 shadow-inner mb-6">
          <div className="space-y-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Bookmark Title"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500"
            />

            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500"
            />

            <button
              onClick={addBookmark}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-semibold transition"
            >
              + Add Bookmark
            </button>
          </div>
        </div>

        {/* BOOKMARK LIST */}
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-3">
            Your Bookmarks
          </h2>

          {bookmarks.length === 0 ? (
            <div className="text-center py-6 text-gray-400">
              🚀 No bookmarks yet
            </div>
          ) : (
            <div className="space-y-3">
              {bookmarks.map((bookmark) => (
                <div
                  key={bookmark.id}
                  className="flex justify-between items-center bg-white border border-gray-200 p-4 rounded-xl shadow-sm hover:shadow-md transition"
                >
                  <div className="flex flex-col overflow-hidden">
                    <span className="font-semibold text-gray-800 truncate">
                      {bookmark.title}
                    </span>
                    <a
                      href={bookmark.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 truncate hover:underline"
                    >
                      {bookmark.url}
                    </a>
                  </div>

                  <button
                    onClick={() => deleteBookmark(bookmark.id)}
                    className="text-red-500 hover:text-red-600 text-xl"
                  >
                    🗑
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
