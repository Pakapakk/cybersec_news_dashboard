"use server";

import clientPromise from "@/lib/mongodb";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);

const exceptions = { cve: "CVE", ddos: "DDoS", dos: "DoS" };

const attackMap = {
    Phishing: ["phishing"],
    Malware: ["malware", "ransomware", "trojan", "spyware", "virus"],
    "Data Breach": ["data breach", "data stolen", "leak", "stealer"],
    "Unauthorized Access": [
        "unauthorized access",
        "access violation",
        "bruteforce",
    ],
    "Remote Code Execution": ["rce", "remote code execution"],
    "Cross-site Scripting": ["xss", "cross-site scripting"],
    "System Vulnerability": ["vulnerability", "exploit"],
    Injection: ["injection", "sql injection", "command injection"],
    DDoS: ["ddos", "denial of service", "dos"],
    CVE: ["cve"],
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
    "Industrial Manufacturing": [
        "industrial",
        "manufacturing",
        "factory",
        "plant",
    ],
    Transportation: ["transport", "logistics", "shipping", "rail", "airline"],
};

function formatLabel(s) {
    const l = s.toLowerCase();
    if (exceptions[l]) return exceptions[l];
    return (
        Object.keys(attackMap).find((k) =>
            attackMap[k].some((w) => l.includes(w))
        ) || null
    );
}

function fuzzySector(s) {
    const l = s.toLowerCase();
    return (
        Object.keys(sectorMap).find((label) =>
            sectorMap[label].some((w) => l.includes(w))
        ) || null
    );
}

function fuzzyCountry(s) {
    const l = s.trim().toLowerCase();
    if (["us", "usa", "u.s.", "united states", "america"].includes(l))
        return "United States";
    if (["uk", "u.k.", "great britain", "england", "gb"].includes(l))
        return "United Kingdom";
    return s
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");
}

export async function GET() {
    const client = await clientPromise;
    const col = client.db("cyber_news_db").collection("cyber_news_mapped");

    const all = await col
        .find(
            {},
            {
                projection: {
                    _id: 1,
                    "News Title": 1,
                    "Publish Date": 1,
                    keywords: 1,
                },
            }
        )
        .toArray();

    const maps = {
        attack: {},
        sector: {},
        country: {},
        attacker: {},
        company: {},
    };
    const pushUnique = (map, key, item) => {
        const arr = map[key] || (map[key] = []);
        if (!arr.some((x) => x._id === item._id)) arr.push(item);
    };

    all.forEach((doc) => {
        const item = {
            _id: doc._id.toString(),
            title: doc["News Title"],
            date: doc["Publish Date"],
        };
        const uniq = (field) =>
            Array.from(
                new Set(
                    (doc.keywords?.[field] || []).map((v) => v.toLowerCase())
                )
            );

        uniq("attack_techniques")
            .map(formatLabel)
            .filter(Boolean)
            .forEach((l) => pushUnique(maps.attack, l, item));
        uniq("sectors")
            .map(fuzzySector)
            .filter(Boolean)
            .forEach((l) => pushUnique(maps.sector, l, item));
        uniq("countries")
            .map(fuzzyCountry)
            .filter(Boolean)
            .forEach((l) => pushUnique(maps.country, l, item));
        uniq("attackers")
            .map(s => s.trim().toLowerCase())
            .filter(s => !["threat actors", "attackers", "attacker"].includes(s))
            .forEach(lbl => pushUnique(maps.attacker, lbl, item));
        uniq("companies").forEach((l) => pushUnique(maps.company, l, item));
    });

    function makeCounts(map) {
        return Object.entries(map)
            .map(([label, arr]) => ({ _id: label, count: arr.length }))
            .sort((a, b) => b.count - a.count);
    }

    const attack_techniques = makeCounts(maps.attack);
    const sectors = makeCounts(maps.sector);
    const countries = makeCounts(maps.country);
    const attackers = makeCounts(maps.attacker);
    const companies = makeCounts(maps.company);

    const newsCount = all.length;

    const months = {};
    all.forEach((d) => {
        const p = dayjs(d["Publish Date"], [
            "ddd, D MMM YYYY HH:mm:ss Z",
            "YYYY-MM-DD",
            dayjs.ISO_8601,
        ]);
        if (p.isValid() && !p.isAfter(dayjs())) {
            const key = p.format("YYYY-MM");
            months[key] = (months[key] || 0) + 1;
        }
    });
    const sortedMonths = Object.keys(months).sort();
    const last = sortedMonths.pop();
    const start = dayjs(last).subtract(11, "month");
    const monthlyCounts = Array.from({ length: 12 }, (_, i) => ({
        label: start.add(i, "month").format("YYYY-MM"),
        value: months[start.add(i, "month").format("YYYY-MM")] || 0,
    }));

    return new Response(
        JSON.stringify({
            attack_techniques,
            sectors,
            countries,
            attackers,
            companies,
            top5AttackTechniques: attack_techniques.slice(0, 5),
            top5Attackers: attackers.slice(0, 5),
            mostUsedAttackType: attack_techniques[0] || {
                _id: "N/A",
                count: 0,
            },
            mostTargetedSector: sectors[0] || { _id: "N/A", count: 0 },
            newsCount,
            monthlyCounts,
            attackNewsMap: maps.attack,
            sectorNewsMap: maps.sector,
            countryNewsMap: maps.country,
        }),
        {
            status: 200,
            headers: { "Content-Type": "application/json" },
        }
    );
}
