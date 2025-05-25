import clientPromise from "@/lib/mongodb";

const ATTACK_TECHNIQUES = [
  "Data Breach", "Data Stolen", "DDoS", "Unauthorized Access",
  "Malware", "Phishing", "Remote Code Execution", "Cross-site Scripting",
  "System Vulnerability", "Injection", "CVE"
];

const INDUSTRIES = [
  "Energy", "Military", "Financial", "Government", "Healthcare",
  "Retail", "Education", "Technology", "Media",
  "Telecommunication", "Industrial Manufacturing", "Transportation"
];

export async function GET() {
  const client = await clientPromise;
  const db = client.db("cyber_news_db");
  const collection = db.collection("news_articles");

  const aggregateField = async (field) => {
    return await collection.aggregate([
      { $unwind: `$${field}` },
      { $group: { _id: `$${field}`, count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();
  };

  const filterKnown = async (field, list) => {
    return await collection.aggregate([
      { $unwind: `$${field}` },
      { $match: { [field]: { $in: list } } },
      { $group: { _id: `$${field}`, count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();
  };

  const companies = await aggregateField("victimName");
  const countries = await aggregateField("target_country");
  const attackers = await aggregateField("threatActor");
  const attack_types = await filterKnown("attack_type", ATTACK_TECHNIQUES);
  const industries = await filterKnown("target_industry", INDUSTRIES);

  return new Response(JSON.stringify({
    companies,
    countries,
    attackers,
    attack_types,
    industries
  }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}
