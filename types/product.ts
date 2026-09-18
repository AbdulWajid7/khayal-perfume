export interface ShopifyMoney {
  amount: string;
  currencyCode: string;
}

export interface ShopifyImage {
  url: string;
  altText?: string | null;
  width?: number;
  height?: number;
}

export interface ProductVariant {
  id: string;
  title: string;
  price: ShopifyMoney;
  availableForSale: boolean;
  sku?: string | null;
}

export interface ProductMetafield {
  namespace: string;
  key: string;
  value: string;
}

export interface ScentNotes {
  top?: string[];
  heart?: string[];
  base?: string[];
}

export interface Product {
  id: string;
  title: string;
  handle: string;
  description: string;
  descriptionHtml: string;
  priceRange: {
    minVariantPrice: ShopifyMoney;
  };
  compareAtPriceRange?: {
    maxVariantPrice: ShopifyMoney;
  };
  featuredImage: ShopifyImage | null;
  images: ShopifyImage[];
  variants: ProductVariant[];
  metafields: ProductMetafield[];
  tags: string[];
  productType?: string;
  vendor?: string;
  publishedAt?: string;
  updatedAt?: string;
}

export interface ProductDetails extends Product {
  scentNotes: ScentNotes;
  longevity: string;
  occasion: string;
  scentFamily: string;
  dayNight?: string;
  season?: string;
  intensity?: string;
  accentColor?: string;
  backgroundColor?: string;
  storyImage?: string;
  transparentBottleImage?: string;
  threeDModelUrl?: string;
}

export interface CartLineInput {
  merchandiseId: string;
  quantity: number;
}

export interface ShopifyCart {
  id: string;
  checkoutUrl: string;
  lines: {
    edges: Array<{
      node: {
        id: string;
        quantity: number;
        merchandise: {
          id: string;
          title: string;
          product: {
            id: string;
            title: string;
            featuredImage?: { url: string; altText?: string | null } | null;
          };
        };
        cost: {
          totalAmount: ShopifyMoney;
        };
      };
    }>;
  };
  cost: {
    subtotalAmount: ShopifyMoney;
    totalAmount: ShopifyMoney;
    totalTaxAmount?: ShopifyMoney | null;
  };
}
