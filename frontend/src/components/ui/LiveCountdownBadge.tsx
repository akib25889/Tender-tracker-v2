import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface LiveCountdownBadgeProps {
  deadlineStr?: string;
}

export const LiveCountdownBadge: React.FC<LiveCountdownBadgeProps> = ({ deadlineStr }) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  
  useEffect(() => {
    if (!deadlineStr) return;
    
    // Check if valid date
    const d = new Date(deadlineStr);
    if (isNaN(d.getTime())) return;
    
    const updateCountdown = () => {
      const now = new Date().getTime();
      const target = d.getTime();
      const diff = target - now;
      
      if (diff <= 0) {
        setTimeLeft('Time Expired');
        return;
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      let formatted = '';
      if (days > 0) formatted += `${days}d `;
      formatted += `${hours.toString().padStart(2, '0')}h `;
      formatted += `${minutes.toString().padStart(2, '0')}m `;
      formatted += `${seconds.toString().padStart(2, '0')}s`;
      
      setTimeLeft(formatted);
    };
    
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [deadlineStr]);

  if (!timeLeft) return null;

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium whitespace-nowrap shrink-0 bg-[#0F172A] text-[#38BDF8] border border-[#1E293B] shadow-2xs">
      <Clock className="w-3 h-3 text-[#38BDF8]" />
      <span>{timeLeft}</span>
      <span className="text-[9px] text-[#94A3B8] ml-0.5 uppercase tracking-wider font-sans">BD Time</span>
    </span>
  );
};

