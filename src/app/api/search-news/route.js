import clientPromise from "@/lib/mongodb";
import { readFileSync } from "fs";
import path from "path";
import { Parser } from "n3";
import { getOntologyClasses } from "../../../lib/ttlUtils";

// Load ontology from TTL file and extract classes with labels
const TTL_PATH = path.join(process.cwd(), "src", "data", "ontology", "RefinedUnifiedOntology1-35.ttl");
const ttlString = readFileSync(TTL_PATH, "utf8");

const extractOntologyLabels = async () => {
  const parser = new Parser();
  const quads = parser.parse(ttlString);
  return getOntologyClasses(quads);
};

function cosineSimilarity(vecA, vecB) {
  const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const normA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const normB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dot / (normA * normB);
}

async function embedText(text) {
  const response = await fetch("http://localhost:11434/api/embeddings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "nomic-embed-text",
      prompt: text,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Embedding API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  if (!data.embedding) {
    throw new Error(`No embedding returned: ${JSON.stringify(data)}`);
  }

  return data.embedding;
}

export async function POST(req) {
  let { queryTerms } = await req.json();
  queryTerms = (queryTerms || []).map(q => q.trim()).filter(Boolean);

  const client = await clientPromise;
  const db = client.db("cyber_news_db");
  const collection = db.collection("news_articles");

  const allNews = await collection.find({}).toArray();

  if (queryTerms.length === 0) {
    return new Response(JSON.stringify({ results: allNews }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const classLabels = await extractOntologyLabels(); // [{ uri, label }]

  const matchedURIs = new Set();
  const cos_scores = {}; // uri -> best score

  for (const query of queryTerms) {
    const queryEmbedding = await embedText(query);
    let bestURI = null;
    let bestScore = -Infinity;

    for (const { uri, label } of classLabels) {
      const labelEmbedding = await embedText(label);
      const score = cosineSimilarity(queryEmbedding, labelEmbedding);
      if (score > bestScore) {
        bestScore = score;
        bestURI = uri;
      }
    }

    if (bestURI) {
      matchedURIs.add(bestURI);
      if (!cos_scores[bestURI] || bestScore > cos_scores[bestURI]) {
        cos_scores[bestURI] = bestScore;
      }
    }
  }

  const matchingNews = [];

  for (const news of allNews) {
    const scoreMap = news["Classes and Scores"] || {};
    const overlappingURIs = Object.keys(scoreMap).filter(uri => matchedURIs.has(uri));

    if (overlappingURIs.length > 0) {
      const totalScore = overlappingURIs.reduce(
        (sum, uri) => sum + parseFloat(scoreMap[uri]?.$numberDouble || scoreMap[uri]),
        0
      );

      const avgScore = totalScore / queryTerms.length;

      matchingNews.push({
        ...news,
        avgScore,
        overlapCount: overlappingURIs.length,
      });
    }
  }

  matchingNews.sort((a, b) => b.avgScore - a.avgScore);

  return new Response(JSON.stringify({ results: matchingNews }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}