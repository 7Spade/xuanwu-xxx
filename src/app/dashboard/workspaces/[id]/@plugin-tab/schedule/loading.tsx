import { Skeleton } from "@/shared/shadcn-ui/skeleton"

export default function Loading() {
  return (
    <div className="space-y-4 pt-4">
      <Skeleton className="h-7 w-2/5" />
      <div className="flex gap-4">
        <Skeleton className="h-96 flex-1" />
        <Skeleton className="h-96 w-64" />
      </div>
    </div>
  )
}
