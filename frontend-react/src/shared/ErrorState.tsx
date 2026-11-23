import { CircleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ErrorState({
  title = "Something went wrong",
  hint,
  onRetry,
}: {
  title?: string;
  hint: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center" role="alert">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose text-danger">
        <CircleAlert className="h-5 w-5" strokeWidth={1.75} />
      </div>
      <h3 className="text-[17px] font-semibold">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">{hint}</p>
      {onRetry && (
        <Button className="mt-5" variant="outline" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
