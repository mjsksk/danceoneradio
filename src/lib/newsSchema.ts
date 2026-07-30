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

  const usable = articles.filter((a): a is NewsArticle => Boolean(a)).slice(0, 20);

  const items = usable.map((article, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    url: article.source_url,
    item: {
      '@type': 'NewsArticle',
      '@id': `${url}#article-${article.id}`,
      headline: truncateHeadline(article.title),
      ...(article.title.length > HEADLINE_MAX ? { alternativeHeadline: article.title } : {}),
      name: article.title,
      description: article.summary,
      url: article.source_url,
      mainEntityOfPage: { '@type': 'WebPage', '@id': article.source_url },
      datePublished: toIso(article.published_at),
      dateModified: toIso(article.fetched_at ?? article.published_at),
      image: imageObject(article.image_url),
      thumbnailUrl: article.image_url ?? FALLBACK_IMAGE,
      author: { '@type': 'Organization', name: article.source_name, url: article.source_url },
      publisher: PUBLISHER,
      articleSection: CATEGORY_LABELS[article.category] ?? 'Electronic Music',
      ...(article.tags?.length ? { keywords: article.tags.join(', ') } : {}),
      inLanguage: 'en-US',
      isAccessibleForFree: true,
    },
  }));

  const dates = usable
    .map((a) => toIso(a.published_at))
    .filter(Boolean)
    .sort();
  const modifiedDates = usable
    .map((a) => toIso(a.fetched_at ?? a.published_at))
    .filter(Boolean)
    .sort();


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
