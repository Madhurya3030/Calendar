import React from 'react';
import { format, isSameMonth, isSameDay, startOfDay } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

export interface CalendarEvent {
  id: string;
  text: string;
  color: string; // Tailwind color class e.g., 'bg-pink-400'
}

export interface DayCellProps {
  day: Date;
  monthStart: Date;
  selectedStart: Date | null;
  selectedEnd: Date | null;
  hoverDate: Date | null;
  events: CalendarEvent[];
  onDayClick: (day: Date) => void;
  onDayMouseEnter: (day: Date) => void;
  holiday?: { name: string; type: string } | null;
}

export function DayCell({ day, monthStart, selectedStart, selectedEnd, hoverDate, events, onDayClick, onDayMouseEnter, holiday }: DayCellProps) {
  const [isHovering, setIsHovering] = React.useState(false);

  const dayNorm = startOfDay(day);
  const monthStartNorm = startOfDay(monthStart);
  const startNorm = selectedStart ? startOfDay(selectedStart) : null;
  const endNorm = selectedEnd ? startOfDay(selectedEnd) : null;
  const hoverNorm = hoverDate ? startOfDay(hoverDate) : null;

  const isCurrentMonth = isSameMonth(dayNorm, monthStartNorm);
  const isToday = isSameDay(dayNorm, startOfDay(new Date()));

  const isStart = startNorm && isSameDay(dayNorm, startNorm);
  const isEnd = endNorm && isSameDay(dayNorm, endNorm);

  let inRange = false;
  if (startNorm && endNorm) {
    if (startNorm < endNorm) {
      inRange = dayNorm > startNorm && dayNorm < endNorm;
    } else {
      inRange = dayNorm > endNorm && dayNorm < startNorm;
    }
  } else if (startNorm && hoverNorm && !endNorm) {
    const min = startNorm < hoverNorm ? startNorm : hoverNorm;
    const max = startNorm > hoverNorm ? startNorm : hoverNorm;
    inRange = dayNorm > min && dayNorm < max;
  }

  const dayOfWeek = dayNorm.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  let wrapperClass = "relative flex flex-col items-center justify-center h-8 md:h-10 w-full cursor-pointer transition-all duration-300 select-none z-0";
  let textClass = isCurrentMonth ? "text-slate-800" : "text-slate-300";
  let bgClass = "bg-transparent";
  let roundClass = "rounded-md";

  if (isWeekend && isCurrentMonth && !inRange && !isStart && !isEnd) {
    textClass = "text-[#2299D6] font-medium";
  }

  if (inRange) {
    bgClass = "bg-[#E6F4FA]";
    roundClass = "";
    textClass = "text-[#2299D6]";
  }

  if (isStart || isEnd) {
    bgClass = "bg-[#2299D6] z-20";
    textClass = "text-white font-bold";

    if (isStart && isEnd) {
      roundClass = "rounded-md z-20";
    } else if (isStart) {
      const compareDate = endNorm || hoverNorm;
      if (compareDate && compareDate > startNorm) {
        roundClass = "rounded-l-md rounded-r-none z-20";
      } else if (compareDate && compareDate < startNorm) {
        roundClass = "rounded-r-md rounded-l-none z-20";
      } else {
        roundClass = "rounded-md z-20";
      }
    } else if (isEnd) {
      if (startNorm && startNorm < endNorm) {
        roundClass = "rounded-r-md rounded-l-none z-20";
      } else {
        roundClass = "rounded-l-md rounded-r-none z-20";
      }
    }
  }

  const todayClass = (isToday && !isStart && !isEnd && !inRange) ? "ring-1 ring-inset ring-[#2299D6] font-bold bg-white text-[#2299D6]" : "";
  const hoverClass = (!inRange && !isStart && !isEnd) ? "hover:bg-slate-100" : "";

  const finalClassName = `${wrapperClass} ${bgClass} ${roundClass} ${todayClass} ${hoverClass}`.trim();

  return (
    <motion.div
      whileHover={{ scale: (isStart || isEnd) ? 1 : 1.1, zIndex: 40 }}

      animate={
        holiday?.type === "important"
          ? { boxShadow: ["0 0 0px rgba(34,153,214,0)", "0 0 12px rgba(34,153,214,0.6)", "0 0 0px rgba(34,153,214,0)"] }
          : {}
      }

      transition={{
        duration: 2,
        repeat: Infinity
      }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onDayClick(dayNorm)}
      onMouseEnter={() => { onDayMouseEnter(dayNorm); setIsHovering(true); }}
      onMouseLeave={() => setIsHovering(false)}
      className={finalClassName}
    >
      <span className={`text-xs md:text-sm ${textClass}`}>
        {format(dayNorm, 'd')}
      </span>

      {/* Holiday Marker */}
      {holiday && (
        <div className="absolute top-1 right-1">
          <span
            className={`w-1.5 h-1.5 rounded-full block ${holiday.type === "important"
              ? "bg-red-500"
              : "bg-yellow-400"
              }`}
          />
        </div>
      )}

      {/* Multievent Dot Indicators */}
      {events && events.length > 0 && (
        <div className="absolute bottom-1 w-full flex justify-center items-center gap-0.5 md:gap-1 px-1">
          {events.slice(0, 3).map((ev, i) => (
            <span key={i} className={`w-1 h-1 md:w-1.5 md:h-1.5 rounded-full ${ev.color}`} />
          ))}
          {events.length > 3 && <span className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-slate-300"></span>}
        </div>
      )}

      {/* Hover Tooltip Popup for Events */}
      {/* Hover Tooltip Popup for Events + Holidays */}
      <AnimatePresence>
        {isHovering && (events.length > 0 || holiday) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
            className="absolute bottom-full mb-2 w-40 p-2 md:p-3 bg-white rounded-xl border border-slate-200 shadow-lg z-50 pointer-events-none flex flex-col gap-1.5 left-1/2 -translate-x-1/2"
          >

            {holiday?.name.includes("Diwali") && (
              <motion.div
                className="absolute inset-0 rounded-md pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <div className="w-full h-full bg-[radial-gradient(circle,rgba(255,215,0,0.8)_0%,transparent_70%)]" />
              </motion.div>
            )}

            {holiday?.name.includes("Independence Day") && (
              <motion.div
                className="absolute top-1 left-1 text-xs"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                🇮🇳
              </motion.div>
            )}

            {/* ✅ Holiday FIRST */}
            {holiday && (
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${holiday.type === "important"
                    ? "bg-red-500"
                    : "bg-yellow-400"
                    }`}
                ></span>
                <p className="text-[10px] md:text-xs text-slate-800 font-semibold">
                  {holiday.name}
                </p>
              </div>
            )}

            {/* Existing Events */}
            {events.map((ev, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${ev.color}`}></span>
                <p className="text-[10px] md:text-xs text-slate-700 truncate font-medium">
                  {ev.text}
                </p>
              </div>
            ))}

            {/* Tooltip caret */}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-slate-200 rotate-45 transform origin-center"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
