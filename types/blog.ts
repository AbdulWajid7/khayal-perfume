export interface BlogPost {
  _id: string;
  title: string;
  slug: { current: string };
  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
  noFollow?: boolean;
  ogImage?: string;
  schemaType?: string;
  publishedAt: string;
  updatedAt?: string;
  excerpt: string;
  coverImage?: {
    asset: {
      _ref: string;
      url?: string;
    };
    alt?: string;
  };
  content: string;
  rawContent?: string;
  tags?: string[];
  readTime?: number;
}

export interface BlogPostCard {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt: string;
  publishedAt: string;
  coverImage?: {
    asset: {
      url?: string;
    };
    alt?: string;
  };
  tags?: string[];
  readTime?: number;
}
