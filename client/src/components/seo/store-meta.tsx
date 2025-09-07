import React from 'react';

interface StoreMetaProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'product';
  productData?: {
    price?: number;
    currency?: string;
    availability?: 'in_stock' | 'out_of_stock';
    brand?: string;
    category?: string;
    sku?: string;
  };
  structuredData?: Record<string, any>;
}

export function StoreMeta({
  title = "Panickin' Skywalker Official Merch Store",
  description = "Shop exclusive Panickin' Skywalker merchandise, vinyl records, and limited edition collectibles. Anxious superhero gear for true fans.",
  image = "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=630",
  url,
  type = 'website',
  productData,
  structuredData,
}: StoreMetaProps) {
  const siteTitle = "Panickin' Skywalker";
  const fullTitle = title.includes(siteTitle) ? title : `${title} | ${siteTitle}`;
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

  // Generate structured data
  const baseStructuredData = {
    "@context": "https://schema.org",
    "@type": type === 'product' ? "Product" : "WebPage",
    "name": title,
    "description": description,
    "url": currentUrl,
    ...(image && {
      "image": {
        "@type": "ImageObject",
        "url": image,
        "width": 1200,
        "height": 630
      }
    })
  };

  // Add product-specific structured data
  if (type === 'product' && productData) {
    Object.assign(baseStructuredData, {
      "@type": "Product",
      "brand": {
        "@type": "Brand",
        "name": productData.brand || siteTitle
      },
      ...(productData.sku && { "sku": productData.sku }),
      ...(productData.category && { "category": productData.category }),
      ...(productData.price && {
        "offers": {
          "@type": "Offer",
          "price": productData.price,
          "priceCurrency": productData.currency || "USD",
          "availability": productData.availability === 'in_stock' 
            ? "https://schema.org/InStock" 
            : "https://schema.org/OutOfStock",
          "seller": {
            "@type": "Organization",
            "name": siteTitle
          }
        }
      })
    });
  }

  // Merge with custom structured data
  const finalStructuredData = structuredData ? { ...baseStructuredData, ...structuredData } : baseStructuredData;

  React.useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Update meta tags
    const metaTags = [
      { name: 'description', content: description },
      { name: 'keywords', content: "Panickin Skywalker, band merchandise, vinyl records, t-shirts, hoodies, anxious superhero, indie rock, music merch" },
      { name: 'author', content: siteTitle },
      { name: 'robots', content: 'index, follow' },
      
      // Open Graph
      { property: 'og:title', content: fullTitle },
      { property: 'og:description', content: description },
      { property: 'og:image', content: image },
      { property: 'og:url', content: currentUrl },
      { property: 'og:type', content: type === 'product' ? 'product' : 'website' },
      { property: 'og:site_name', content: siteTitle },
      { property: 'og:locale', content: 'en_US' },
      
      // Twitter
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: fullTitle },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: image },
      
      // Product-specific meta tags
      ...(type === 'product' && productData ? [
        { property: 'product:price:amount', content: productData.price?.toString() },
        { property: 'product:price:currency', content: productData.currency || 'USD' },
        { property: 'product:availability', content: productData.availability || 'in_stock' },
        { property: 'product:brand', content: productData.brand || siteTitle },
        { property: 'product:category', content: productData.category },
      ].filter(tag => tag.content) : [])
    ];

    // Update existing or create new meta tags
    metaTags.forEach(({ name, property, content }) => {
      if (!content) return;

      const selector = name ? `meta[name="${name}"]` : `meta[property="${property}"]`;
      let metaTag = document.querySelector(selector) as HTMLMetaElement;
      
      if (metaTag) {
        metaTag.content = content;
      } else {
        metaTag = document.createElement('meta');
        if (name) metaTag.name = name;
        if (property) metaTag.setAttribute('property', property);
        metaTag.content = content;
        document.head.appendChild(metaTag);
      }
    });

    // Update structured data
    let structuredDataScript = document.querySelector('#structured-data') as HTMLScriptElement;
    if (structuredDataScript) {
      structuredDataScript.textContent = JSON.stringify(finalStructuredData);
    } else {
      structuredDataScript = document.createElement('script');
      structuredDataScript.id = 'structured-data';
      structuredDataScript.type = 'application/ld+json';
      structuredDataScript.textContent = JSON.stringify(finalStructuredData);
      document.head.appendChild(structuredDataScript);
    }

    // Cleanup function to remove meta tags when component unmounts
    return () => {
      // Note: In a SPA, we might want to keep some meta tags for navigation
      // but clean up product-specific ones
      if (type === 'product') {
        const productMetaTags = document.querySelectorAll('meta[property^="product:"]');
        productMetaTags.forEach(tag => tag.remove());
      }
    };
  }, [fullTitle, description, image, currentUrl, type, productData, finalStructuredData]);

  return null; // This component only manages meta tags, no render
}

// Convenience components for specific pages
export function StorePageMeta() {
  return (
    <StoreMeta
      title="Official Merch Store"
      description="Shop exclusive Panickin' Skywalker merchandise, vinyl records, and limited edition collectibles. Anxious superhero gear for true fans."
      structuredData={{
        "@type": "Store",
        "name": "Panickin' Skywalker Official Store",
        "description": "Official merchandise store for indie rock band Panickin' Skywalker",
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": "Band Merchandise",
          "itemListElement": [
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Product",
                "name": "T-Shirts",
                "category": "Clothing"
              }
            },
            {
              "@type": "Offer", 
              "itemOffered": {
                "@type": "Product",
                "name": "Vinyl Records",
                "category": "Music"
              }
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Product", 
                "name": "Accessories",
                "category": "Accessories"
              }
            }
          ]
        }
      }}
    />
  );
}

export function ProductPageMeta({
  productName,
  productDescription,
  productImage,
  price,
  currency = 'USD',
  availability,
  category,
  sku
}: {
  productName: string;
  productDescription: string;
  productImage?: string;
  price?: number;
  currency?: string;
  availability?: 'in_stock' | 'out_of_stock';
  category?: string;
  sku?: string;
}) {
  return (
    <StoreMeta
      title={`${productName} - Official Merch`}
      description={productDescription}
      image={productImage}
      type="product"
      productData={{
        price,
        currency,
        availability,
        brand: "Panickin' Skywalker",
        category,
        sku
      }}
    />
  );
}

export function CategoryPageMeta({
  categoryName,
  categoryDescription,
  categoryImage,
  productCount
}: {
  categoryName: string;
  categoryDescription: string;
  categoryImage?: string;
  productCount?: number;
}) {
  return (
    <StoreMeta
      title={`${categoryName} - Official Merch Collection`}
      description={`${categoryDescription} ${productCount ? `Browse ${productCount} items in our ${categoryName.toLowerCase()} collection.` : ''}`}
      image={categoryImage}
      structuredData={{
        "@type": "CollectionPage",
        "name": `${categoryName} Collection`,
        "description": categoryDescription,
        ...(productCount && { "numberOfItems": productCount })
      }}
    />
  );
}