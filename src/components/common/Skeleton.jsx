export function ProductSkeleton() {
  return (
    <div className="bg-white border border-slate-200/70 rounded-2xl p-4 flex flex-col space-y-3 animate-pulse">
      <div className="bg-slate-200 aspect-square rounded-xl w-full"></div>
      <div className="h-4 bg-slate-200 rounded w-1/3"></div>
      <div className="h-4 bg-slate-200 rounded w-5/6"></div>
      <div className="h-4 bg-slate-200 rounded w-1/2"></div>
      <div className="pt-2 flex justify-between items-center">
        <div className="h-6 bg-slate-200 rounded w-1/3"></div>
        <div className="h-8 w-8 bg-slate-200 rounded-lg"></div>
      </div>
    </div>
  )
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  )
}

