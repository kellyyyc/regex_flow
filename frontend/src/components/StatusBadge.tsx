import type { JobStatusValue } from "../types/jobs";

type StatusBadgeProps = {
  status: JobStatusValue;
};

function getStatusClassName(status: JobStatusValue) {
  switch (status) {
    case "SUCCESS":
      return "bg-green-100 text-green-700";

    case "FAILED":
      return "bg-red-100 text-red-700";

    case "CANCELLED":
      return "bg-slate-200 text-slate-700";

    default:
      return "bg-orange-100 text-yellow-700";
  }
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-sm font-semibold ${getStatusClassName(status)}`}
    >
      {status}
    </span>
  );
}
