"use client";
import { useEffect, useState } from "react";
import { timeAgo } from "@/lib/format";

interface Article {
  headline: string;
  source: string;
  url: string;
  image: string | null;
  datetime: number;
  summary: string;
}

function ArticleModal({ article, onClose }: { article: Article; onClose: () => void }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl bg-white shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {article.image && (
          <img
            src={article.image}
            alt=""
            className="w-full h-48 object-cover"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
        )}
        <div className="p-6 space-y-3">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
            {article.source} · {timeAgo(article.datetime)}
          </p>
          <h2 className="text-lg font-semibold text-gray-900 leading-snug">
            {article.headline}
          </h2>
          {article.summary && (
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-6">
              {article.summary}
            </p>
          )}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={onClose}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              Close
            </button>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
            >
              Read full article
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 rounded-full bg-black/20 p-1 text-white hover:bg-black/30 transition-colors"
          aria-label="Close"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function NewsFeed({ symbol }: { symbol: string }) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Article | null>(null);

  useEffect(() => {
    if (!symbol) return;
    setLoading(true);
    setError("");
    setArticles([]);
    fetch(`/api/news?symbol=${encodeURIComponent(symbol)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setArticles(data.articles ?? []);
      })
      .catch(() => setError("Could not load news."))
      .finally(() => setLoading(false));
  }, [symbol]);

  return (
    <>
      {selected && <ArticleModal article={selected} onClose={() => setSelected(null)} />}

      <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100 space-y-3">
        <h2 className="font-semibold text-gray-900">
          Latest News
          <span className="ml-2 text-sm font-normal text-gray-400">· {symbol}</span>
        </h2>

        {loading && (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="h-10 w-10 rounded-lg bg-gray-100 shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-3 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        {!loading && !error && articles.length === 0 && (
          <p className="text-sm text-gray-400">No recent news found.</p>
        )}

        {!loading && articles.length > 0 && (
          <ul className="divide-y divide-gray-50">
            {articles.map((a, i) => (
              <li key={i} className="py-3 first:pt-0 last:pb-0">
                <button
                  onClick={() => setSelected(a)}
                  className="flex gap-3 group w-full text-left"
                >
                  {a.image && (
                    <img
                      src={a.image}
                      alt=""
                      className="h-12 w-12 rounded-lg object-cover shrink-0 bg-gray-100"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                    />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
                      {a.headline}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      {a.source} · {timeAgo(a.datetime)}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
