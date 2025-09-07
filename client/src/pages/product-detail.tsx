import React, { useState, useMemo } from 'react';
import { useParams, Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductGallery } from '@/components/store/product-gallery';
import { VariantSelector } from '@/components/store/variant-selector';
import { ProductGrid } from '@/components/store/product-grid';
import { PriceDisplay } from '@/components/store/price-display';
import { useProduct, useRelatedProducts, ProductVariant, useStockStatus } from '@/hooks/use-products';
import { useAddToCart, useIsInCart, useCartItem } from '@/hooks/use-cart';
import { ProductPageMeta } from '@/components/seo/store-meta';
import { cn } from '@/lib/utils';
import {
  ShoppingBag,
  Heart,
  Share2,
  ChevronLeft,
  Star,
  Shield,
  Truck,
  RotateCcw,
  Zap,
  Clock,
  AlertCircle,
  Plus,
  Minus,
  Info,
  Check
} from 'lucide-react';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const [, setLocation] = useLocation();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>();
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  
  // Cart integration
  const addToCart = useAddToCart();
  const isInCart = useIsInCart(
    product?.id || '', 
    selectedVariant?.id || ''
  );
  const cartItem = useCartItem(
    product?.id || '',
    selectedVariant?.id || ''
  );

  // Fetch product data
  const { data: product, isLoading, error } = useProduct(slug!);
  const { data: relatedProducts, isLoading: relatedLoading } = useRelatedProducts(
    product?.id || '',
    6
  );

  // Stock status
  const stockStatus = useStockStatus(product!, selectedVariant);

  // Set default variant when product loads
  React.useEffect(() => {
    if (product?.variants?.length && !selectedVariant) {
      // Find first available variant or just the first one
      const defaultVariant = product.variants.find(v => v.inventory.inStock) || product.variants[0];
      setSelectedVariant(defaultVariant);
    }
  }, [product, selectedVariant]);

  // Calculate max quantity based on stock
  const maxQuantity = useMemo(() => {
    if (!stockStatus.isInStock) return 0;
    return Math.min(stockStatus.stockCount, 10); // Cap at 10 for UX
  }, [stockStatus]);

  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(Math.max(1, Math.min(maxQuantity, newQuantity)));
  };

  const handleAddToCart = () => {
    if (!product || !selectedVariant) {
      return;
    }
    
    addToCart.mutate({
      productId: product.id,
      variantId: selectedVariant.id,
      quantity
    });
  };

  const handleWishlistToggle = () => {
    setIsWishlisted(!isWishlisted);
    // TODO: Implement wishlist functionality
  };

  const handleShare = async () => {
    if (navigator.share && product) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out this ${product.category.name.toLowerCase()} from Panickin' Skywalker!`,
          url: window.location.href,
        });
      } catch (err) {
        // Fallback to copy URL
        navigator.clipboard.writeText(window.location.href);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="aspect-square bg-muted animate-pulse rounded-lg" />
          <div className="space-y-6">
            <div className="h-8 bg-muted animate-pulse rounded" />
            <div className="h-6 bg-muted animate-pulse rounded w-3/4" />
            <div className="h-12 bg-muted animate-pulse rounded" />
            <div className="h-32 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <p className="text-muted-foreground mb-8">
          The product you're looking for doesn't exist or has been removed.
        </p>
        <Button asChild>
          <Link href="/store">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Browse All Products
          </Link>
        </Button>
      </div>
    );
  }

  const currentPrice = selectedVariant 
    ? product.basePrice + selectedVariant.priceAdjustment
    : product.basePrice;
  const currentSalePrice = selectedVariant && product.salePrice
    ? product.salePrice + selectedVariant.priceAdjustment
    : product.salePrice;

  return (
    <div className="bg-background text-foreground min-h-screen">
      <ProductPageMeta
        productName={product.name}
        productDescription={product.description}
        productImage={product.images?.[0]?.imageUrl}
        price={selectedVariant?.price || product.basePrice}
        availability={stockStatus.inStock ? 'in_stock' : 'out_of_stock'}
        category={product.category?.name}
        sku={selectedVariant?.sku}
      />
      
      {/* Breadcrumb */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link 
              href="/store" 
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Store
            </Link>
            <span className="text-muted-foreground">›</span>
            <Link 
              href={`/store/category/${product.category.slug}`}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              {product.category.name}
            </Link>
            <span className="text-muted-foreground">›</span>
            <span className="font-medium">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Back Button */}
      <div className="container mx-auto px-4 py-4">
        <Button
          variant="ghost"
          onClick={() => setLocation('/store')}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Store
        </Button>
      </div>

      {/* Product Details */}
      <div className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Product Images */}
          <div>
            <ProductGallery
              images={product.images || (product.primaryImage ? [product.primaryImage] : [])}
              productName={product.name}
              enableZoom={true}
              showThumbnails={true}
            />
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            {/* Header */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <Badge variant="secondary" className="mb-3">
                    {product.category.name}
                  </Badge>
                  <h1 className="text-3xl md:text-4xl font-bold leading-tight">
                    {product.name}
                  </h1>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleWishlistToggle}
                    className={cn(isWishlisted && "text-primary")}
                  >
                    <Heart className={cn("h-4 w-4", isWishlisted && "fill-current")} />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleShare}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Product Badges */}
              <div className="flex flex-wrap gap-2">
                {product.isNew && (
                  <Badge className="flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    New
                  </Badge>
                )}
                {product.isFeatured && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    Featured
                  </Badge>
                )}
                {!stockStatus.isInStock && (
                  <Badge variant="destructive">
                    Out of Stock
                  </Badge>
                )}
                {stockStatus.isLowStock && (
                  <Badge variant="outline" className="text-warning border-warning">
                    <Clock className="h-3 w-3 mr-1" />
                    Low Stock
                  </Badge>
                )}
              </div>
            </div>

            {/* Variant Selection & Pricing */}
            {product.variants && product.variants.length > 0 ? (
              <VariantSelector
                variants={product.variants}
                basePrice={product.basePrice}
                salePrice={product.salePrice}
                selectedVariant={selectedVariant}
                onVariantChange={setSelectedVariant}
              />
            ) : (
              <PriceDisplay
                basePrice={product.basePrice}
                salePrice={product.salePrice}
                size="lg"
              />
            )}

            {/* Quantity & Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center">
                  <label className="font-medium mr-4">Quantity:</label>
                  <div className="flex items-center border border-border rounded-md">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="px-3 py-2"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="px-4 py-2 min-w-[3rem] text-center">
                      {quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= maxQuantity}
                      className="px-3 py-2"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {maxQuantity > 0 && (
                  <span className="text-sm text-muted-foreground">
                    {maxQuantity} available
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={!stockStatus.isInStock || quantity > maxQuantity || addToCart.isPending}
                  className={cn(
                    "flex-1",
                    isInCart ? "bg-secondary text-secondary-foreground hover:bg-secondary/90" : "bg-primary text-primary-foreground hover:bg-primary/90"
                  )}
                >
                  {addToCart.isPending ? (
                    <>
                      <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-transparent border-t-current" />
                      Adding to Cart...
                    </>
                  ) : !stockStatus.isInStock ? (
                    'Out of Stock'
                  ) : isInCart ? (
                    <>
                      <Check className="mr-2 h-5 w-5" />
                      Added to Cart ({cartItem?.quantity || 0})
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="mr-2 h-5 w-5" />
                      Add to Cart
                    </>
                  )}
                </Button>
              </div>

              {/* Stock Status Info */}
              {stockStatus.isInStock && stockStatus.isLowStock && (
                <div className="flex items-center gap-2 p-3 bg-warning/10 text-warning rounded-lg text-sm">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>
                    Only {stockStatus.stockCount} left in stock - order soon!
                  </span>
                </div>
              )}
              
              {/* Cart Item Info */}
              {isInCart && cartItem && (
                <div className="flex items-center gap-2 p-3 bg-primary/10 text-primary rounded-lg text-sm">
                  <ShoppingBag className="h-4 w-4 flex-shrink-0" />
                  <span>
                    {cartItem.quantity} {cartItem.quantity === 1 ? 'item' : 'items'} in your cart
                  </span>
                  <Link href="/cart" className="ml-auto text-xs underline hover:no-underline">
                    View Cart
                  </Link>
                </div>
              )}
            </div>

            {/* Product Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
                <Shield className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-sm">Authentic</p>
                  <p className="text-xs text-muted-foreground">Official merch</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
                <Truck className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-sm">Free Shipping</p>
                  <p className="text-xs text-muted-foreground">Orders over $50</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
                <RotateCcw className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-sm">Easy Returns</p>
                  <p className="text-xs text-muted-foreground">30-day policy</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <Tabs defaultValue="description" className="mb-16">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="shipping">Shipping & Returns</TabsTrigger>
          </TabsList>
          
          <TabsContent value="description" className="mt-8">
            <Card>
              <CardContent className="p-6">
                <div className="prose prose-neutral dark:prose-invert max-w-none">
                  {product.description ? (
                    <div dangerouslySetInnerHTML={{ __html: product.description }} />
                  ) : (
                    <p className="text-muted-foreground">
                      No detailed description available for this product.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="mt-8">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Product Information</h4>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Category:</dt>
                        <dd>{product.category.name}</dd>
                      </div>
                      {selectedVariant && (
                        <>
                          <div className="flex justify-between">
                            <dt className="text-muted-foreground">SKU:</dt>
                            <dd className="font-mono">{selectedVariant.sku}</dd>
                          </div>
                          {Object.entries(selectedVariant.attributes).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <dt className="text-muted-foreground capitalize">{key}:</dt>
                              <dd>{value}</dd>
                            </div>
                          ))}
                        </>
                      )}
                    </dl>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Care Instructions</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Machine wash cold with like colors</li>
                      <li>• Tumble dry low heat</li>
                      <li>• Do not iron directly on design</li>
                      <li>• Do not dry clean</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shipping" className="mt-8">
            <Card>
              <CardContent className="p-6 space-y-6">
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    Shipping Information
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Free standard shipping on orders over $50</li>
                    <li>• Standard shipping: 3-5 business days</li>
                    <li>• Express shipping: 1-2 business days</li>
                    <li>• International shipping available</li>
                  </ul>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Returns & Exchanges
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• 30-day return policy for unworn items</li>
                    <li>• Items must be in original condition with tags</li>
                    <li>• Free returns for defective items</li>
                    <li>• Exchanges available for different sizes</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <section>
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">You Might Also Like</h2>
              <p className="text-muted-foreground">
                More items from the {product.category.name} collection
              </p>
            </div>
            
            <ProductGrid
              products={relatedProducts}
              isLoading={relatedLoading}
              columns={{ xs: 1, sm: 2, md: 3, lg: 4, xl: 6 }}
              variant="compact"
              emptyTitle="No related products found"
            />
          </section>
        )}
      </div>
    </div>
  );
}