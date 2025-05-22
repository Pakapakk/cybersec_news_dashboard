import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { QueryEngine } from '@comunica/query-sparql';

export async function getStatistics() {
  const ttlPath = path.join(process.cwd(), 'src', 'data', 'RefinedUnifiedOntology1-20.ttl');
  const ttlData = fs.readFileSync(ttlPath, 'utf8');

  const engine = new QueryEngine();

  // Query: Count number of CybersecurityNewsArticle
  const bindingsStream = await engine.queryBindings(`
    PREFIX ex: <http://example.org/ontology#>
    SELECT (COUNT(?article) AS ?count)
    WHERE {
      ?article a ex:CybersecurityNewsArticle .
    }
  `, {
    sources: [
      {
        type: 'stream',
        value: Readable.from([ttlData]),
        mediaType: 'text/turtle',
        baseIRI: 'http://example.org/ontology#',
      },
    ],
  });

  const bindings = await bindingsStream.toArray();
  const countLiteral = bindings[0]?.get('count');
  const newsCount = countLiteral ? parseInt(countLiteral.value, 10) : 0;

  return {
    newsCount, // 🔥 This is what the frontend will use
    mostUsedAttackType: { label: 'Phishing' }, // placeholder
    mostTargetedIndustry: { label: 'Finance' }, // placeholder
    topTargetCountries: [{ label: 'USA' }], // placeholder
    topAttackers: [{ label: 'APT29' }], // placeholder
    attacksPerMonth: [], // placeholder
    attackTypes: [], // placeholder
    topAttackTypes: [], // placeholder
    targetCountries: [], // placeholder
  };
}
