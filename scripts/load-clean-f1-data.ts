import { DataAPIClient } from "@datastax/astra-db-ts";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import "dotenv/config";

const {
  ASTRA_DB_NAMESPACE,
  ASTRA_DB_COLLECTION,
  ASTRA_DB_API_ENDPOINT,
  ASTRA_DB_APPLICATION_TOKEN,
} = process.env;

// Simple embedding function
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

// Manual F1 content for better results
const f1Content = [
  {
    title: "Formula 1 Teams 2024 Season",
    text: "The current Formula 1 grid features 10 teams competing in the 2024 season. Red Bull Racing leads with Max Verstappen and Sergio Perez. Mercedes-AMG has Lewis Hamilton and George Russell. Ferrari fields Charles Leclerc and Carlos Sainz. McLaren runs Lando Norris and Oscar Piastri. Aston Martin has Fernando Alonso and Lance Stroll. Alpine features Esteban Ocon and Pierre Gasly. Williams has Alex Albon and Logan Sargeant. AlphaTauri runs Yuki Tsunoda and Daniel Ricciardo. Alfa Romeo has Valtteri Bottas and Zhou Guanyu. Haas fields Kevin Magnussen and Nico Hulkenberg.",
    category: "teams"
  },
  {
    title: "F1 Championship System",
    text: "Formula 1 uses a points-based championship system. The race winner receives 25 points, second place gets 18 points, third gets 15 points, fourth gets 12 points, fifth gets 10 points, sixth gets 8 points, seventh gets 6 points, eighth gets 4 points, ninth gets 2 points, and tenth gets 1 point. There's also a point for the fastest lap if the driver finishes in the top 10. Both a Drivers Championship and Constructors Championship are awarded annually.",
    category: "rules"
  },
  {
    title: "Recent F1 Developments",
    text: "The 2024 Formula 1 season has seen intense competition with Red Bull Racing continuing their dominance. Max Verstappen has been performing exceptionally well, fighting for another championship title. Mercedes and Ferrari are working hard to close the gap, while McLaren has shown impressive progress. The sport continues to grow globally with new fans and exciting race weekends around the world.",
    category: "news"
  },
  {
    title: "F1 Technical Regulations",
    text: "Formula 1 cars must comply with strict technical regulations. The cars use 1.6-liter turbocharged V6 hybrid engines with energy recovery systems. Aerodynamic components are heavily regulated including front and rear wings, floor design, and diffusers. Cars must weigh at least 798kg including the driver. Safety features include the halo cockpit protection system, impact-absorbing barriers, and fire suppression systems.",
    category: "technical"
  },
  {
    title: "F1 Race Weekend Format",
    text: "A typical Formula 1 race weekend consists of practice sessions, qualifying, and the race. Friday features two practice sessions for setup work. Saturday includes final practice and qualifying which determines starting positions. Sunday hosts the main race, typically lasting around 90 minutes or 300 kilometers. Some weekends also feature sprint qualifying and sprint races for additional points and excitement.",
    category: "format"
  }
];

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE });

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 300,
  chunkOverlap: 50,
});

async function loadCleanF1Data() {
  console.log("🏎️ Loading clean Formula 1 content...");
  
  try {
    const collection = await db.collection(ASTRA_DB_COLLECTION);
    
    for (const content of f1Content) {
      console.log(`📄 Processing: ${content.title}`);
      
      const chunks = await splitter.splitText(content.text);
      
      for (const chunk of chunks) {
        if (chunk.trim().length < 50) continue;
        
        const vector = createSimpleEmbedding(chunk);
        
        await collection.insertOne({
          $vector: vector,
          text: chunk,
          title: content.title,
          category: content.category,
          source: "manual_content"
        });
        
        console.log(`✅ Inserted: ${chunk.slice(0, 50)}...`);
      }
    }
    
    console.log("🎉 Clean F1 data loaded successfully!");
    
  } catch (error) {
    console.error("❌ Error loading data:", error);
  }
}

// Run the script
if (require.main === module) {
  loadCleanF1Data();
}

export { loadCleanF1Data };
