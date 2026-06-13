export default function CourseListItemSkeleton() {
  return (
    <div className="p-4 flex items-center justify-between border-b border-white/10">
      <div className="flex items-center gap-3">
        <div className="animate-shimmer bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] rounded h-5 w-40"></div>
        <div className="animate-shimmer bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] rounded h-3 w-20"></div>
      </div>
      <div className="animate-shimmer bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] rounded h-8 w-20"></div>
    </div>
  );
}
