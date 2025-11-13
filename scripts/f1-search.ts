import { DataAPIClient } from "@datastax/astra-db-ts";
import "dotenv/config";

const {
  ASTRA_DB_NAMESPACE,
  ASTRA_DB_COLLECTION,
  ASTRA_DB_API_ENDPOINT,
  ASTRA_DB_APPLICATION_TOKEN,
} = process.env;

// Simple embedding function (same as in loudDB-free.ts)
function createSimpleEmbedding(text: string): number[] {
  const words = text.toLowerCase().split(/\s+/);
  const embedding = new Array(384).fill(0);
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    for (let j = 0; j < word.length; j++) {
      const charCode = word.charCodeAt(j);
      const index = (charCode + i * j) % 384;
      embedding[index] += 1 / (word.length + 1);
    }
  }
  
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return embedding.map(val => magnitude > 0 ? val / magnitude : 0);
}

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE });

async function searchF1Data(query: string, limit: number = 5) {
  const collection = await db.collection(ASTRA_DB_COLLECTION);
  
  // Create embedding for the query
  const queryVector = createSimpleEmbedding(query);
  
  // Search for similar content
  const cursor = collection.find(
    {},
    {
      vector: queryVector,
      limit: limit,
    }
  );
  
  // Convert cursor to array
  const results = await cursor.toArray();
  return results;
}

// Test function
async function askF1Question(question: string) {
  console.log(`\n🏎️  Question: ${question}`);
  console.log("=" .repeat(50));
  
  try {
    const results = await searchF1Data(question, 3);
    
    if (results.length === 0) {
      console.log("No relevant information found.");
      return;
    }
    
    console.log(`📊 Found ${results.length} relevant chunks:\n`);
    
    results.forEach((result, index) => {
      console.log(`${index + 1}. ${result.text.slice(0, 200)}...`);
      console.log(`   Source: ${result.url}`);
      console.log(`   Similarity Score: ${result.$similarity?.toFixed(4) || 'N/A'}\n`);
    });
    
  } catch (error) {
    console.error("Error searching:", error);
  }
}

// Example usage
async function main() {
  console.log("🏎️  F1 Knowledge Base Ready!");
  console.log("Ask questions about Formula 1...\n");
  
  // Test with some sample questions
  await askF1Question("What are the latest Formula 1 news?");
  await askF1Question("Who are the current F1 drivers?");
  await askF1Question("What are the F1 rules and regulations?");
}

// Run if this file is executed directly
if (require.main === module) {
  main();
}

export { searchF1Data, askF1Question };
