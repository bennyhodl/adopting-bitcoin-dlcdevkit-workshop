import React, { useEffect, useState } from 'react';

interface CountdownProps {
  targetTimestamp: number; // UNIX timestamp in the future
}

const Countdown: React.FC<CountdownProps> = ({ targetTimestamp }) => {
  const [timeLeft, setTimeLeft] = useState(targetTimestamp - Math.floor(Date.now() / 1000));

  useEffect(() => {
    const interval = setInterval(() => {
      const currentTime = Math.floor(Date.now() / 1000);
      const newTimeLeft = targetTimestamp - currentTime;
      setTimeLeft(newTimeLeft > 0 ? newTimeLeft : 0);
    }, 1000);

    return () => clearInterval(interval);
  }, [targetTimestamp]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <p className='text-3xl text-center pt-2 bold'>{formatTime(timeLeft)}</p>
  );
};

export default Countdown;
