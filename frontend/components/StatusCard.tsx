import type { LucideIcon } from "lucide-react";

const styles = {
  blue: "text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-300",
  green: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300",
  orange: "text-orange-500 bg-orange-50 dark:bg-orange-950/40 dark:text-orange-300",
  red: "text-red-600 bg-red-50 dark:bg-red-950/40 dark:text-red-300"
};

export function StatusCard({
  icon: Icon,
  label,
  value,
  tone
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  tone: keyof typeof styles;
}) {
  return (
    <article className="card flex min-h-28 items-center gap-4 p-4 sm:p-5">
      <div className={`grid h-16 w-16 shrink-0 place-items-center rounded-full ${styles[tone]}`}>
        <Icon className="h-8 w-8" strokeWidth={2} />
      </div>
      <div>
        <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</div>
        <div className={`mt-1 text-3xl font-extrabold tracking-tight ${styles[tone].split(" ")[0]}`}>{value}</div>
      </div>
    </article>
  );
}
