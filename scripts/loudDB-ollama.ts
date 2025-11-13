import { DataAPIClient } from "@datastax/astra-db-ts";
import { PuppeteerWebBaseLoader } from "langchain/document_loaders/web/puppeteer";
import { OllamaEmbeddings } from "langchain/embeddings/ollama";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import "dotenv/config";

type SimilarityMetric = "dot_product" | "cosine" | "euclidean";

const {
  ASTRA_DB_NAMESPACE,
  ASTRA_DB_COLLECTION,
  ASTRA_DB_API_ENDPOINT,
  ASTRA_DB_APPLICATION_TOKEN,
} = process.env;

// Use Ollama for local embeddings (completely free!)
const embeddings = new OllamaEmbeddings({
  model: "nomic-embed-text", // Free embedding model
  baseUrl: "http://localhost:11434", // Default Ollama URL
});

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
  const res = await db.createCollection(ASTRA_DB_COLLECTION, {
    vector: {
      dimension: 768, // nomic-embed-text uses 768 dimensions
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

      for (const chunk of chunks) {
        try {
          // Use free Ollama embeddings (runs locally!)
          const vector = await embeddings.embedQuery(chunk);

          await collection.insertOne({
            $vector: vector,
            text: chunk,
            url: url,
          });

          console.log(`✅ Inserted chunk from ${url}`);
        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : String(err);
          console.error("Embedding error:", errorMessage);
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

// Instructions to setup Ollama:
console.log(`
🔧 To use Ollama embeddings:
1. Install Ollama: https://ollama.ai
2. Run: ollama pull nomic-embed-text
3. Start Ollama service
4. Run this script!
`);
