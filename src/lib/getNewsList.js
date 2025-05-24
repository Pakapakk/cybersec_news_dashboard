export async function getNewsList() {
  try {
    const response = await fetch("/api/cyber-news-router", {
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Fetch failed: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (err) {
    console.error("getNewsList error:", err);
    throw err;
  }
}