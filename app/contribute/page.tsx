import KnowledgeForm from "@/components/KnowledgeForm";

export default function ContributePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-lg p-6 bg-white dark:bg-gray-800 rounded shadow">
        <h1 className="text-2xl font-bold mb-4 text-center">Contribute College Knowledge</h1>
        <KnowledgeForm />
      </div>
    </div>
  );
}
