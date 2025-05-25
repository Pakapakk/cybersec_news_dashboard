import useSWR from "swr";

const fetcher = (...args) => fetch(...args).then(res => res.json());

export function useBookmarks() {
    const { data, error, mutate } = useSWR("/api/cyber-news-bookmark", fetcher, {
        refreshInterval: 0,
    });

    return {
        bookmarks: data || [],
        isLoading: !error && !data,
        isError: error,
        mutate,
    };
}
