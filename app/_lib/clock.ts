export type Clock = {
  time: string;
  date: string;
  timeValue: string;
  hourAngle: number;
  minuteAngle: number;
  secondAngle: number;
};

// Stable first-render values keep the static export and hydration consistent.
export const initialClock: Clock = {
  time: "10:00",
  date: "",
  timeValue: "10:00:00",
  hourAngle: 300,
  minuteAngle: 0,
  secondAngle: 0,
};

export function readClock(now = new Date()): Clock {
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  const pad = (value: number) => String(value).padStart(2, "0");

  return {
    time: `${hours}:${pad(minutes)}`,
    date: new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    }).format(now),
    timeValue: `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`,
    hourAngle: (hours % 12) * 30 + minutes / 2 + seconds / 120,
    minuteAngle: minutes * 6 + seconds / 10,
    secondAngle: seconds * 6,
  };
}
