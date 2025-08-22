import KnowledgeForm from "@/components/KnowledgeForm";
import Link from "next/link";

export default function ContributePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="w-full max-w-lg p-6 bg-gray-800 rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-center text-white flex-1">Contribute</h1>
    <Link
    href="/"
    className="ml-4 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition"
    >
    Chat
    </Link>
      </div>
        <KnowledgeForm />
      </div>
    </div>
  );
}
