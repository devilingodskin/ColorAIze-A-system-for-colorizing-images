import { clsx } from "clsx";
import { Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";

type Status = "pending" | "processing" | "completed" | "failed";

export function StatusBadge({ status }: { status: Status }) {
  return (
    <div className={clsx(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border uppercase tracking-wider",
      {
        "bg-yellow-500/10 text-yellow-500 border-yellow-500/20": status === "pending",
        "bg-blue-500/10 text-blue-500 border-blue-500/20": status === "processing",
        "bg-green-500/10 text-green-500 border-green-500/20": status === "completed",
        "bg-red-500/10 text-red-500 border-red-500/20": status === "failed",
      }
    )}>
      {status === "pending" && <Clock className="w-3 h-3" />}
      {status === "processing" && <Loader2 className="w-3 h-3 animate-spin" />}
      {status === "completed" && <CheckCircle2 className="w-3 h-3" />}
      {status === "failed" && <XCircle className="w-3 h-3" />}
      {status}
    </div>
  );
}
