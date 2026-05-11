export default function PricingSkeleton({ cardCount = 3 }: { cardCount?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: cardCount }).map((_, index) => (
        <div key={index} className="glass-card p-6 md:p-7" aria-hidden="true">
          <div className="flex h-full flex-col gap-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <div className="glass-skeleton h-4 w-20 rounded-full" />
                <div className="glass-skeleton h-7 w-3/5 rounded-lg" />
                <div className="space-y-2">
                  <div className="glass-skeleton h-3 w-full rounded-full" />
                  <div className="glass-skeleton h-3 w-11/12 rounded-full" />
                  <div className="glass-skeleton h-3 w-4/5 rounded-full" />
                </div>
              </div>
              <div className="glass-skeleton h-8 w-20 rounded-full" />
            </div>

            <div className="mt-3 flex items-end gap-3">
              <div className="glass-skeleton h-12 w-28 rounded-xl" />
              <div className="glass-skeleton h-4 w-24 rounded-full" />
            </div>

            <div className="flex min-h-[28px] gap-2">
              <div className="glass-skeleton h-6 w-20 rounded-full" />
            </div>

            <div className="mt-auto">
              <div className="glass-skeleton h-12 w-full rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}