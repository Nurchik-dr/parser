import Parser from "rss-parser";
import axios from "axios";

const rssParser = new Parser({
  customFields: {
    item: [
      ["media:content", "mediaContent"],
      ["media:thumbnail", "mediaThumbnail"],
      ["dc:creator", "creator"],
    ],
  },
});

export const defaultNewsFeeds = [
  "https://www.theverge.com/rss/index.xml",
  "https://www.bbc.com/news/rss.xml",
  "https://www.aljazeera.com/xml/rss/all.xml",
];

export const defaultInstagramTags = ["news", "technology", "startup"];

const normalizeItem = ({
  item,
  source,
  category,
  overrideTitle,
  overrideLink,
  overrideImage,
}) => {
  const title = overrideTitle ?? item.title ?? "";
  const link = overrideLink ?? item.link ?? "";
  const pubDate = item.isoDate ?? item.pubDate ?? "";
  const summary = item.contentSnippet ?? item.summary ?? item.content ?? "";
  const image =
    overrideImage ??
    item.enclosure?.url ??
    item.mediaContent?.url ??
    item.mediaThumbnail?.url ??
    "";

  return {
    title,
    link,
    pubDate,
    summary,
    image,
    source,
    category,
  };
};

const fetchFeed = async (url) => {
  const response = await axios.get(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (parser aggregator)",
      Accept: "application/rss+xml, application/xml;q=0.9, */*;q=0.8",
    },
    timeout: 15000,
  });

  return rssParser.parseString(response.data);
};

export const fetchNews = async ({ feeds = defaultNewsFeeds, limit = 30 } = {}) => {
  const feedResults = await Promise.all(
    feeds.map(async (feedUrl) => ({ url: feedUrl, feed: await fetchFeed(feedUrl) }))
  );

  const items = feedResults.flatMap(({ url, feed }) =>
    (feed.items ?? []).map((item) =>
      normalizeItem({
        item,
        source: feed.title ?? url,
        category: "news",
      })
    )
  );

  return items
    .filter((item) => item.title && item.link)
    .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
    .slice(0, limit);
};

export const fetchInstagramByTag = async (tag, { rssHubBase, limit = 20 } = {}) => {
  if (!tag) {
    return [];
  }

  const base = rssHubBase ?? "https://rsshub.app";
  const rssUrl = `${base}/instagram/tag/${encodeURIComponent(tag)}`;
  const feed = await fetchFeed(rssUrl);

  const items = (feed.items ?? []).map((item) =>
    normalizeItem({
      item,
      source: feed.title ?? `#${tag}`,
      category: "instagram",
    })
  );

  return items
    .filter((item) => item.title && item.link)
    .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
    .slice(0, limit);
};

export const fetchInstagramForTags = async ({ tags = defaultInstagramTags, limit = 20 } = {}) => {
  const perTagLimit = Math.max(Math.round(limit / tags.length), 1);
  const results = await Promise.all(
    tags.map((tag) => fetchInstagramByTag(tag, { limit: perTagLimit }))
  );

  return results.flat().slice(0, limit);
};

export const fetchCombined = async ({
  feeds = defaultNewsFeeds,
  tags = defaultInstagramTags,
  limit = 40,
} = {}) => {
  const [newsItems, instagramItems] = await Promise.all([
    fetchNews({ feeds, limit }),
    fetchInstagramForTags({ tags, limit }),
  ]);

  return [...newsItems, ...instagramItems]
    .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
    .slice(0, limit);
};
