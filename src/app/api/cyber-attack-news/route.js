import data from '../../../data/json/cyber_attack_news.json';
import {
  aggregateIndustries,
  aggregateAttackTypes,
  aggregateTargetCountries,
  aggregateAttacksPerMonth,
  getTopTargetCountries,
  getLatestAttacks,
  getMostUsedAttackType,
  getMostTargetedIndustry,
  getTopAttackTypes,
  getTopAttackers
} from '../../../aggregation/statistics';

// Placeholder for future SPARQL query
async function fetchDataFromOntology() {
  // Simulate fetching data from an RDF ontology using SPARQL
  // Replace this with actual SPARQL query logic in the future
  return data;
}

export async function GET() {
  const ontologyData = await fetchDataFromOntology();
  const statistics = {
    industries: aggregateIndustries(),
    attackTypes: aggregateAttackTypes(),
    targetCountries: aggregateTargetCountries(),
    attacksPerMonth: aggregateAttacksPerMonth(),
    topTargetCountries: getTopTargetCountries(),
    latestAttacks: getLatestAttacks(),
    mostUsedAttackType: getMostUsedAttackType(),
    mostTargetedIndustry: getMostTargetedIndustry(),
    topAttackTypes: getTopAttackTypes(),
    topAttackers: getTopAttackers()
  };

  return Response.json({ data: ontologyData, statistics });
} 