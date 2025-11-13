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
  "https://www.formula1.com/en/racing/2023.html",
];

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE });

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 512,
  chunkOverlap: 100,
});

const createCollection = async (
  similarityMetric: SimilarityMetric = "cosine"
) => {
  try {
    const res = await db.createCollection(ASTRA_DB_COLLECTION, {
      vector: {
        dimension: 384,
        metric: similarityMetric,
      },
    });
    console.log("Collection created:", res);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('already exists')) {
      console.log("✅ Collection already exists, continuing...");
    } else {
      throw error;
    }
  }
};

const loadSampleData = async () => {
  const collection = await db.collection(ASTRA_DB_COLLECTION);
  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

  for (const url of f1DATA) {
    try {
      console.log(`🔄 Processing: ${url}`);
      const content = await scrapePage(url);

      if (!content || content.length === 0) {
        console.log("No content scraped from:", url);
        continue;
      }

      const chunks = await splitter.splitText(content);
      console.log(`📄 Split into ${chunks.length} chunks`);

      for (const chunk of chunks) {
        try {
          // Use simple local embedding (no API calls!)
          const vector = createSimpleEmbedding(chunk);

          await collection.insertOne({
            $vector: vector,
            text: chunk,
            url: url,
          });

          console.log(`✅ Inserted chunk from ${url}`);
          await delay(100); // small delay
        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : String(err);
          console.error("Insert error:", errorMessage);
        }
      }
    } catch (error) {
      console.error(`❌ Error processing ${url}:`, error);
    }
  }
  console.log("🎉 Data loading completed!");
};

const scrapePage = async (url: string): Promise<string> => {
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
        // Remove script and style elements
        const scripts = document.querySelectorAll('script, style, nav, header, footer, .cookie, .advertisement');
        scripts.forEach(el => el.remove());
        
        // Get main content areas
        const contentSelectors = [
          'article',
          '.article-content',
          '.news-content',
          'main',
          '.content',
          '.post-content',
          '.entry-content',
          '[role="main"]'
        ];
        
        let content = '';
        for (const selector of contentSelectors) {
          const element = document.querySelector(selector) as HTMLElement;
          if (element) {
            content = element.innerText || element.textContent || '';
            break;
          }
        }
        
        // Fallback to body if no specific content found
        if (!content) {
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
    const content = await loader.scrape();
    if (!content) return '';
    
    // Additional text cleaning
    let cleanText = content
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/[\r\n\t]+/g, ' ') // Remove line breaks and tabs
      .replace(/\s{2,}/g, ' ') // Remove multiple spaces
      .trim();
    
    // Remove common website elements
    cleanText = cleanText.replace(/\b(Cookie Policy|Privacy Policy|Terms of Service|Subscribe|Newsletter|Follow us|Share|Like|Tweet)\b/gi, '');
    cleanText = cleanText.replace(/\b\d{4}[-\/]\d{2}[-\/]\d{2}\b/g, ''); // Remove dates in technical format
    
    return cleanText;
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    return '';
  }
};

// Run the script
createCollection().then(() => loadSampleData());
