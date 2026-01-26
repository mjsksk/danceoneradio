import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// EDM news RSS feed sources
const RSS_SOURCES = [
  { url: 'https://www.edm.com/feed/', name: 'EDM.com' },
  { url: 'https://mixmag.net/feed', name: 'Mixmag' },
  { url: 'https://djmag.com/feed', name: 'DJ Mag' },
  { url: 'https://dancingastronaut.com/feed/', name: 'Dancing Astronaut' },
  { url: 'https://www.youredm.com/feed/', name: 'Your EDM' },
]

// Keywords for auto-categorization
const CATEGORY_KEYWORDS = {
  event: ['festival', 'tour', 'announce', 'lineup', 'tickets', 'show', 'concert', 'residency'],
  release: ['release', 'single', 'album', 'ep', 'track', 'remix', 'premiere', 'drop', 'debut'],
  artist: ['dj', 'producer', 'artist', 'interview', 'profile', 'spotlight', 'collaboration'],
  industry: ['industry', 'streaming', 'label', 'record', 'business', 'chart', 'billboard', 'spotify'],
}

interface ParsedArticle {
  title: string;
  slug: string;
  summary: string;
  source_url: string;
  source_name: string;
  image_url: string | null;
  published_at: string;
  category: string;
  tags: string[];
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 100)
    + '-' + Date.now().toString(36)
}

function categorizeArticle(title: string, summary: string): string {
  const text = (title + ' ' + summary).toLowerCase()
  
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        return category
      }
    }
  }
  
  return 'headline'
}

function extractTags(title: string, summary: string): string[] {
  const text = (title + ' ' + summary).toLowerCase()
  const tags: string[] = []
  
  // Extract common EDM-related tags
  const tagKeywords = ['house', 'techno', 'trance', 'dubstep', 'drum and bass', 'dnb', 'bass', 
    'progressive', 'electro', 'future', 'deep', 'minimal', 'tech house', 'melodic']
  
  for (const keyword of tagKeywords) {
    if (text.includes(keyword)) {
      tags.push(keyword)
    }
  }
  
  return tags.slice(0, 5) // Limit to 5 tags
}

function parseRSSItem(item: string, sourceName: string): ParsedArticle | null {
  try {
    // Extract title
    const titleMatch = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/s)
    const title = (titleMatch?.[1] || titleMatch?.[2] || '').trim()
    if (!title) return null

    // Extract link
    const linkMatch = item.match(/<link>(.*?)<\/link>|<link[^>]*href="([^"]*)"/)
    const link = (linkMatch?.[1] || linkMatch?.[2] || '').trim()
    if (!link) return null

    // Extract description/summary
    const descMatch = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>(.*?)<\/description>/s)
    let summary = (descMatch?.[1] || descMatch?.[2] || '').trim()
    // Strip HTML tags and limit length
    summary = summary.replace(/<[^>]*>/g, '').substring(0, 300)
    if (summary.length === 300) summary += '...'

    // Extract publication date
    const dateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/)
    const pubDate = dateMatch?.[1] ? new Date(dateMatch[1]).toISOString() : new Date().toISOString()

    // Extract image from various possible locations (prioritize high-res)
    let imageUrl: string | null = null
    
    // Try media:content with highest width first
    const mediaContents = item.matchAll(/<media:content[^>]*url="([^"]*)"[^>]*(?:width="(\d+)")?/gi)
    let bestMedia = { url: '', width: 0 }
    for (const match of mediaContents) {
      const width = parseInt(match[2] || '0', 10)
      if (width > bestMedia.width || (!bestMedia.url && match[1])) {
        bestMedia = { url: match[1], width }
      }
    }
    if (bestMedia.url) imageUrl = bestMedia.url
    
    // Try media:thumbnail (often higher res)
    if (!imageUrl) {
      const thumbMatch = item.match(/<media:thumbnail[^>]*url="([^"]*)"/)
      if (thumbMatch) imageUrl = thumbMatch[1]
    }
    
    // Try enclosure (podcasts/media)
    if (!imageUrl) {
      const encMatch = item.match(/<enclosure[^>]*url="([^"]*\.(jpg|jpeg|png|webp|gif))"[^>]*type="image/i)
      if (encMatch) imageUrl = encMatch[1]
    }
    
    // Try og:image or featured image in content
    if (!imageUrl) {
      const ogMatch = item.match(/og:image[^>]*content="([^"]*)"/)
        || item.match(/property="og:image"[^>]*content="([^"]*)"/)
      if (ogMatch) imageUrl = ogMatch[1]
    }
    
    // Try any large image in content (prefer larger dimensions in URL)
    if (!imageUrl) {
      const imgMatches = item.matchAll(/src="(https?:\/\/[^"]*(?:1200|1024|800|large|full|original)[^"]*\.(?:jpg|jpeg|png|webp))"/gi)
      for (const match of imgMatches) {
        imageUrl = match[1]
        break
      }
    }
    
    // Fallback to any image
    if (!imageUrl) {
      const anyImg = item.match(/src="(https?:\/\/[^"]*\.(?:jpg|jpeg|png|webp|gif))"/i)
        || item.match(/<image>.*?<url>(.*?)<\/url>.*?<\/image>/s)
      if (anyImg) imageUrl = anyImg[1]
    }

    const category = categorizeArticle(title, summary)
    const tags = extractTags(title, summary)

    return {
      title,
      slug: generateSlug(title),
      summary: summary || 'Read the full article for more details.',
      source_url: link,
      source_name: sourceName,
      image_url: imageUrl,
      published_at: pubDate,
      category,
      tags,
    }
  } catch (error) {
    console.error('Error parsing RSS item:', error)
    return null
  }
}

