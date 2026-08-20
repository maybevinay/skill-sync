import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import { aiApi } from "@/services/ai.service";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/shared/PageHeader";
import { EmptyState } from "@/shared/EmptyState";

export function RagAssistantPage() {
  const qc = useQueryClient();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const docs = useQuery({ queryKey: ["rag-docs"], queryFn: aiApi.documents });
  const upload = useMutation({
    mutationFn: (file: File) => aiApi.upload(file),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rag-docs"] }),
  });
  const ask = useMutation({
    mutationFn: () => aiApi.ragAsk(question),
    onSuccess: (data) => setAnswer(String(data.content ?? "")),
  });

  return (
    <div className="space-y-4">
      <PageHeader title="RAG Assistant" subtitle="PDF/text chunking, PostgreSQL embeddings, cosine retrieval" />
      <Card className="space-y-3">
        <label className="ss-label" htmlFor="rag-file">
          Upload document
        </label>
        <input
          id="rag-file"
          className="ss-field file:mr-3 file:rounded file:border-0 file:bg-primary/15 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-foreground"
          type="file"
          accept=".pdf,.txt,.md"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) upload.mutate(file);
          }}
        />
      </Card>
      {!docs.data?.length ? (
        <EmptyState title="No documents" hint="Upload a PDF or notes file to ground answers." />
      ) : (
        <ul className="space-y-1 text-sm text-muted">
          {docs.data.map((d: { id: number; filename: string }) => (
            <li key={d.id} className="rounded-ss border border-line px-3 py-2">
              {d.filename}
            </li>
          ))}
        </ul>
      )}
      <textarea
        className="ss-field min-h-24"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask about your documents"
      />
      <Button onClick={() => ask.mutate()} disabled={ask.isPending}>
        {ask.isPending ? "Asking…" : "Ask"}
      </Button>
      {answer && (
        <Card className="overflow-x-auto text-sm">
          <ReactMarkdown>{answer}</ReactMarkdown>
        </Card>
      )}
    </div>
  );
}
