import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import {
  defaultInstagramTags,
  defaultNewsFeeds,
  fetchCombined,
  fetchInstagramByTag,
  fetchNews,
} from "../../parser/src/index.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const parseLimit = (value, fallback) => {
  const parsed = Number.parseInt(value ?? "", 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return fallback;
  }
  return Math.min(parsed, 100);
};

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/feeds", (_req, res) => {
  res.json({
    newsFeeds: defaultNewsFeeds,
    instagramTags: defaultInstagramTags,
  });
});

app.get("/api/news", async (req, res) => {
  try {
    const feeds = req.query.feeds
      ? String(req.query.feeds)
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      : defaultNewsFeeds;
    const limit = parseLimit(req.query.limit, 30);
    const items = await fetchNews({ feeds, limit });
    res.json({ items });
  } catch (error) {
    res.status(500).json({
      message: "Не удалось загрузить новости.",
      error: error.message,
    });
  }
});

app.get("/api/instagram", async (req, res) => {
  try {
    const tag = req.query.tag ? String(req.query.tag) : defaultInstagramTags[0];
    const limit = parseLimit(req.query.limit, 20);
    const items = await fetchInstagramByTag(tag, { limit });
    res.json({ items });
  } catch (error) {
    res.status(500).json({
      message: "Не удалось загрузить посты из Instagram.",
      error: error.message,
    });
  }
});

app.get("/api/combined", async (req, res) => {
  try {
    const limit = parseLimit(req.query.limit, 40);
    const items = await fetchCombined({ limit });
    res.json({ items });
  } catch (error) {
    res.status(500).json({
      message: "Не удалось загрузить ленту.",
      error: error.message,
    });
  }
});

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => {
  console.log(`API server running on http://localhost:${port}`);
});