// Fetch OG image from article page if no image in RSS
async function fetchOgImage(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Dance One Radio News Bot/1.0',
        'Accept': 'text/html'
      },
      signal: AbortSignal.timeout(8000)
    })
    
    if (!response.ok) return null
    
    const html = await response.text()
    
    // Try og:image first (highest priority)
    const ogMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]*)"/)
      || html.match(/<meta[^>]*content="([^"]*)"[^>]*property="og:image"/)
    if (ogMatch?.[1]) return ogMatch[1]
    
    // Try twitter:image
    const twitterMatch = html.match(/<meta[^>]*name="twitter:image"[^>]*content="([^"]*)"/)
      || html.match(/<meta[^>]*content="([^"]*)"[^>]*name="twitter:image"/)
    if (twitterMatch?.[1]) return twitterMatch[1]
    
    // Try featured image or main article image
    const featuredMatch = html.match(/class="[^"]*(?:featured|hero|main|article)[^"]*"[^>]*>[\s\S]*?<img[^>]*src="([^"]*\.(jpg|jpeg|png|webp))"/i)
      || html.match(/<img[^>]*class="[^"]*(?:featured|hero|main|article)[^"]*"[^>]*src="([^"]*\.(jpg|jpeg|png|webp))"/i)
    if (featuredMatch?.[1]) return featuredMatch[1]
    
    return null
  } catch (error) {
    console.error(`Error fetching OG image from ${url}:`, error)
    return null
  }
}

function parseRSSFeed(xmlContent: string, sourceName: string): ParsedArticle[] {
  const articles: ParsedArticle[] = []
  
  // Split by <item> tags
  const items = xmlContent.split(/<item>/i).slice(1)
  
  for (const item of items) {
    const parsed = parseRSSItem('<item>' + item, sourceName)
    if (parsed) {
      articles.push(parsed)
    }
  }
  
  return articles
}

async function fetchRSSFeed(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Dance One Radio News Aggregator/1.0',
        'Accept': 'application/rss+xml, application/xml, text/xml'
      },
      signal: AbortSignal.timeout(15000)
    })
    
    if (!response.ok) {
      console.error(`Failed to fetch ${url}: ${response.status}`)
      return null
    }
    
    return await response.text()
  } catch (error) {
    console.error(`Error fetching ${url}:`, error)
    return null
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🔄 Starting EDM news fetch...')
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const allArticles: ParsedArticle[] = []
    const fetchPromises = RSS_SOURCES.map(async (source) => {
      console.log(`📡 Fetching from ${source.name}...`)
      const xml = await fetchRSSFeed(source.url)
      if (xml) {
        const articles = parseRSSFeed(xml, source.name)
        console.log(`✅ Parsed ${articles.length} articles from ${source.name}`)
        return articles
      }
      return []
    })

    const results = await Promise.allSettled(fetchPromises)
    for (const result of results) {
      if (result.status === 'fulfilled') {
        allArticles.push(...result.value)
      }
    }

    console.log(`📰 Total articles fetched: ${allArticles.length}`)

    // Try to fetch OG images for articles without images (limit to avoid timeouts)
    const articlesNeedingImages = allArticles.filter(a => !a.image_url).slice(0, 10)
    if (articlesNeedingImages.length > 0) {
      console.log(`🖼️ Fetching OG images for ${articlesNeedingImages.length} articles...`)
      const imagePromises = articlesNeedingImages.map(async (article) => {
        const ogImage = await fetchOgImage(article.source_url)
        if (ogImage) {
          article.image_url = ogImage
          console.log(`✅ Found OG image for: ${article.title.substring(0, 40)}...`)
        }
      })
      await Promise.allSettled(imagePromises)
    }

    // Insert articles, skipping duplicates (handled by unique constraint on source_url)
    let insertedCount = 0
    let skippedCount = 0

    for (const article of allArticles) {
      const { error } = await supabase
        .from('edm_news_articles')
        .upsert({
          ...article,
          fetched_at: new Date().toISOString()
        }, {
          onConflict: 'source_url',
          ignoreDuplicates: true
        })

      if (error) {
        if (error.code === '23505') {
          skippedCount++
        } else {
          console.error('Insert error:', error)
        }
      } else {
        insertedCount++
      }
    }

    // Mark featured articles (most recent from each category)
    await supabase
      .from('edm_news_articles')
      .update({ is_featured: false })
      .eq('is_featured', true)

    // Get the most recent article to feature
    const { data: recentArticle } = await supabase
      .from('edm_news_articles')
      .select('id')
      .order('published_at', { ascending: false })
      .limit(1)
      .single()

    if (recentArticle) {
      await supabase
        .from('edm_news_articles')
        .update({ is_featured: true })
        .eq('id', recentArticle.id)
    }

    console.log(`✅ News fetch complete: ${insertedCount} new, ${skippedCount} duplicates skipped`)

    return new Response(
      JSON.stringify({
        success: true,
        fetched: allArticles.length,
        inserted: insertedCount,
        skipped: skippedCount
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('❌ News fetch error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
