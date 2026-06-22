import { Check, Circle, MapPin } from "lucide-react";
import type { OrderTrackingEvent } from "@/types";

export function OrderTrackingTimeline({ events }: { events: OrderTrackingEvent[] }) {
  return (
    <ol aria-label="Order tracking timeline" className="max-w-3xl">
      {events.map((event, index) => (
        <li className="relative flex gap-4 pb-6 last:pb-0" key={event.id}>
          {index < events.length - 1 && <span aria-hidden className="absolute left-[17px] top-9 h-[calc(100%-1rem)] w-0.5 bg-primary" />}
          <span className={`relative z-10 grid size-9 shrink-0 place-items-center rounded-full border-2 ${event.current ? "border-primary bg-primary text-white ring-4 ring-primary/15" : "border-primary bg-primary text-white"}`}>
            {event.complete ? <Check className="size-4" /> : <Circle className="size-3" />}
          </span>
          <div className="min-w-0 flex-1 pt-0.5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <p className={event.current ? "font-black text-primary" : "font-bold"}>{event.title}</p>
              <time className="text-xs text-muted-foreground">{event.timestamp}</time>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{event.description}</p>
            {event.location && <p className="mt-2 flex items-center gap-1 text-xs font-semibold"><MapPin className="size-3.5 text-primary" /> {event.location}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
