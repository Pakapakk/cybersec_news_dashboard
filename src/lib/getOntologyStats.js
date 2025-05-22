import fs from "fs";
import path from "path";
import { Parser, Store } from "n3";
import { QueryEngine } from "@comunica/query-sparql";

const TTL_PATH = path.join(
    process.cwd(),
    "src",
    "data",
    "ontology",
    "RefinedUnifiedOntology1-35.ttl"
);

async function querySparql(query) {
    try {
        const ttlData = fs.readFileSync(TTL_PATH, "utf8");
        const parser = new Parser();
        const quads = parser.parse(ttlData);
        const store = new Store(quads);

        const engine = new QueryEngine();
        const bindingsStream = await engine.queryBindings(query, {
            sources: [store],
        });

        const results = await bindingsStream.toArray();
        return results.map((binding) => {
            const obj = {};
            for (const [key, val] of binding) {
                obj[key.value] = val.value;
            }
            return obj;
        });
    } catch (err) {
        console.error("SPARQL query error:", err);
        throw err;
    }
}

// Utility to parse counts as integers
function parseCountResults(results, key = 'count') {
    return results.map((r) => ({
        ...r,
        [key]: parseInt(r[key], 10)
    }));
}

export async function getOntologyStatistics() {
    const newsCountQuery = `
        PREFIX ex: <http://example.org/ontology#>
        SELECT (COUNT(?news) AS ?count)
        WHERE {
          ?news a ex:CybersecurityNewsArticle .
        }
    `;

    const threatActorCountQuery = `
        PREFIX ex: <http://example.org/ontology#>
        SELECT ?actor (COUNT(?news) AS ?count)
        WHERE {
          ?news a ex:CybersecurityNewsArticle ;
                ex:relatedTo ?actor .
          ?actor a ex:ThreatActor .
        }
        GROUP BY ?actor
        ORDER BY DESC(?count)
    `;

    const attackTypeCountQuery = `
        PREFIX ex: <http://example.org/ontology#>
        SELECT ?attackType (COUNT(?news) AS ?count)
        WHERE {
          ?news a ex:CybersecurityNewsArticle ;
                ex:relatedTo ?attackType .
          ?attackType a ex:CyberAttack .
        }
        GROUP BY ?attackType
        ORDER BY DESC(?count)
    `;

    const industryCountQuery = `
        PREFIX ex: <http://example.org/ontology#>
        SELECT ?industry (COUNT(?news) AS ?count)
        WHERE {
          ?news a ex:CybersecurityNewsArticle ;
                ex:relatedTo ?industry .
          ?industry a ex:Company .
        }
        GROUP BY ?industry
        ORDER BY DESC(?count)
    `;

    const locationCountQuery = `
        PREFIX ex: <http://example.org/ontology#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        SELECT ?place (COUNT(?news) AS ?count) (SAMPLE(?label) AS ?label)
        WHERE {
            ?news a ex:CybersecurityNewsArticle ;
                  ex:relatedTo ?place .
            ?place a ?type .
            FILTER(?type IN (
                ex:GovernmentDomain,
                ex:GovernmentDepartment,
                ex:GovernmentAgency,
                ex:StateAgency
            ))
            OPTIONAL { ?place rdfs:label ?label }
        }
        GROUP BY ?place
        ORDER BY DESC(?count)
    `;

    const newsCountResults = await querySparql(newsCountQuery);
    const threatActorCounts = (await querySparql(threatActorCountQuery)).map(r => ({
        actor: r.actor.split('#').pop(),
        count: parseInt(r.count, 10),
    }));

    const attackTypeCounts = (await querySparql(attackTypeCountQuery)).map(r => ({
        attackType: r.attackType.split('#').pop(),
        count: parseInt(r.count, 10),
    }));

    const industryCounts = (await querySparql(industryCountQuery)).map(r => ({
        industry: r.industry.split('#').pop(),
        count: parseInt(r.count, 10),
    }));

    const locationCounts = (await querySparql(locationCountQuery)).map(r => ({
        place: r.place.split('#').pop(),
        label: r.label || r.place.split('#').pop(),
        count: parseInt(r.count, 10),
    }));

    const newsCount = parseInt(newsCountResults[0]["count"], 10);

    return {
        newsCount,
        threatActorCounts,
        attackTypeCounts,
        industryCounts,
        locationCounts,
    };
}


export async function getAllNewsArticles() {
    const newsQuery = `
        PREFIX ex: <http://example.org/ontology#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        SELECT ?news ?related ?relatedLabel
        WHERE {
            ?news a ex:CybersecurityNewsArticle ;
                  ex:relatedTo ?related .
            OPTIONAL { ?related rdfs:label ?relatedLabel }
        }
    `;

    const rawResults = await querySparql(newsQuery);

    // Group by news URI
    const grouped = {};
    rawResults.forEach(({ news, related, relatedLabel }) => {
        if (!grouped[news]) {
            grouped[news] = {
                id: news,
                relatedEntities: [],
            };
        }
        grouped[news].relatedEntities.push({
            uri: related,
            label: relatedLabel || related.split('#').pop(),
        });
    });

    return Object.values(grouped);
}