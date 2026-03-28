import { useEffect, useState } from "react";
import { BID_DEADLINE, getTimeRemaining } from "../utils/formatters";

export default function CountdownTimer({
  compact = false,
}: { compact?: boolean }) {
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining(BID_DEADLINE));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeRemaining(BID_DEADLINE));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (timeLeft.expired) {
    return <span className="text-red-600 font-semibold">Deadline Passed</span>;
  }

  if (compact) {
    return (
      <span className="font-mono font-bold text-navy-900">
        {timeLeft.days}d {String(timeLeft.hours).padStart(2, "0")}h{" "}
        {String(timeLeft.minutes).padStart(2, "0")}m{" "}
        {String(timeLeft.seconds).padStart(2, "0")}s
      </span>
    );
  }

  const blocks = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Mins", value: timeLeft.minutes },
    { label: "Secs", value: timeLeft.seconds },
  ];

  return (
    <div className="flex items-center gap-2">
      {blocks.map((b) => (
        <div key={b.label} className="flex flex-col items-center">
          <div className="bg-navy-900 text-white font-mono font-bold text-xl sm:text-2xl w-14 h-14 flex items-center justify-center rounded-lg">
            {String(b.value).padStart(2, "0")}
          </div>
          <span className="text-xs text-muted-foreground mt-1">{b.label}</span>
        </div>
      ))}
    </div>
  );
}
