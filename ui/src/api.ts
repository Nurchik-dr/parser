export const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

export type FeedItem = {
  title: string;
  link: string;
  pubDate: string;
  summary: string;
  image: string;
  source: string;
  category: "news" | "instagram";
};

export const fetchJson = async <T,>(path: string): Promise<T> => {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
};
