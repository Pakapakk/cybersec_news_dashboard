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

function parseCountResults(results, key = "count") {
    return results.map((r) => ({
        ...r,
        [key]: parseInt(r[key], 10),
    }));
}

function inferCountryFromLabel(label) {
    const map = [
        { keyword: /US|NASA|State|Department|CISA|SSA|IRS|USPS|Treasury|Commerce|Energy/i, country: "United States" },
        { keyword: /UK|InformationCommissionersOfficeUK/, country: "United Kingdom" },
        { keyword: /Italy/, country: "Italy" },
    ];
    for (const rule of map) {
        if (rule.keyword.test(label)) {
            return rule.country;
        }
    }
    return null;
}

export async function getOntologyStatistics() {
    const queries = {
        newsCountQuery: `
            PREFIX ex: <http://example.org/ontology#>
            SELECT (COUNT(?news) AS ?count)
            WHERE {
              ?news a ex:CybersecurityNewsArticle .
            }
        `,
        threatActorCountQuery: `
            PREFIX ex: <http://example.org/ontology#>
            SELECT ?actor (COUNT(?news) AS ?count)
            WHERE {
              ?news a ex:CybersecurityNewsArticle ;
                    ex:relatedTo ?actor .
              ?actor a ex:ThreatActor .
            }
            GROUP BY ?actor
            ORDER BY DESC(?count)
        `,
        attackTypeCountQuery: `
            PREFIX ex: <http://example.org/ontology#>
            SELECT ?attackType (COUNT(?news) AS ?count)
            WHERE {
              ?news a ex:CybersecurityNewsArticle ;
                    ex:relatedTo ?attackType .
              ?attackType a ex:CyberAttack .
            }
            GROUP BY ?attackType
            ORDER BY DESC(?count)
        `,
        industryCountQuery: `
            PREFIX ex: <http://example.org/ontology#>
            SELECT ?industry (COUNT(?news) AS ?count)
            WHERE {
              ?news a ex:CybersecurityNewsArticle ;
                    ex:relatedTo ?industry .
              ?industry a ex:Company .
            }
            GROUP BY ?industry
            ORDER BY DESC(?count)
        `,
        locationCountQuery: `
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
        `,
        domainClassCountQuery: `
            PREFIX ex: <http://example.org/ontology#>
            SELECT ?domainClass (COUNT(?news) AS ?count)
            WHERE {
                ?news a ex:CybersecurityNewsArticle ;
                    ex:relatedTo ?entity .
                ?entity a ?domainClass .
            }
            GROUP BY ?domainClass
            ORDER BY DESC(?count)
        `,
    };

    const newsCountResults = await querySparql(queries.newsCountQuery);
    const threatActorCounts = (await querySparql(queries.threatActorCountQuery)).map(r => ({
        actor: r.actor.split("#").pop(),
        count: parseInt(r.count, 10),
    }));

    const attackTypeCounts = (await querySparql(queries.attackTypeCountQuery)).map(r => ({
        attackType: r.attackType.split("#").pop(),
        count: parseInt(r.count, 10),
    }));

    const industryCounts = (await querySparql(queries.industryCountQuery)).map(r => ({
        industry: r.industry.split("#").pop(),
        count: parseInt(r.count, 10),
    }));

    const locationCounts = (await querySparql(queries.locationCountQuery)).map(r => {
        const label = r.label || r.place.split("#").pop();
        return {
            place: r.place.split("#").pop(),
            label,
            count: parseInt(r.count, 10),
            country: inferCountryFromLabel(label)
        };
    });

    const countryCounts = Object.values(
        locationCounts.reduce((acc, { country, count }) => {
            if (!country) return acc;
            if (!acc[country]) acc[country] = { country, count: 0 };
            acc[country].count += count;
            return acc;
        }, {})
    ).map(c => ({ ...c, label: c.country }));

    const newsCount = parseInt(newsCountResults[0]["count"], 10);

    const domainClassCounts = (await querySparql(queries.domainClassCountQuery)).map(r => ({
        class: r.domainClass.split("#").pop(),
        count: parseInt(r.count, 10),
    }));

    const attackTypePatterns = [
        /^DataBreach$/, /Payload/i, /Spyware/i, /Malware/i,
        /Trojan/i, /Backdoor/i, /^APT\d+$/i, /^APT$/i,
        /Attack(Method|Vector)?$/i,
        /Ransomware/i, /SupplyChainAttack/i, /CredentialStuffing/i,
        /Phishing/i, /SQLInjection/i, /CrossSiteScripting/i, /ManInTheMiddle/i,
        /DNSPoisoning/i, /DenialOfService/i, /Botnet/i, /Exfiltration/i,
        /PrivilegeEscalation/i, /BruteForce/i, /Misconfiguration/i,
        /InsiderThreat/i, /Exploit/i, /Vulnerability(Chain|Exploitation)?$/i,
    ];

    function matchesAttackType(className) {
        return attackTypePatterns.some((regex) => regex.test(className));
    }

    const attackTypeClassCounts = domainClassCounts
        .filter((item) => matchesAttackType(item.class))
        .map((item) => ({ attackType: item.class, count: item.count }));

    return {
        newsCount,
        threatActorCounts,
        industryCounts,
        locationCounts,
        countryCounts,
        attackTypeClassCounts,
    };
}

export async function getAllNewsArticles() {
    const newsQuery = `
        PREFIX ex: <http://example.org/ontology#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        SELECT ?news ?newsDate ?related ?relatedLabel ?breachDate
        WHERE {
            ?news a ex:CybersecurityNewsArticle ;
                  ex:relatedTo ?related .
            OPTIONAL { ?news ex:newsPublishedDate ?newsDate }
            OPTIONAL { ?related rdfs:label ?relatedLabel }
            OPTIONAL { ?related ex:breachPeriod ?breachDate }
        }
    `;

    const rawResults = await querySparql(newsQuery);

    const grouped = {};
    rawResults.forEach(({ news, newsDate, related, relatedLabel, breachDate }) => {
        const newsId = news.split("#").pop();
        const relatedId = related.split("#").pop();

        if (!grouped[newsId]) {
            grouped[newsId] = {
                id: newsId,
                publishedDate: newsDate || null,
                breachDates: [],
                relatedEntities: [],
            };
        }

        if (breachDate && !grouped[newsId].breachDates.includes(breachDate)) {
            grouped[newsId].breachDates.push(breachDate);
        }

        grouped[newsId].relatedEntities.push({
            uri: relatedId,
            label: relatedLabel || relatedId,
        });
    });

    return Object.values(grouped);
}


export async function getTopAttackTechniques(limit = 5) {
    const { attackTypeClassCounts } = await getOntologyStatistics();
    return attackTypeClassCounts
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
}

export async function getTopAttackers(limit = 5) {
    const { threatActorCounts } = await getOntologyStatistics();
    return threatActorCounts
        .map((a) => ({ label: a.actor, value: a.count }))
        .sort((a, b) => b.value - a.value)
        .slice(0, limit);
}
