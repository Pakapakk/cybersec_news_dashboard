import clientPromise from "@/lib/mongodb";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);

// Label formatter
function formatLabel(label = "") {
    const exceptions = {
        cve: "CVE",
        ddos: "DDoS",
        dos: "DoS",
    };

    const lower = label.toLowerCase();
    if (exceptions[lower]) return exceptions[lower];

    return label
        .split(" ")
        .map((word) =>
            word.length > 2 ? word[0].toUpperCase() + word.slice(1) : word
        )
        .join(" ");
}

// Normalize country names
function normalizeCountry(label = "") {
    const map = {
        us: "United States",
        usa: "United States",
        "united states": "United States",
        "u.s.": "United States",
        "united states of america": "United States",
        uk: "United Kingdom",
        "united kingdom": "United Kingdom",
        england: "United Kingdom",
        gb: "United Kingdom",
        "great britain": "United Kingdom",
    };

    const normalized = label.toLowerCase();
    return map[normalized] || formatLabel(label);
}

export async function GET() {
    const client = await clientPromise;
    const db = client.db("cyber_news_db");
    const collection = db.collection("news_list_test");

    const fields = [
        "companies",
        "countries",
        "attack_techniques",
        "attackers",
        "sectors",
    ];

    const result = {};

    for (const field of fields) {
        const raw = await collection
            .aggregate([
                {
                    $match: {
                        [`Keywords.${field}`]: {
                            $exists: true,
                            $ne: null,
                            $not: { $size: 0 },
                        },
                    },
                },
                {
                    $project: {
                        value: {
                            $map: {
                                input: `$Keywords.${field}`,
                                as: "item",
                                in: { $toLower: "$$item" },
                            },
                        },
                    },
                },
                { $unwind: "$value" },
                { $group: { _id: "$value", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
            ])
            .toArray();

        result[field] = raw.map(({ _id, count }) => {
            const label =
                field === "countries"
                    ? normalizeCountry(_id)
                    : formatLabel(_id);
            return { _id: label, count };
        });
    }

    const aggregateMonthlyCounts = async () => {
        const docs = await collection
            .find({}, { projection: { "Publish Date": 1 } })
            .toArray();
        const monthCounts = {};

        for (const doc of docs) {
            const rawDate = doc["Publish Date"];
            if (!rawDate) continue;

            const parsed = dayjs(rawDate, [
                "ddd, D MMM YYYY HH:mm:ss Z",
                "ddd, DD MMM YYYY HH:mm:ss Z",
                "YYYY-MM-DD",
                "MMM D, YYYY",
                "D MMM YYYY",
                dayjs.ISO_8601,
            ]);

            if (!parsed.isValid()) continue;

            const label = parsed.format("YYYY-MM");
            if (parsed.isAfter(dayjs())) continue;

            monthCounts[label] = (monthCounts[label] || 0) + 1;
        }

        const sortedMonths = Object.keys(monthCounts)
            .filter((m) => dayjs(m, "YYYY-MM").isValid())
            .sort((a, b) => (dayjs(a).isAfter(dayjs(b)) ? 1 : -1));

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
    result.newsCount = await collection.countDocuments();

    result.top5AttackTechniques = result.attack_techniques?.slice(0, 5) || [];
    result.top5Attackers = result.attackers?.slice(0, 5) || [];

    result.mostUsedAttackType = result.attack_techniques?.[0]
        ? {
              label: result.attack_techniques[0]._id,
              count: result.attack_techniques[0].count,
          }
        : { label: "N/A", count: 0 };

    result.mostTargetedSector = result.sectors?.[0]
        ? {
              label: result.sectors[0]._id,
              count: result.sectors[0].count,
          }
        : { label: "N/A", count: 0 };

    return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
}
