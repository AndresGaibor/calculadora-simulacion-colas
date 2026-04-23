import { cn } from "@/lib/utils";

function Badge({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="badge"
      className={cn(
        "inline-flex items-center gap-1 rounded-sm px-2 py-1 text-[0.65rem] uppercase tracking-wider font-medium",
        className,
      )}
      {...props}
    />
  );
}

export { Badge };