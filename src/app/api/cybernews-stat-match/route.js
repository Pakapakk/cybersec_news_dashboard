"use server";

import clientPromise from "@/lib/mongodb";

// Same logic as in your main stats endpoint
function formatLabel(label = "") {
  const exceptions = { cve: "CVE", ddos: "DDoS", dos: "DoS" };
  const lower = label.toLowerCase();
  if (exceptions[lower]) return exceptions[lower];
  if (lower.startsWith("cve")) return "CVE";
  if (lower.includes("phishing")) return "Phishing";
  if (lower.includes("malware") || lower.includes("ransomware")) return "Malware";
  if (lower.includes("unauthorized access")) return "Unauthorized Access";
  if (lower.includes("data breach") || lower.includes("data stolen")) return "Data Breach";
  if (lower.includes("rce")) return "Remote Code Execution";
  if (lower.includes("xss")) return "Cross-site Scripting";
  if (lower.includes("vulnerability")) return "System Vulnerability";
  if (lower.includes("injection")) return "Injection";
  return null;
}

// Fuzzy-match logic
const attackMap = {
  Phishing: ["phishing"],
  Malware: ["malware", "ransomware", "trojan", "spyware", "virus"],
  "Data Breach": ["data breach", "data stolen", "leak", "stealer"],
  "Unauthorized Access": ["unauthorized access", "access violation", "bruteforce"],
  "Remote Code Execution": ["rce", "remote code execution"],
  "Cross-site Scripting": ["xss", "cross-site scripting"],
  "System Vulnerability": ["vulnerability", "exploit"],
  Injection: ["injection", "sql injection", "command injection"],
  DDoS: ["ddos", "denial of service", "dos"],
  CVE: ["cve"],
};

export async function GET(request) {
  const url = new URL(request.url);
  const rawTerm = url.searchParams.get("term");
  if (!rawTerm) {
    return new Response(JSON.stringify({ error: "Missing term" }), { status: 400 });
  }

  const term = formatLabel(rawTerm);
  if (!term || !(term in attackMap)) {
    return new Response(JSON.stringify({ error: "Invalid term" }), { status: 400 });
  }

  const keywordsToMatch = attackMap[term];
  const client = await clientPromise;
  const collection = client.db("cyber_news_db").collection("cyber_news_mapped");

  // Query using regex $in to match any of the terms
  const items = await collection
    .find(
      {
        "keywords.attack_techniques": {
          $in: keywordsToMatch.map(k => new RegExp(k, "i")),
        }
      },
      {
        projection: {
          _id: 1,
          "News Title": 1,
          "Publish Date": 1,
          URL: 1,
          "keywords": 1,
        }
      }
    )
    .sort({ "Publish Date": -1 })
    .limit(100)
    .toArray();

  return new Response(JSON.stringify({ items }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
