import { Skeleton } from "@/shared/shadcn-ui/skeleton"

export default function Loading() {
  return (
    <div className="space-y-4 pt-4">
      <Skeleton className="h-24 w-full" />
      <div className="columns-1 gap-4 space-y-4 md:columns-2 lg:columns-3">
        <Skeleton className="h-48 w-full break-inside-avoid" />
        <Skeleton className="h-32 w-full break-inside-avoid" />
        <Skeleton className="h-56 w-full break-inside-avoid" />
        <Skeleton className="h-40 w-full break-inside-avoid" />
      </div>
    </div>
  )
}
