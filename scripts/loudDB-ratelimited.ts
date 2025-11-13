import { DataAPIClient } from "@datastax/astra-db-ts";
import { PuppeteerWebBaseLoader } from "langchain/document_loaders/web/puppeteer";
import OpenAI from "openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import "dotenv/config";

type SimilarityMetric = "dot_product" | "cosine" | "euclidean";

const {
  ASTRA_DB_NAMESPACE,
  ASTRA_DB_COLLECTION,
  ASTRA_DB_API_ENDPOINT,
  ASTRA_DB_APPLICATION_TOKEN,
  OPENAI_API_KEY,
} = process.env;

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// Rate limiting helper
class RateLimiter {
  private queue: Array<() => Promise<any>> = [];
  private isProcessing = false;
  private requestCount = 0;
  private resetTime = Date.now() + 60000; // Reset every minute

  async addRequest<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.queue.length > 0) {
      // Reset counter if minute has passed
      if (Date.now() > this.resetTime) {
        this.requestCount = 0;
        this.resetTime = Date.now() + 60000;
      }

      // Wait if we've hit the limit
      if (this.requestCount >= 3) { // Conservative limit
        const waitTime = this.resetTime - Date.now();
        console.log(`⏳ Rate limit reached, waiting ${Math.ceil(waitTime/1000)} seconds...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        this.requestCount = 0;
        this.resetTime = Date.now() + 60000;
      }

      const request = this.queue.shift();
      if (request) {
        await request();
        this.requestCount++;
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
      }
    }

    this.isProcessing = false;
  }
}

const rateLimiter = new RateLimiter();

const f1DATA = [
  "https://www.formula1.com/en/latest",
  // Start with just one URL to test
];

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE });

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 200, // Smaller chunks to reduce API calls
  chunkOverlap: 50,
});

const createCollection = async (
  similarityMetric: SimilarityMetric = "cosine"
) => {
  const res = await db.createCollection(ASTRA_DB_COLLECTION, {
    vector: {
      dimension: 1536,
      metric: similarityMetric,
    },
  });
  console.log("Collection created:", res);
};

const loadSampleData = async () => {
  const collection = await db.collection(ASTRA_DB_COLLECTION);

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

      // Process only first 5 chunks to stay within quota
      const limitedChunks = chunks.slice(0, 5);

      for (const chunk of limitedChunks) {
        try {
          const vector = await rateLimiter.addRequest(async () => {
            const embedding = await openai.embeddings.create({
              model: "text-embedding-3-small",
              input: chunk,
            });
            return embedding.data[0].embedding;
          });

          await collection.insertOne({
            $vector: vector,
            text: chunk,
            url: url,
          });

          console.log(`✅ Inserted chunk from ${url}`);
        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : String(err);
          console.error("Embedding error:", errorMessage);
          
          if (errorMessage.includes('quota') || errorMessage.includes('429')) {
            console.log("🛑 Quota exceeded, stopping...");
            return;
          }
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
  });

  try {
    const content = await loader.scrape();
    return content?.replace(/<[^>]*>/gm, '') || '';
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    return '';
  }
};

// Run the script
createCollection().then(() => loadSampleData());
