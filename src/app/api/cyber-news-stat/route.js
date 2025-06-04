"use server"

import clientPromise from "@/lib/mongodb";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);

function formatLabel(label = "") {
    const exceptions = { cve: "CVE", ddos: "DDoS", dos: "DoS" };
    const lower = label.toLowerCase();

    if (exceptions[lower]) return exceptions[lower];
    if (lower.startsWith("cve")) return "CVE";
    if (lower.includes("phishing")) return "Phishing";
    if (lower.includes("malware") || lower.includes("ransomware")) return "Malware";
    if (lower.includes("unauthorized access")) return "Unauthorized Access";
    if (lower.includes("data breach") || lower.includes("data stolen")) return "Data Breach";
    if (lower.includes("rce") || lower.includes("remote code execution")) return "Remote Code Execution";
    if (lower.includes("xss") || lower.includes("cross-site scripting")) return "Cross-site Scripting";
    if (lower.includes("vulnerability")) return "System Vulnerability";
    if (lower.includes("injection")) return "Injection";

    return null;
}

function normalizeCountry(label = "") {
    const lower = label.toLowerCase().trim();
    const fuzzyAliases = {
        "United States": ["us", "usa", "u.s.", "united states", "united states of america", "america"],
        "United Kingdom": ["uk", "u.k.", "england", "gb", "great britain", "scotland", "wales", "northern ireland"]
    };

    for (const [country, aliases] of Object.entries(fuzzyAliases)) {
        if (aliases.includes(lower)) return country;
    }

    return label
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
}

const sectorMap = {
    "Energy": ["energy", "oil", "gas", "power"],
    "Military": ["military", "defense", "army"],
    "Financial": ["financial", "bank", "insurance", "investment"],
    "Government": ["government", "ministry", "municipal"],
    "Healthcare": ["health", "hospital", "clinic", "pharma"],
    "Retail": ["retail", "shop", "store"],
    "Education": ["education", "school", "university", "college"],
    "Technology": ["tech", "software", "hardware", "it"],
    "Media": ["media", "news", "broadcast", "tv"],
    "Telecommunication": ["telecom", "telecommunication", "mobile", "network"],
    "Industrial Manufacturing": ["industrial", "manufacturing", "factory", "plant"],
    "Transportation": ["transport", "logistics", "shipping", "rail", "airline"]
};

const attackMap = {
    "Phishing": ["phishing"],
    "Malware": ["malware", "ransomware", "trojan", "spyware", "virus"],
    "Data Breach": ["data breach", "data stolen", "leak", "stealer"],
    "Unauthorized Access": ["unauthorized access", "access violation", "bruteforce"],
    "Remote Code Execution": ["rce", "remote code execution"],
    "Cross-site Scripting": ["xss", "cross-site scripting"],
    "System Vulnerability": ["vulnerability", "exploit"],
    "Injection": ["injection", "sql injection", "command injection"],
    "DDoS": ["ddos", "denial of service", "dos"],
    "CVE": ["cve"]
};

function fuzzyMatchSector(rawLabel) {
    const lowerLabel = rawLabel.toLowerCase();
    for (const [sector, keywords] of Object.entries(sectorMap)) {
        if (keywords.some(kw => lowerLabel.includes(kw))) {
            return sector;
        }
    }
    return null;
}

function fuzzyMatchAttack(rawLabel) {
    const lowerLabel = rawLabel.toLowerCase();
    for (const [attack, keywords] of Object.entries(attackMap)) {
        if (keywords.some(kw => lowerLabel.includes(kw))) {
            return attack;
        }
    }
    return null;
}

export async function GET() {
    const client = await clientPromise;
    const db = client.db("cyber_news_db");
    const collection = db.collection("cyber_news_mapped");

    const fields = ["companies", "countries", "attack_techniques", "attackers", "sectors"];
    const result = {};

    for (const field of fields) {
        const raw = await collection.aggregate([
            {
                $match: {
                    [`keywords.${field}`]: { $exists: true, $ne: null, $not: { $size: 0 } },
                },
            },
            {
                $project: {
                    value: {
                        $map: {
                            input: `$keywords.${field}`,
                            as: "item",
                            in: { $toLower: "$$item" },
                        },
                    },
                },
            },
            { $unwind: "$value" },
            { $group: { _id: "$value", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]).toArray();

        const grouped = {};
        for (const { _id, count } of raw) {
            let label = null;
            if (field === "countries") label = normalizeCountry(_id);
            else if (field === "sectors") label = fuzzyMatchSector(_id);
            else if (field === "attack_techniques") label = fuzzyMatchAttack(_id);
            else if (field === "attackers") label = _id;
            else label = formatLabel(_id);

            if (label && !["attacker", "attackers", "threat actors", "ransomware operators", "ai"].includes(label.toLowerCase())) {
                grouped[label] = (grouped[label] || 0) + count;
            }
        }

        let items = Object.entries(grouped).map(([label, count]) => ({ _id: label, count }));
        items = items.sort((a, b) => b.count - a.count);

        result[field] = items;
    }

    const attackTechniques = result.attack_techniques || [];
    result.top5AttackTechniques = attackTechniques.slice(0, 5);

    const attackerList = result.attackers || [];
    result.top5Attackers = attackerList.slice(0, 5);

    result.mostUsedAttackType = attackTechniques.length > 0 ? {
        label: attackTechniques[0]._id,
        count: attackTechniques[0].count,
    } : { label: "N/A", count: 0 };

    result.mostTargetedSector = result.sectors?.[0] ? {
        label: result.sectors[0]._id,
        count: result.sectors[0].count,
    } : { label: "N/A", count: 0 };

    result.newsCount = await collection.countDocuments();

    const aggregateMonthlyCounts = async () => {
        const docs = await collection.find({}, { projection: { "Publish Date": 1 } }).toArray();
        const monthCounts = {};

        for (const doc of docs) {
            const rawDate = doc["Publish Date"];
            if (!rawDate) continue;

            const parsed = dayjs(rawDate, [
                "ddd, D MMM YYYY HH:mm:ss Z", "ddd, DD MMM YYYY HH:mm:ss Z",
                "YYYY-MM-DD", "MMM D, YYYY", "D MMM YYYY", dayjs.ISO_8601
            ]);

            if (!parsed.isValid() || parsed.isAfter(dayjs())) continue;

            const label = parsed.format("YYYY-MM");
            monthCounts[label] = (monthCounts[label] || 0) + 1;
        }

        const sortedMonths = Object.keys(monthCounts).filter(m => dayjs(m, "YYYY-MM").isValid()).sort((a, b) => dayjs(a).isAfter(dayjs(b)) ? 1 : -1);
        const latestMonth = sortedMonths[sortedMonths.length - 1];
        const startMonth = dayjs(latestMonth).subtract(11, "month");

        const result = [];
        for (let i = 0; i < 12; i++) {
            const month = startMonth.add(i, "month").format("YYYY-MM");
            result.push({ label: month, value: monthCounts[month] || 0 });
        }

        return result;
    };

    result.monthlyCounts = await aggregateMonthlyCounts();

    try {
        return new Response(JSON.stringify(result), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: "Failed to serialize response" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
