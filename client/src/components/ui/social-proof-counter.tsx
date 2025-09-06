import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface SocialProofCounterProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  targetValue: string;
  delay?: number;
  className?: string;
}

export function SocialProofCounter({ 
  icon: Icon, 
  label, 
  targetValue, 
  delay = 0,
  className = ""
}: SocialProofCounterProps) {
  const [displayValue, setDisplayValue] = useState("0");
  const [isVisible, setIsVisible] = useState(false);

  // Extract number from targetValue (e.g., "847,293" -> 847293)
  const numericValue = parseInt(targetValue.replace(/[^0-9]/g, ''));
  const suffix = targetValue.match(/[KMB]$/)?.[0] || '';
  
  useEffect(() => {
    if (isVisible) {
      let current = 0;
      const increment = numericValue / 50; // Animate over 50 steps
      const timer = setInterval(() => {
        current += increment;
        if (current >= numericValue) {
          current = numericValue;
          clearInterval(timer);
        }
        
        // Format the number with commas and suffix
        const formattedNumber = Math.floor(current).toLocaleString();
        setDisplayValue(formattedNumber + suffix);
      }, 30); // Update every 30ms for smooth animation

      return () => clearInterval(timer);
    }
  }, [isVisible, numericValue, suffix]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ 
        opacity: 1, 
        scale: 1,
        transition: { 
          duration: 0.5, 
          delay,
          onComplete: () => setIsVisible(true)
        }
      }}
      viewport={{ once: true }}
      className={`text-center group cursor-pointer ${className}`}
    >
      <div className="bg-card border border-border rounded-lg p-4 hover:border-primary transition-colors duration-300 stat-card">
        <Icon className="h-6 w-6 text-primary mx-auto mb-2" />
        <div className="text-xl font-black text-gradient mb-1 font-mono">
          {displayValue}
        </div>
        <div className="text-xs text-muted-foreground font-medium tracking-wider uppercase">
          {label}
        </div>
      </div>
    </motion.div>
  );
}