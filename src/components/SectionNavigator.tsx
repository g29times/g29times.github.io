import { ArrowDown } from 'lucide-react';

interface SectionNavigatorProps {
  targetId: string;
  className?: string;
}

export function SectionNavigator({ targetId, className = '' }: SectionNavigatorProps) {
  const scrollToTarget = () => {
    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <button
      onClick={scrollToTarget}
      className={`absolute bottom-8 left-1/2 -translate-x-1/2 text-foreground/60 hover:text-primary transition-all duration-300 animate-bounce ${className}`}
      aria-label={`Scroll to ${targetId}`}
    >
      <ArrowDown className="w-6 h-6" />
    </button>
  );
}
