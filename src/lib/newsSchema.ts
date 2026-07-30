import type { NewsArticle } from '@/hooks/useNewsArticles';

const HOST = 'https://danceoneradio.com';

const PUBLISHER = {
  '@type': 'RadioStation',
  name: 'Dance One Radio',
  url: HOST,
  logo: {
    '@type': 'ImageObject',
    url: `${HOST}/lovable-uploads/c8f83eb5-b5ed-4bfd-88eb-604ca3cd2fe8.png`,
  },
};

export interface NewsCollectionOptions {
  /** Route path, e.g. "/news/top-stories" */
  path: string;
  /** Human-readable page name used for schema name + breadcrumb leaf */
  name: string;
  description: string;
  /** Optional breadcrumb leaf label (defaults to `name`) */
  breadcrumbLabel?: string;
  /** Articles rendered on the page — emitted as an ItemList of NewsArticle items */
  articles?: (NewsArticle | undefined)[];
}

/**
 * Builds CollectionPage + BreadcrumbList (+ ItemList of NewsArticle) JSON-LD
 * for the news hub and its category pages.
 */
export const buildNewsCollectionSchema = ({
  path,
  name,
  description,
  breadcrumbLabel,
  articles = [],
}: NewsCollectionOptions): Record<string, unknown>[] => {
  const url = `${HOST}${path}`;

  const items = articles
    .filter((a): a is NewsArticle => Boolean(a))
    .slice(0, 20)
    .map((article, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'NewsArticle',
        headline: article.title,
        description: article.summary,
        url: article.source_url,
        datePublished: article.published_at,
        ...(article.image_url ? { image: [article.image_url] } : {}),
        author: { '@type': 'Organization', name: article.source_name },
        publisher: PUBLISHER,
      },
    }));

  const breadcrumbItems = [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${HOST}/` },
    { '@type': 'ListItem', position: 2, name: 'News', item: `${HOST}/news` },
  ];
  if (path !== '/news') {
    breadcrumbItems.push({
      '@type': 'ListItem',
      position: 3,
      name: breadcrumbLabel ?? name,
      item: url,
    });
  }

  const schema: Record<string, unknown>[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name,
      description,
      url,
      inLanguage: 'en-US',
      isPartOf: { '@type': 'WebSite', name: 'Dance One Radio', url: HOST },
      publisher: PUBLISHER,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbItems,
    },
  ];

  if (items.length) {
    schema.push({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name,
      itemListElement: items,
    });
  }

  return schema;
};
