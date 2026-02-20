export default function Loading() {
  return (
    <div className="animate-pulse space-y-4 pt-4">
      <div className="h-7 bg-muted/40 rounded-xl w-2/5" />
      <div className="h-56 bg-muted/40 rounded-2xl" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="h-24 bg-muted/40 rounded-2xl" />
        <div className="h-24 bg-muted/40 rounded-2xl" />
        <div className="h-24 bg-muted/40 rounded-2xl" />
      </div>
    </div>
  )
}
