import { DataAPIClient } from "@Datastax/astra-db-ts";

// Document loader
import { PuppeteerWebBaseLoader } from "langchain/document_loaders/web/puppeteer";

import OpenAI from "openai";

// Text splitter
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"; // or "langchain/text_splitter" in older versions


import "dotenv/config";


type SimilarityMetric = "dot_product" | "cosine" | "euclidean"

const {
    ASTRA_DB_NAMESPACE,
    ASTRA_DB_COLLECTION,
    ASTRA_DB_API_ENDPOINT,
    ASTRA_DB_APPLICATION_TOKEN,
    OPENAI_API_KEY
} = process.env;

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

const f1DATA =[
    "https://en.wikipedia.org/wiki/Formula_One",
    "https://www.formula1.com/en/latest",
    "https://www.formula1.com/en/racing/2023.html",
    "https://www.formula1.com/en/teams.html",
    "https://www.formula1.com/en/drivers.html",
    "https://www.formula1.com/en/championship.html",
    "https://www.formula1.com/en/inside-f1/understanding-f1-racing/rules-regulations.html",
    "https://www.formula1.com/en/inside-f1/understanding-f1-racing/technical-regulations.html",
    "https://www.formula1.com/en/inside-f1/understanding-f1-racing/strategy.html"

]

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN)
const db = client.db(ASTRA_DB_API_ENDPOINT, {namespace : ASTRA_DB_NAMESPACE});

const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 512,
    chunkOverlap:100,
});

const createCollection = async (similarityMetric : SimilarityMetric = "dot_product") => {
    const res = await db.createCollection(ASTRA_DB_COLLECTION, { 
        vector : {
            dimensions: 1536,
            metric: similarityMetric
        }
     });
     console.log("Collection created:", res);
}

const loadSampleData = async () => {
    const collection = await db.collection(ASTRA_DB_COLLECTION);
    for await (const url of f1DATA) {
        const content = await scrapePage(url);
        const chunks = await splitter.splitText(content);
        for await (const chunk of chunks) {
            const embedding = await openai.embeddings.create({
                model: "text-embedding-3-small",
                input: chunk,
                encoding_format: "float"
            })
            const vector = embedding.data[0].embedding;
            const res = await collection.insertOne({
                $vector: vector,
                url: url,
                text: chunk
            })
            console.log("Inserted chunk from", url, "with id", res)
        }
    } 
}

const scrapePage = async (url: string) => {
    const loader = new PuppeteerWebBaseLoader(url,{
        launchOptions: {
            headless: true
        },
        gotoOptions: {
            waitUntil: "domcontentloaded",
        },
        evaluate: async ({ page, browser }) => {
            const result = await page.evaluate(()=> document.body.innerHTML);
            await browser.close();
            return result;
        }
    })
    return ( await loader.scrape())?.replace(/<[^]*>?/gm, '' )
}

createCollection().then(() => loadSampleData())