"use client";

import { useState } from "react";
import { KnowledgeEntry } from "@/types/knowledge";

export default function KnowledgeForm() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [tags, setTags] = useState("");
  const [author, setAuthor] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const res = await fetch("/api/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          answer,
          tags: tags.split(",").map(t => t.trim()).filter(Boolean),
          author,
        }),
      });
      if (!res.ok) throw new Error("Failed to submit");
      setSuccess(true);
      setQuestion("");
      setAnswer("");
      setTags("");
      setAuthor("");
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto p-4 border rounded bg-white">
      <h2 className="text-lg font-bold">Contribute College Knowledge</h2>
      <div>
        <label className="block font-medium">Question</label>
        <input
          className="w-full border rounded px-2 py-1"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block font-medium">Answer</label>
        <textarea
          className="w-full border rounded px-2 py-1"
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block font-medium">Tags (comma separated)</label>
        <input
          className="w-full border rounded px-2 py-1"
          value={tags}
          onChange={e => setTags(e.target.value)}
        />
      </div>
      <div>
        <label className="block font-medium">Your Name (optional)</label>
        <input
          className="w-full border rounded px-2 py-1"
          value={author}
          onChange={e => setAuthor(e.target.value)}
        />
      </div>
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Submitting..." : "Submit"}
      </button>
      {success && <div className="text-green-600">Thank you for your contribution!</div>}
      {error && <div className="text-red-600">{error}</div>}
    </form>
  );
}
