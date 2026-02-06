import { useEffect, useMemo, useState } from "react";
import { API_BASE, FeedItem, fetchJson } from "./api";

type Tab = "combined" | "news" | "instagram";

type FeedResponse = {
  items: FeedItem[];
};

type FeedListProps = {
  items: FeedItem[];
};

const FeedList = ({ items }: FeedListProps) => {
  if (!items.length) {
    return <p className="empty">Пока нет данных. Попробуйте позже.</p>;
  }

  return (
    <div className="grid">
      {items.map((item) => (
        <article key={`${item.link}-${item.pubDate}`} className="card">
          <div className="card-header">
            <span className={`badge badge-${item.category}`}>{item.category}</span>
            <span className="source">{item.source}</span>
          </div>
          <h3>{item.title}</h3>
          {item.image ? <img src={item.image} alt={item.title} /> : null}
          <p className="summary">{item.summary}</p>
          <div className="card-footer">
            <time>{item.pubDate ? new Date(item.pubDate).toLocaleString("ru-RU") : ""}</time>
            <a href={item.link} target="_blank" rel="noreferrer">
              Открыть
            </a>
          </div>
        </article>
      ))}
    </div>
  );
};

const App = () => {
  const [tab, setTab] = useState<Tab>("combined");
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const endpoint = useMemo(() => {
    if (tab === "news") {
      return "/api/news?limit=30";
    }
    if (tab === "instagram") {
      return "/api/instagram?limit=30";
    }
    return "/api/combined?limit=40";
  }, [tab]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    fetchJson<FeedResponse>(endpoint)
      .then((data) => {
        if (isMounted) {
          setItems(data.items);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [endpoint]);

  return (
    <div className="app">
      <header>
        <div>
          <h1>Инста + Новости</h1>
          <p>Единая лента новостей из сайтов и Instagram Reels по ключевым словам.</p>
        </div>
        <div className="meta">
          <span>API: {API_BASE}</span>
        </div>
      </header>

      <nav className="tabs">
        <button className={tab === "combined" ? "active" : ""} onClick={() => setTab("combined")}>
          Вся лента
        </button>
        <button className={tab === "news" ? "active" : ""} onClick={() => setTab("news")}>
          Новости сайтов
        </button>
        <button
          className={tab === "instagram" ? "active" : ""}
          onClick={() => setTab("instagram")}
        >
          Instagram
        </button>
      </nav>

      <section className="status">
        {loading ? <span>Загружаю...</span> : null}
        {error ? <span className="error">Ошибка: {error}</span> : null}
      </section>

      <FeedList items={items} />
    </div>
  );
};

export default App;
