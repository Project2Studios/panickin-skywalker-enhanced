import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'wouter';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartItemCount } from '@/hooks/use-cart';
import { cn } from '@/lib/utils';

interface CartIconProps {
  className?: string;
  variant?: 'default' | 'header' | 'mobile';
  showCount?: boolean;
  onClick?: () => void;
}

export function CartIcon({ 
  className, 
  variant = 'default', 
  showCount = true, 
  onClick 
}: CartIconProps) {
  const itemCount = useCartItemCount();
  
  const iconSizes = {
    default: 'h-5 w-5',
    header: 'h-5 w-5',
    mobile: 'h-6 w-6'
  };
  
  const buttonSizes = {
    default: 'default',
    header: 'sm',
    mobile: 'default'
  } as const;

  const content = (
    <Button
      variant={variant === 'header' ? 'ghost' : 'outline'}
      size={buttonSizes[variant]}
      className={cn(
        'relative flex items-center gap-2',
        variant === 'header' && 'text-foreground hover:text-primary',
        variant === 'mobile' && 'w-full justify-start',
        className
      )}
      onClick={onClick}
    >
      <ShoppingBag className={iconSizes[variant]} />
      
      {variant === 'mobile' && (
        <span className="ml-2">Cart</span>
      )}
      
      {/* Cart item count badge */}
      <AnimatePresence>
        {showCount && itemCount > 0 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="absolute -top-2 -right-2"
          >
            <Badge 
              variant="destructive" 
              className={cn(
                'h-5 w-5 p-0 flex items-center justify-center text-xs font-bold rounded-full',
                'bg-primary text-primary-foreground border-2 border-background',
                itemCount > 99 && 'px-1.5 w-auto min-w-[20px]'
              )}
            >
              {itemCount > 99 ? '99+' : itemCount}
            </Badge>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Pulse animation for new items */}
      <AnimatePresence>
        {itemCount > 0 && (
          <motion.div
            initial={{ scale: 1, opacity: 0 }}
            animate={{ scale: [1, 1.2, 1], opacity: [0, 0.3, 0] }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              repeatDelay: 3
            }}
            className="absolute inset-0 rounded-full bg-primary/20 pointer-events-none"
          />
        )}
      </AnimatePresence>
    </Button>
  );

  // If no onClick handler, wrap in Link
  if (!onClick) {
    return (
      <Link href="/cart">
        {content}
      </Link>
    );
  }

  return content;
}

// Cart counter component for use in other places
export function CartCounter({ className }: { className?: string }) {
  const itemCount = useCartItemCount();
  
  if (itemCount === 0) return null;
  
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={cn(
        'inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground',
        'text-xs font-semibold px-2 py-1 min-w-[20px]',
        className
      )}
    >
      {itemCount > 99 ? '99+' : itemCount}
    </motion.div>
  );
}
