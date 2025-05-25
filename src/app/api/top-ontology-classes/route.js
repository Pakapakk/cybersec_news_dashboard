import { readFileSync } from "fs";
import path from "path";
import { Parser } from "n3";
import { getTopClassesByInstanceCount } from "../../../lib/ttlUtils";

const TTL_PATH = path.join(
  process.cwd(),
  "src",
  "data",
  "ontology",
  "RefinedUnifiedOntology1-35.ttl"
);
const ttlData = readFileSync(TTL_PATH, "utf8");

export async function GET() {
  try {
    const parser = new Parser();
    const quads = parser.parse(ttlData);

    const topClasses = getTopClassesByInstanceCount(quads);
    return new Response(JSON.stringify(topClasses), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Failed to parse TTL:", error);
    return new Response(
      JSON.stringify({ error: "Failed to get top classes" }),
      { status: 500 }
    );
  }
}
