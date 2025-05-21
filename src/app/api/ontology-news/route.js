import { newEngine } from '@comunica/query-sparql-file';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize the SPARQL engine
const engine = newEngine();

// Function to fetch data from the ontology using SPARQL
async function fetchDataFromOntology() {
  const ontologyPath = path.join(__dirname, '../../../data/BaselineOntology1-20.ttl');
  
  // SPARQL query to get cyber attack news
  const query = `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX owl: <http://www.w3.org/2002/07/owl#>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    PREFIX cyber: <http://www.semanticweb.org/cybersecurity#>

    SELECT ?victim ?attackType ?industry ?threatActor ?country ?datetime
    WHERE {
      ?attack rdf:type cyber:CyberAttack .
      ?attack cyber:hasVictim ?victim .
      ?attack cyber:hasAttackType ?attackType .
      ?attack cyber:hasIndustry ?industry .
      ?attack cyber:hasThreatActor ?threatActor .
      ?attack cyber:hasCountry ?country .
      ?attack cyber:hasDateTime ?datetime .
    }
  `;

  try {
    const result = await engine.query(query, {
      sources: [ontologyPath],
    });

    const bindings = await result.bindings();
    const attacks = [];

    for await (const binding of bindings) {
      attacks.push({
        victimName: binding.get('victim').value,
        attackType: [binding.get('attackType').value],
        industry: [binding.get('industry').value],
        threatActor: [binding.get('threatActor').value],
        country: [binding.get('country').value],
        datetime: binding.get('datetime').value
      });
    }

    return attacks;
  } catch (error) {
    console.error('Error querying ontology:', error);
    throw error;
  }
}

// Helper function to aggregate counts
function aggregateCounts(data, key) {
  const counts = {};
  data.forEach(entry => {
    if (Array.isArray(entry[key])) {
      entry[key].forEach(item => {
        counts[item] = (counts[item] || 0) + 1;
      });
    }
  });

  return Object.entries(counts)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

// Helper functions for statistics
function aggregateAttacksPerMonth(data) {
  const monthlyCounts = {};
  data.forEach(entry => {
    if (entry.datetime) {
      const month = entry.datetime.substring(0, 7);
      monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
    }
  });

  return Object.entries(monthlyCounts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, value]) => ({ label, value }));
}

function getTopTargetCountries(data) {
  return aggregateCounts(data, 'country').slice(0, 3);
}

function getLatestAttacks(data, count = 5) {
  return data
    .sort((a, b) => new Date(b.datetime) - new Date(a.datetime))
    .slice(0, count);
}

function getMostUsedAttackType(data) {
  const attackTypes = aggregateCounts(data, 'attackType');
  return attackTypes.length > 0 ? attackTypes[0] : null;
}

function getMostTargetedIndustry(data) {
  const industries = aggregateCounts(data, 'industry');
  return industries.length > 0 ? industries[0] : null;
}

function getTopAttackTypes(data) {
  return aggregateCounts(data, 'attackType').slice(0, 5);
}

function getTopAttackers(data) {
  return aggregateCounts(data, 'threatActor').slice(0, 5);
}

export async function GET() {
  try {
    const ontologyData = await fetchDataFromOntology();
    
    // Calculate statistics from the ontology data
    const statistics = {
      industries: aggregateCounts(ontologyData, 'industry'),
      attackTypes: aggregateCounts(ontologyData, 'attackType'),
      targetCountries: aggregateCounts(ontologyData, 'country'),
      attacksPerMonth: aggregateAttacksPerMonth(ontologyData),
      topTargetCountries: getTopTargetCountries(ontologyData),
      latestAttacks: getLatestAttacks(ontologyData),
      mostUsedAttackType: getMostUsedAttackType(ontologyData),
      mostTargetedIndustry: getMostTargetedIndustry(ontologyData),
      topAttackTypes: getTopAttackTypes(ontologyData),
      topAttackers: getTopAttackers(ontologyData)
    };

    return Response.json({ data: ontologyData, statistics });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
} 