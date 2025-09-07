import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { PriceDisplay } from './price-display';
import { ProductVariant } from '@/hooks/use-products';
import { Check, AlertCircle, Package } from 'lucide-react';

interface VariantSelectorProps {
  variants: ProductVariant[];
  basePrice: number;
  salePrice?: number;
  selectedVariant?: ProductVariant;
  onVariantChange: (variant: ProductVariant | undefined) => void;
  className?: string;
}

export function VariantSelector({
  variants,
  basePrice,
  salePrice,
  selectedVariant,
  onVariantChange,
  className,
}: VariantSelectorProps) {
  const [hoveredVariant, setHoveredVariant] = useState<ProductVariant | null>(null);

  // Group variants by attribute type (size, color, etc.)
  const variantGroups = useMemo(() => {
    const groups: Record<string, Array<{ attribute: string; variants: ProductVariant[] }>> = {};

    variants.forEach((variant) => {
      Object.entries(variant.attributes).forEach(([attributeType, attributeValue]) => {
        if (!attributeValue) return;

        if (!groups[attributeType]) {
          groups[attributeType] = [];
        }

        const existingGroup = groups[attributeType].find(g => g.attribute === attributeValue);
        if (existingGroup) {
          existingGroup.variants.push(variant);
        } else {
          groups[attributeType].push({
            attribute: attributeValue,
            variants: [variant],
          });
        }
      });
    });

    return groups;
  }, [variants]);

  // Get current price based on selected variant
  const currentPrice = useMemo(() => {
    const variant = hoveredVariant || selectedVariant;
    const adjustedBasePrice = basePrice + (variant?.priceAdjustment || 0);
    const adjustedSalePrice = salePrice ? salePrice + (variant?.priceAdjustment || 0) : undefined;
    return {
      base: adjustedBasePrice,
      sale: adjustedSalePrice,
      adjustment: variant?.priceAdjustment || 0,
    };
  }, [basePrice, salePrice, selectedVariant, hoveredVariant]);

  // Handle variant selection for a specific attribute
  const handleAttributeSelect = (attributeType: string, attributeValue: string) => {
    // Find variant that matches the selected attribute and any other currently selected attributes
    const newVariant = variants.find(variant => {
      const currentSelection = { ...selectedVariant?.attributes } || {};
      currentSelection[attributeType] = attributeValue;
      
      return Object.entries(currentSelection).every(([type, value]) => 
        variant.attributes[type] === value
      );
    });

    onVariantChange(newVariant);
  };

  // Get available options for an attribute type based on current selection
  const getAvailableOptions = (attributeType: string) => {
    if (!selectedVariant) {
      return variantGroups[attributeType] || [];
    }

    // Filter options that are compatible with other selected attributes
    const otherAttributes = Object.entries(selectedVariant.attributes)
      .filter(([type]) => type !== attributeType);

    return (variantGroups[attributeType] || []).filter(option => {
      return variants.some(variant => {
        return variant.attributes[attributeType] === option.attribute &&
          otherAttributes.every(([type, value]) => 
            variant.attributes[type] === value
          );
      });
    });
  };

  if (!variants.length) return null;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Price Display */}
      <div className="flex items-center gap-4">
        <PriceDisplay
          basePrice={currentPrice.base}
          salePrice={currentPrice.sale}
          size="lg"
        />
        {currentPrice.adjustment !== 0 && (
          <Badge variant={currentPrice.adjustment > 0 ? "secondary" : "outline"}>
            {currentPrice.adjustment > 0 ? '+' : ''}${Math.abs(currentPrice.adjustment).toFixed(2)}
          </Badge>
        )}
      </div>

      {/* Variant Groups */}
      {Object.entries(variantGroups).map(([attributeType, options]) => (
        <div key={attributeType} className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-base capitalize">
              {attributeType}
            </h3>
            {selectedVariant?.attributes[attributeType] && (
              <Badge variant="secondary" className="text-xs">
                {selectedVariant.attributes[attributeType]}
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {getAvailableOptions(attributeType).map((option) => {
              const isSelected = selectedVariant?.attributes[attributeType] === option.attribute;
              const isAvailable = option.variants.some(v => v.inventory.inStock);
              const stockCount = option.variants.reduce((sum, v) => sum + v.inventory.available, 0);
              const isLowStock = stockCount > 0 && stockCount <= 5;

              return (
                <motion.div
                  key={option.attribute}
                  whileHover={{ scale: isAvailable ? 1.02 : 1 }}
                  whileTap={{ scale: isAvailable ? 0.98 : 1 }}
                >
                  <Button
                    variant={isSelected ? "default" : "outline"}
                    className={cn(
                      "h-auto p-3 text-left justify-start relative",
                      !isAvailable && "opacity-50 cursor-not-allowed",
                      isSelected && "ring-2 ring-primary ring-offset-2"
                    )}
                    onClick={() => {
                      if (isAvailable) {
                        handleAttributeSelect(attributeType, option.attribute);
                      }
                    }}
                    onMouseEnter={() => {
                      if (isAvailable) {
                        const hoverVariant = option.variants.find(v => v.inventory.inStock);
                        setHoveredVariant(hoverVariant || null);
                      }
                    }}
                    onMouseLeave={() => setHoveredVariant(null)}
                    disabled={!isAvailable}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">
                          {option.attribute}
                        </div>
                        {isLowStock && (
                          <div className="text-xs text-warning flex items-center gap-1 mt-1">
                            <AlertCircle className="h-3 w-3" />
                            Low stock
                          </div>
                        )}
                        {!isAvailable && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Out of stock
                          </div>
                        )}
                      </div>
                      {isSelected && (
                        <Check className="h-4 w-4 flex-shrink-0 ml-2" />
                      )}
                    </div>
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Selected Variant Details */}
      <AnimatePresence>
        {selectedVariant && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Selected Variant
                    </h4>
                    <div className="space-y-1">
                      <p className="text-sm">
                        <span className="font-medium">SKU:</span> {selectedVariant.sku}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Name:</span> {selectedVariant.name}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {Object.entries(selectedVariant.attributes).map(([type, value]) => (
                          <Badge key={type} variant="secondary" className="text-xs">
                            {type}: {value}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right space-y-1">
                    <div className={cn(
                      "font-semibold",
                      selectedVariant.inventory.inStock 
                        ? selectedVariant.inventory.available <= 5 
                          ? "text-warning" 
                          : "text-primary"
                        : "text-destructive"
                    )}>
                      {selectedVariant.inventory.inStock 
                        ? selectedVariant.inventory.available <= 5
                          ? `${selectedVariant.inventory.available} left`
                          : "In Stock"
                        : "Out of Stock"
                      }
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {selectedVariant.inventory.available} available
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Simple variant selector for compact layouts
export function CompactVariantSelector({
  variants,
  selectedVariant,
  onVariantChange,
  className,
}: Omit<VariantSelectorProps, 'basePrice' | 'salePrice'>) {
  if (!variants.length) return null;

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {variants.map((variant) => {
        const isSelected = selectedVariant?.id === variant.id;
        const isAvailable = variant.inventory.inStock;

        return (
          <Button
            key={variant.id}
            size="sm"
            variant={isSelected ? "default" : "outline"}
            className={cn(
              "text-xs",
              !isAvailable && "opacity-50 cursor-not-allowed"
            )}
            onClick={() => isAvailable && onVariantChange(variant)}
            disabled={!isAvailable}
          >
            {variant.name}
            {isSelected && <Check className="ml-1 h-3 w-3" />}
          </Button>
        );
      })}
    </div>
  );
}