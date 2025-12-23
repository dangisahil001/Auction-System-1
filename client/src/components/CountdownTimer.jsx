import { useEffect, useState } from 'react';

export default function CountdownTimer({ endTime, onEnd }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const difference = new Date(endTime) - new Date();
    
    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      expired: false,
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      
      if (newTimeLeft.expired) {
        clearInterval(timer);
        onEnd?.();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  if (timeLeft.expired) {
    return <span className="text-red-600 font-semibold">Auction Ended</span>;
  }

  const isUrgent = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes < 5;

  return (
    <div className={`flex space-x-2 ${isUrgent ? 'text-red-600' : 'text-gray-800'}`}>
      {timeLeft.days > 0 && (
        <div className="text-center">
          <span className="text-2xl font-bold">{timeLeft.days}</span>
          <span className="text-xs block">days</span>
        </div>
      )}
      <div className="text-center">
        <span className="text-2xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</span>
        <span className="text-xs block">hrs</span>
      </div>
      <span className="text-2xl font-bold">:</span>
      <div className="text-center">
        <span className="text-2xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</span>
        <span className="text-xs block">min</span>
      </div>
      <span className="text-2xl font-bold">:</span>
      <div className="text-center">
        <span className="text-2xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</span>
        <span className="text-xs block">sec</span>
      </div>
    </div>
  );
}
