"use client";

import { useState } from "react";


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
  } catch (err: unknown) {
      if (
        err &&
        typeof err === "object" &&
        "message" in err &&
        typeof (err as { message?: string }).message === "string"
      ) {
        setError((err as { message: string }).message);
      } else {
        setError("Unknown error");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 max-w-md mx-auto p-4 border rounded bg-gray-900 border-gray-700 text-gray-100"
    >
      <h2 className="text-lg font-bold text-gray-100">Contribute College Knowledge</h2>
      <div>
        <label className="block font-medium text-gray-200">Question</label>
        <input
          className="w-full border border-gray-700 bg-gray-800 rounded px-2 py-1 text-gray-100 placeholder-gray-400"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block font-medium text-gray-200">Answer</label>
        <textarea
          className="w-full border border-gray-700 bg-gray-800 rounded px-2 py-1 text-gray-100 placeholder-gray-400"
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block font-medium text-gray-200">Tags (comma separated)</label>
        <input
          className="w-full border border-gray-700 bg-gray-800 rounded px-2 py-1 text-gray-100 placeholder-gray-400"
          value={tags}
          onChange={e => setTags(e.target.value)}
        />
      </div>
      <div>
        <label className="block font-medium text-gray-200">Your Name (optional)</label>
        <input
          className="w-full border border-gray-700 bg-gray-800 rounded px-2 py-1 text-gray-100 placeholder-gray-400"
          value={author}
          onChange={e => setAuthor(e.target.value)}
        />
      </div>
      <button
        type="submit"
        className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Submitting..." : "Submit"}
      </button>
      {success && <div className="text-green-400">Thank you for your contribution!</div>}
      {error && <div className="text-red-400">{error}</div>}
    </form>
  );
}
