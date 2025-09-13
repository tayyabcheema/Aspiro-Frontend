import * as React from "react"
import { cn } from "@/lib/utils"
import { CheckCircle, Circle, Clock } from "lucide-react"

interface TimelineItem {
  id: string
  title: string
  description?: string
  status: "completed" | "current" | "upcoming"
  date?: string
}

interface TimelineProps {
  items: TimelineItem[]
  className?: string
}

const Timeline = React.forwardRef<HTMLDivElement, TimelineProps>(({ items, className }, ref) => {
  return (
    <div ref={ref} className={cn("relative", className)}>
      {/* Timeline line */}
      <div className="absolute left-6 top-0 h-full w-0.5 bg-gradient-to-b from-primary via-primary/50 to-transparent" />

      <div className="space-y-8">
        {items.map((item, index) => (
          <div key={item.id} className="relative flex items-start gap-6">
            {/* Timeline dot */}
            <div className="relative z-10 flex h-12 w-12 items-center justify-center">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-smooth",
                  item.status === "completed" && "border-primary bg-primary text-primary-foreground",
                  item.status === "current" && "border-primary bg-background text-primary animate-pulse",
                  item.status === "upcoming" && "border-muted-foreground bg-background text-muted-foreground",
                )}
              >
                {item.status === "completed" && <CheckCircle className="h-4 w-4" />}
                {item.status === "current" && <Clock className="h-4 w-4" />}
                {item.status === "upcoming" && <Circle className="h-4 w-4" />}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pb-8">
              <div
                className={cn(
                  "glass-card rounded-lg p-6 transition-smooth hover:bg-white/10",
                  item.status === "current" && "ring-2 ring-primary/50",
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3
                    className={cn(
                      "font-semibold text-balance",
                      item.status === "completed" && "text-foreground",
                      item.status === "current" && "text-primary",
                      item.status === "upcoming" && "text-muted-foreground",
                    )}
                  >
                    {item.title}
                  </h3>
                  {item.date && <span className="text-xs text-muted-foreground">{item.date}</span>}
                </div>
                {item.description && <p className="text-sm text-muted-foreground text-pretty">{item.description}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
})
Timeline.displayName = "Timeline"

export { Timeline, type TimelineItem }
