import clientPromise from "@/lib/mongodb";
import { readFileSync } from "fs";
import path from "path";
import { Parser, Store } from "n3";
import fetch from "node-fetch";

// const HUGGINGFACE_API_URL = "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-mpnet-base-v2";
const HUGGINGFACE_API_URL = "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2";
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;

const TTL_PATH = path.join(process.cwd(), "src", "data", "ontology", "RefinedUnifiedOntology1-35.ttl");
const ttlString = readFileSync(TTL_PATH, "utf8");

function cosineSimilarity(vecA, vecB) {
  if (!Array.isArray(vecA) || !Array.isArray(vecB)) return 0;
  const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const normA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const normB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  if (normA === 0 || normB === 0) return 0;
  return dot / (normA * normB);
}


async function embedText(text) {
  const response = await fetch(HUGGINGFACE_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inputs: text }),
  });

  // if (!response.ok) return null;

  const data = await response.json();
  if (!Array.isArray(data) || !Array.isArray(data[0])) return null;

  return data[0];
}


// function averageVectors(vectors) {
//   if (!Array.isArray(vectors) || vectors.length === 0 || !vectors[0] || !Array.isArray(vectors[0])) {
//     return [];
//   }

//   const length = vectors[0].length;
//   const sum = new Array(length).fill(0);

//   for (const vec of vectors) {
//     for (let i = 0; i < length; i++) {
//       sum[i] += vec[i];
//     }
//   }

//   return sum.map((val) => val / vectors.length);
// }


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

export async function POST(req) {
  const { queryTerms } = await req.json();
  console.log(queryTerms);
  const terms = (queryTerms || []).map((q) => q.trim()).filter(Boolean);

  const client = await clientPromise;
  const db = client.db("cyber_news_db");
  const collection = db.collection("cyber_news_list");
  const allNews = await collection.find({}).toArray();

  if (terms.length === 0) {
    return new Response(JSON.stringify({ results: allNews }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const parser = new Parser();
  const quads = parser.parse(ttlString);
  const { topClasses, subClassMap } = await extractClassHierarchy(quads);

  const matchedURIs = new Set();
  for (const term of terms) {
    const termEmbedding = await embedText(term);
    if (!termEmbedding) continue;

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
        if (!labelEmbedding) continue;

        const score = cosineSimilarity(termEmbedding, labelEmbedding);

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

    const { path } = await traverse(topClasses);
    const matched = path?.[path.length - 1];
    if (matched) matchedURIs.add(matched);
  }

  const results = [];
  for (const news of allNews) {
    const classMap = news["Classes and Scores"] || {};
    const classURIs = Object.keys(classMap);

    const matchesAll = Array.from(matchedURIs).every(uri => classURIs.includes(uri));
    if (matchesAll) {
      const total = Array.from(matchedURIs).reduce(
        (sum, uri) => sum + parseFloat(classMap[uri]?.$numberDouble || classMap[uri]),
        0
      );

      results.push({
        ...news,
        avgScore: total / matchedURIs.size,
        overlapCount: matchedURIs.size,
      });
    }
  }

  results.sort((a, b) => b.avgScore - a.avgScore);

  return new Response(JSON.stringify({ results }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
