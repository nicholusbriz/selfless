export default function TabSkeleton() {
  return (
    <div className="flex gap-2 mb-6 flex-shrink-0 overflow-x-auto pb-2">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="animate-shimmer bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] rounded-lg h-10 w-24"
        ></div>
      ))}
    </div>
  );
}
