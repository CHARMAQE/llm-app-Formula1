import { DataAPIClient } from "@datastax/astra-db-ts";
import { PuppeteerWebBaseLoader } from "langchain/document_loaders/web/puppeteer";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import "dotenv/config";

type SimilarityMetric = "dot_product" | "cosine" | "euclidean";

const {
  ASTRA_DB_NAMESPACE,
  ASTRA_DB_COLLECTION,
  ASTRA_DB_API_ENDPOINT,
  ASTRA_DB_APPLICATION_TOKEN,
} = process.env;

// Simple text-to-vector function (basic embedding simulation)
function createSimpleEmbedding(text: string): number[] {
  const words = text.toLowerCase().split(/\s+/);
  const embedding = new Array(384).fill(0);
  
  // Simple hash-based embedding
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    for (let j = 0; j < word.length; j++) {
      const charCode = word.charCodeAt(j);
      const index = (charCode + i * j) % 384;
      embedding[index] += 1 / (word.length + 1);
    }
  }
  
  // Normalize the vector
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return embedding.map(val => magnitude > 0 ? val / magnitude : 0);
}

const f1DATA = [
  "https://www.formula1.com/en/latest",
  "https://en.wikipedia.org/wiki/Formula_One",
  "https://www.formula1.com/en/teams",
  "https://www.formula1.com/en/drivers",
];

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE });

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 300, // Smaller chunks for better matching
  chunkOverlap: 50,
});

// Clean collection and start fresh
const resetCollection = async () => {
  try {
    await db.dropCollection(ASTRA_DB_COLLECTION!);
    console.log("🗑️ Dropped existing collection");
  } catch {
    console.log("ℹ️ Collection didn't exist or couldn't be dropped");
  }

  const res = await db.createCollection(ASTRA_DB_COLLECTION!, {
    vector: {
      dimension: 384,
      metric: "cosine" as SimilarityMetric,
    },
  });
  console.log("✅ Created fresh collection:", res);
};

const loadSampleData = async () => {
  const collection = await db.collection(ASTRA_DB_COLLECTION);

  for (const url of f1DATA) {
    try {
      console.log(`\n🔄 Processing: ${url}`);
      const content = await scrapePage(url);

      if (!content || content.length < 100) {
        console.log(`⚠️ Insufficient content from ${url}, skipping...`);
        continue;
      }

      console.log(`📝 Content length: ${content.length} characters`);
      
      const chunks = await splitter.splitText(content);
      console.log(`📄 Split into ${chunks.length} chunks`);

      let insertedCount = 0;
      for (const chunk of chunks) {
        // Filter out low-quality chunks
        if (
          chunk.length < 50 || 
          chunk.split(' ').length < 8 ||
          /^[\s\d\W]+$/.test(chunk) || // Only numbers and symbols
          chunk.includes('cookie') ||
          chunk.includes('advertisement')
        ) {
          continue;
        }

        try {
          const vector = createSimpleEmbedding(chunk);

          await collection.insertOne({
            $vector: vector,
            text: chunk,
            url: url,
            source: new URL(url).hostname,
          });

          insertedCount++;
          if (insertedCount % 20 === 0) {
            console.log(`   ✅ Inserted ${insertedCount} chunks...`);
          }
        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : String(err);
          console.error("Insert error:", errorMessage);
        }
      }
      
      console.log(`✅ Completed ${url} - inserted ${insertedCount} chunks`);
      
    } catch (error) {
      console.error(`❌ Error processing ${url}:`, error);
    }
  }
  console.log("\n🎉 Data loading completed!");
};

const scrapePage = async (url: string): Promise<string> => {
  console.log(`   🌐 Scraping ${url}...`);
  
  const loader = new PuppeteerWebBaseLoader(url, {
    launchOptions: {
      headless: "new",
      timeout: 60000,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--disable-gpu"
      ]
    },
    gotoOptions: {
      waitUntil: "domcontentloaded",
      timeout: 30000
    },
    evaluate: async (page, browser) => {
      const result = await page.evaluate(() => {
        // Remove unwanted elements
        const unwantedElements = document.querySelectorAll(
          'script, style, nav, header, footer, .cookie, .advertisement, .social-share, .newsletter, .popup, [class*="cookie"], [class*="gdpr"], [class*="consent"]'
        );
        unwantedElements.forEach(el => el.remove());
        
        // Try to get main content
        const contentSelectors = [
          'article',
          '.article-body',
          '.article-content',
          '.news-content',
          '.post-content',
          '.entry-content',
          'main',
          '.content',
          '[role="main"]',
          '.mw-parser-output' // Wikipedia
        ];
        
        let content = '';
        for (const selector of contentSelectors) {
          const element = document.querySelector(selector) as HTMLElement;
          if (element) {
            content = element.innerText || element.textContent || '';
            if (content.length > 200) break; // Use if substantial content
          }
        }
        
        // Fallback to body if no specific content found
        if (content.length < 200) {
          const body = document.body as HTMLElement;
          content = body.innerText || body.textContent || '';
        }
        
        return content;
      });
      
      await browser.close();
      return result;
    }
  });

  try {
    const rawContent = await loader.scrape();
    if (!rawContent) {
      console.log(`   ⚠️ No content retrieved from ${url}`);
      return '';
    }
    
    // Aggressive cleaning for better quality
    let cleanText = rawContent
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/[\r\n\t]+/g, ' ') // Remove line breaks
      .trim();
    
    // Remove common website noise
    const noisePhrases = [
      'Cookie Policy', 'Privacy Policy', 'Terms of Service', 'Subscribe', 
      'Newsletter', 'Follow us', 'Share', 'Like', 'Tweet', 'Facebook', 
      'Instagram', 'Twitter', 'LinkedIn', 'WhatsApp', 'Email', 'Print',
      'Advertisement', 'Sponsored', 'Read more', 'Continue reading',
      'Click here', 'Learn more', 'Sign up', 'Login', 'Register'
    ];
    
    for (const phrase of noisePhrases) {
      cleanText = cleanText.replace(new RegExp(`\\b${phrase}\\b`, 'gi'), '');
    }
    
    // Remove URLs and technical strings
    cleanText = cleanText.replace(/https?:\/\/[^\s]+/g, '');
    cleanText = cleanText.replace(/\b[A-Z0-9]{20,}\b/g, ''); // Remove long uppercase strings
    cleanText = cleanText.replace(/\s{2,}/g, ' '); // Clean up spaces again
    
    console.log(`   📝 Cleaned content: ${cleanText.length} characters`);
    return cleanText;
    
  } catch (error) {
    console.error(`   ❌ Error scraping ${url}:`, error);
    return '';
  }
};

// Run the script
console.log("🏎️ Starting Formula 1 Data Pipeline with Improved Content Extraction\n");
resetCollection().then(() => loadSampleData());
