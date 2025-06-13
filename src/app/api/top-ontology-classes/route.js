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

function formatLabel(label) {
  return label.replace(/([a-z])([A-Z])/g, '$1 $2').trim();
}

export async function GET() {
  try {
    const ttl = readFileSync(TTL_PATH, "utf8");
    const quads = new Parser().parse(ttl);
    const raw = getTopClassesByInstanceCount(quads);

    const topClasses = raw.map(({ uri, label, count }) => ({
      uri,
      label: formatLabel(label),
      count
    }));

    return new Response(JSON.stringify(topClasses), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "…"}), { status: 500 });
  }
}
