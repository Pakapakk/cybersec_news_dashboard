"use client";

import useSWR from "swr";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";

const fetcher = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch bookmarks");
  return res.json();
};

export function useBookmarks() {
  const [user, loading, error] = useAuthState(auth);

  const shouldFetch = user && !loading && !error;
  const { data, mutate, isLoading, error: fetchError } = useSWR(
    shouldFetch ? `/api/cyber-news-bookmark?userId=${user.uid}` : null,
    fetcher
  );

  return {
    bookmarks: data || [],
    mutate,
    isLoading,
    error: error || fetchError,
  };
}
