import clientPromise from "@/lib/mongodb";
import { readFileSync } from "fs";
import path from "path";
import { Parser, Store } from "n3";
import fetch from "node-fetch";

// const HUGGINGFACE_API_URL = "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-mpnet-base-v2";
const HUGGINGFACE_API_URL = "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2";
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;

const TTL_PATH = path.join(process.cwd(), "src", "data", "ontology", "RefinedUnifiedOntology1-35.ttl");
const ttlString = readFileSync(TTL_PATH, "utf8");

function cosineSimilarity(vecA, vecB) {
  const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const normA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const normB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dot / (normA * normB);
}

async function embedText(text) {
  const response = await fetch(HUGGINGFACE_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${HUGGINGFACE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inputs: [text] }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Embedding API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data[0];
}

function getCleanLabel(uri) {
  return uri.includes("#") ? uri.split("#").pop() : uri.split("/").pop();
}

const ONTOLOGY_NAMESPACE = "http://example.org/ontology#";
const CLASS_NAMESPACE = "http://www.w3.org/2002/07/owl#";

function isFromOntology(uri) {
  return uri.startsWith(ONTOLOGY_NAMESPACE);
}

async function extractClassHierarchy(quads) {
  const store = new Store(quads);
  const topClasses = new Set();
  const subClassMap = new Map();

  for (const quad of quads) {
    if (
      quad.predicate.value === "http://www.w3.org/2000/01/rdf-schema#subClassOf" &&
      isFromOntology(quad.subject.value) &&
      isFromOntology(quad.object.value)
    ) {
      const child = quad.subject.value;
      const parent = quad.object.value;
      if (!subClassMap.has(parent)) subClassMap.set(parent, []);
      subClassMap.get(parent).push(child);
    }
  }

  for (const quad of quads) {
    if (
      quad.predicate.value === "http://www.w3.org/1999/02/22-rdf-syntax-ns#type" &&
      quad.object.value === `${CLASS_NAMESPACE}Class` &&
      isFromOntology(quad.subject.value)
    ) {
      const classUri = quad.subject.value;
      const isNotSubclass = !Array.from(subClassMap.values()).flat().includes(classUri);
      if (isNotSubclass) {
        topClasses.add(classUri);
      }
    }
  }

  return { topClasses: Array.from(topClasses), subClassMap };
}

async function findBestClassPath(graphQuads, query, model) {
  const { topClasses, subClassMap } = await extractClassHierarchy(graphQuads);
  const visited = new Set();

  async function traverse(classes) {
    let bestScore = -Infinity;
    let bestClass = null;
    let bestPath = [];

    for (const classUri of classes) {
      if (visited.has(classUri)) continue;
      visited.add(classUri);

      const label = getCleanLabel(classUri);
      const labelEmbedding = await embedText(label);
      const queryEmbedding = await embedText(query);
      const score = cosineSimilarity(queryEmbedding, labelEmbedding);

      if (score > bestScore) {
        bestScore = score;
        bestClass = classUri;
      }
    }

    if (bestClass && subClassMap.has(bestClass)) {
      const { score: subScore, path: subPath } = await traverse(subClassMap.get(bestClass));
      if (subScore > bestScore) {
        return { score: subScore, path: [bestClass, ...subPath] };
      }
    }

    return { score: bestScore, path: [bestClass] };
  }

  return await traverse(topClasses);
}

export async function POST(req) {
  const { queryTerms } = await req.json();
  const terms = (queryTerms || []).map(q => q.trim()).filter(Boolean);

  const client = await clientPromise;
  const db = client.db("cyber_news_db");
  const collection = db.collection("news_list");
  const allNews = await collection.find({}).toArray();

  if (terms.length === 0) {
    return new Response(JSON.stringify({ results: allNews }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const parser = new Parser();
  const quads = parser.parse(ttlString);
  const matchedURIs = new Set();
  const scores = {};

  for (const term of terms) {
    const { score, path } = await findBestClassPath(quads, term, { encode: embedText });
    const matched = path[path.length - 1];
    matchedURIs.add(matched);
    scores[matched] = score;
  }

  const results = [];

  for (const news of allNews) {
    const classMap = news["Classes and Scores"] || {};
    const overlap = Object.keys(classMap).filter(uri => matchedURIs.has(uri));

    if (overlap.length > 0) {
      const total = overlap.reduce(
        (sum, uri) => sum + parseFloat(classMap[uri]?.$numberDouble || classMap[uri]),
        0
      );

      results.push({
        ...news,
        avgScore: total / terms.length,
        overlapCount: overlap.length,
      });
    }
  }

  results.sort((a, b) => b.avgScore - a.avgScore);

  return new Response(JSON.stringify({ results }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
