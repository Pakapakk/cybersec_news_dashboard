"use server";

import clientPromise from "@/lib/mongodb";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(customParseFormat);
dayjs.extend(isBetween);

const exceptions = { cve: "CVE", ddos: "DDoS", dos: "DoS" };

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
  // CVE: ["cve"],
  "Zero-day": ["zero day", "zero-day", "zeroday"],
};

const sectorMap = {
  Energy: ["energy", "oil", "gas", "power"],
  Military: ["military", "defense", "army"],
  Financial: ["financial", "bank", "insurance", "investment"],
  Government: ["government", "ministry", "municipal"],
  Healthcare: ["health", "hospital", "clinic", "pharma"],
  Retail: ["retail", "shop", "store"],
  Education: ["education", "school", "university", "college"],
  Technology: ["tech", "software", "hardware", "it"],
  Media: ["media", "news", "broadcast", "tv"],
  Telecommunication: ["telecom", "telecommunication", "mobile", "network"],
  "Industrial Manufacturing": ["industrial", "manufacturing", "factory", "plant"],
  Transportation: ["transport", "logistics", "shipping", "rail", "airline"],
};

function formatLabel(s) {
  const l = s.toLowerCase();
  if (exceptions[l]) return exceptions[l];
  return Object.keys(attackMap).find(k =>
    attackMap[k].some(w => l.includes(w))
  ) || null;
}

function fuzzySector(s) {
  const l = s.toLowerCase();
  return Object.keys(sectorMap).find(label =>
    sectorMap[label].some(w => l.includes(w))
  ) || null;
}

function fuzzyCountry(s) {
  const l = s.trim().toLowerCase();
  if (["us","usa","u.s.","united states","america"].includes(l)) return "United States";
  if (["uk","u.k.","great britain","england","gb"].includes(l)) return "United Kingdom";
  return s
    .split(" ")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export async function GET(request) {
  const client = await clientPromise;
  const col = client.db("cyber_news_db").collection("cyber_news_mapped");
  const url = new URL(request.url);
  const startParam = url.searchParams.get("start"); // MM-YYYY
  const endParam = url.searchParams.get("end");     // MM-YYYY

  const endMonth = endParam
    ? dayjs(endParam, "MM-YYYY").endOf("month")
    : dayjs().endOf("month");
  const startMonth = startParam
    ? dayjs(startParam, "MM-YYYY").startOf("month")
    : endMonth.subtract(11, "month").startOf("month");

  const all = await col.find({}, {
    projection: {
      _id: 1,
      "News Title": 1,
      URL: 1,
      "Publish Date": 1,
      keywords: 1
    }
  }).toArray();

  const maps = {
    attack: {},
    sector: {},
    country: {},
    attacker: {},
    company: {}
  };

  const pushUnique = (mapObj, key, item) => {
    const arr = (mapObj[key] = mapObj[key] || []);
    if (!arr.some(x => x._id === item._id)) arr.push(item);
  };

  const monthsCount = {};
  for (const doc of all) {
    const p = dayjs(doc["Publish Date"], [
      "ddd, D MMM YYYY HH:mm:ss Z",
      "MM-YYYY-DD",
      dayjs.ISO_8601
    ]);
    if (!p.isValid() || !p.isBetween(startMonth, endMonth, "month", "[]")) {
      continue;
    }

    const key = p.format("MM-YYYY");
    monthsCount[key] = (monthsCount[key] || 0) + 1;

    const item = {
      _id: doc._id.toString(),
      title: doc["News Title"],
      date: doc["Publish Date"],
      URL: doc.URL
    };

    const uniq = field =>
      Array.from(new Set((doc.keywords?.[field] || []).map(v => v.toLowerCase())));

    uniq("attack_techniques").map(formatLabel).filter(Boolean)
      .forEach(lbl => pushUnique(maps.attack, lbl, item));
    uniq("sectors").map(fuzzySector).filter(Boolean)
      .forEach(lbl => pushUnique(maps.sector, lbl, item));
    uniq("countries").map(fuzzyCountry).filter(Boolean)
      .forEach(lbl => pushUnique(maps.country, lbl, item));
    uniq("attackers")
      .filter(s => !["threat actors", "attackers", "attacker"].includes(s))
      .map(s => s.toUpperCase())
      .forEach(lbl => pushUnique(maps.attacker, lbl, item));

    uniq("companies").forEach(lbl => pushUnique(maps.company, lbl, item));
  }

  const makeCounts = mapObj =>
    Object.entries(mapObj).map(([label, arr]) => ({ _id: label, count: arr.length }))
      .sort((a, b) => b.count - a.count);

  const monthlyCounts = Object.entries(monthsCount).reduce(
    (acc, [label, value]) => ({ ...acc, [label]: value }),
    {}
  );

  const wrapMap = rawMap => {
    const result = {};
    for (const [label, arr] of Object.entries(rawMap)) {
      result[label] = {
        count: arr.length,
        articles: arr
      };
    }
    return result;
  };

  return new Response(
    JSON.stringify({
      newsCount: Object.values(monthsCount).reduce((a, b) => a + b, 0),
      attack_techniques: makeCounts(maps.attack),
      sectors: makeCounts(maps.sector),
      countries: makeCounts(maps.country),
      attackers: makeCounts(maps.attacker),
      companies: makeCounts(maps.company),
      top5AttackTechniques: makeCounts(maps.attack).slice(0, 5),
      top5Attackers: makeCounts(maps.attacker).slice(0, 5),
      mostUsedAttackType: makeCounts(maps.attack).slice(0, 1),
      mostTargetedSector: makeCounts(maps.sector).slice(0, 1),
      monthlyCounts: Object.entries(monthsCount)
        .map(([label, value]) => ({ label, value })),
      attackNewsMap: wrapMap(maps.attack),
      sectorNewsMap: wrapMap(maps.sector),
      countryNewsMap: wrapMap(maps.country),
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" }
    }
  );
}