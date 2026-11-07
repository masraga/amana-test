import type { ReportStatus } from '../../types/report';
import { statusColorMap, statusLabel } from '../../utils/statusColor';

interface BadgeProps {
  status: ReportStatus;
}

export default function Badge({ status }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColorMap[status]}`}>
      {statusLabel[status]}
    </span>
  );
}
