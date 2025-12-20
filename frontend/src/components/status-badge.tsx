import { clsx } from "clsx";
import { Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";

type Status = "pending" | "processing" | "completed" | "failed";

const statusLabels: Record<Status, string> = {
  pending: "Ожидание",
  processing: "Обработка",
  completed: "Готово",
  failed: "Ошибка",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <div className={clsx(
      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border uppercase tracking-wider",
      {
        "bg-yellow-50 text-yellow-700 border-yellow-200": status === "pending",
        "bg-blue-50 text-blue-700 border-blue-200": status === "processing",
        "bg-green-50 text-green-700 border-green-200": status === "completed",
        "bg-red-50 text-red-700 border-red-200": status === "failed",
      }
    )}>
      {status === "pending" && <Clock className="w-3 h-3" />}
      {status === "processing" && <Loader2 className="w-3 h-3 animate-spin" />}
      {status === "completed" && <CheckCircle2 className="w-3 h-3" />}
      {status === "failed" && <XCircle className="w-3 h-3" />}
      {statusLabels[status]}
    </div>
  );
}
