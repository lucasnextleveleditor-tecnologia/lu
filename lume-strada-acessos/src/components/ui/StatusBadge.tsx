import { STATUS_META, type StatusAcesso } from "@/lib/utils/status";
import { Badge } from "@/components/ui/Badge";

export function StatusBadge({ status, className }: { status: StatusAcesso; className?: string }) {
  const meta = STATUS_META[status];
  return <Badge tone={meta.tone} label={meta.label} className={className} />;
}
