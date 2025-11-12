import { DataAPIClient } from "@Datastax/astra-db-ts";

// Document loader
import { PuppeteerWebBaseLoader } from "langchain/document_loaders/web/puppeteer";

import OpenAI from "openai";

import "dotenv/config";

// Text splitter
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"; // or "langchain/text_splitter" in older versions

