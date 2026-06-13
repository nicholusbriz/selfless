export default function StudentListItemSkeleton() {
  return (
    <div className="p-4 flex items-center justify-between border-b border-white/10">
      <div className="flex items-center gap-3">
        <div className="animate-shimmer bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] rounded-full h-10 w-10"></div>
        <div className="space-y-2">
          <div className="animate-shimmer bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] rounded h-4 w-32"></div>
          <div className="animate-shimmer bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] rounded h-3 w-24"></div>
        </div>
      </div>
      <div className="text-right space-y-2">
        <div className="animate-shimmer bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] rounded h-4 w-16 ml-auto"></div>
        <div className="animate-shimmer bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] rounded h-3 w-20 ml-auto"></div>
      </div>
    </div>
  );
}
