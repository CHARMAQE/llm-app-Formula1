import { DataAPIClient } from "@datastax/astra-db-ts";
import { PuppeteerWebBaseLoader } from "langchain/document_loaders/web/puppeteer";
import { HuggingFaceTransformersEmbeddings } from "langchain/embeddings/hf_transformers";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import "dotenv/config";
import puppeteer from "puppeteer"; // ✅ using full puppeteer (not puppeteer-core)

type SimilarityMetric = "dot_product" | "cosine" | "euclidean";

const {
  ASTRA_DB_NAMESPACE,
  ASTRA_DB_COLLECTION,
  ASTRA_DB_API_ENDPOINT,
  ASTRA_DB_APPLICATION_TOKEN,
} = process.env;

// Initialize free Hugging Face embeddings
const embeddings = new HuggingFaceTransformersEmbeddings({
  modelName: "sentence-transformers/all-MiniLM-L6-v2", // Free, fast model
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

// ✅ Step 1: Create collection safely
const createCollection = async (
  similarityMetric: SimilarityMetric = "cosine"
) => {
  const res = await db.createCollection(ASTRA_DB_COLLECTION, {
    vector: {
      dimension: 384, // Hugging Face all-MiniLM-L6-v2 uses 384 dimensions
      metric: similarityMetric,
    },
  });
  console.log("Collection created:", res);
};

// ✅ Step 2: Puppeteer Scraping with Chrome path fix
const scrapePage = async (url: string) => {
  const loader = new PuppeteerWebBaseLoader(url, {
    launchOptions: {
      headless: true, // ✅ use true for stability (no UI)
      executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", // ✅ path for macOS
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      timeout: 60000, // ✅ 60 seconds timeout
    },
    gotoOptions: {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    },
  });

  const docs = await loader.load();
  const content = docs.map((doc) => doc.pageContent).join("\n");
  return content;
};

// ✅ Step 3: Load & embed data
const loadSampleData = async () => {
  const collection = await db.collection(ASTRA_DB_COLLECTION);

  for (const url of f1DATA) {
    console.log("Scraping:", url);
    const content = await scrapePage(url);

    if (!content || content.length === 0) {
      console.log("No content scraped from:", url);
      continue;
    }

    const chunks = await splitter.splitText(content);
    const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

    for (const chunk of chunks) {
      try {
        // Use free Hugging Face embeddings instead of OpenAI
        const vectorArray = await embeddings.embedQuery(chunk);

        await collection.insertOne({
          $vector: vectorArray,
          text: chunk,
          url: url,
        });

        console.log(`✅ Inserted chunk from ${url}`);
        await delay(100); // small delay between API calls
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error("Embedding or insert error:", errorMessage);
      }
    }

    console.log(`✅ Inserted ${chunks.length} chunks from ${url}`);
  }

  console.log("🎉 Seeding complete!");
};

// ✅ Step 4: Run main
const main = async () => {
  await createCollection();
  await loadSampleData();
};

main().catch(console.error);
