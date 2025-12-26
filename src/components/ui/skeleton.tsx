import { cn } from "@/lib/utils";

function Skeleton({ className, variant = "default", ...props }: React.HTMLAttributes<HTMLDivElement> & { variant?: "default" | "wave" | "shimmer" }) {
  const variantClass = variant === "wave" ? "skeleton-wave" : variant === "shimmer" ? "skeleton-shimmer" : "animate-pulse";
  return <div className={cn("rounded-md bg-muted", variantClass, className)} {...props} />;
}

function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-lg border bg-card p-6 space-y-4", className)}>
      <Skeleton variant="shimmer" className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton variant="wave" className="h-6 w-3/4" />
        <Skeleton variant="wave" className="h-4 w-full" />
        <Skeleton variant="wave" className="h-4 w-5/6" />
      </div>
      <div className="flex gap-2">
        <Skeleton variant="shimmer" className="h-10 w-24" />
        <Skeleton variant="shimmer" className="h-10 w-24" />
      </div>
    </div>
  );
}

export { Skeleton, CardSkeleton };
