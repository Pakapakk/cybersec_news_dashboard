import data from "../data/json/cyber_attack_news.json";

// Generic function to aggregate counts
function aggregateCounts(key) {
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
    .sort((a, b) => b.value - a.value); // Sort in descending order
}

// Aggregate industries
function aggregateIndustries() {
  return aggregateCounts("industry");
}

// Aggregate attack types
function aggregateAttackTypes() {
  return aggregateCounts("attackType");
}

// Aggregate target countries
function aggregateTargetCountries() {
  return aggregateCounts("country");
}

// Aggregate attacks per month
function aggregateAttacksPerMonth() {
  const monthlyCounts = {};
  data.forEach(entry => {
    if (entry.datetime) {
      const month = entry.datetime.substring(0, 7); // Extract YYYY-MM
      monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
    }
  });

  return Object.entries(monthlyCounts)
    .sort(([a], [b]) => a.localeCompare(b)) // Sort by date
    .map(([label, value]) => ({ label, value }));
}

// Get top 3 target countries
function getTopTargetCountries() {
  return aggregateTargetCountries().slice(0, 3);
}

// Get the latest attacks (showing only attack types)
function getLatestAttacks(count = 5) {
  return data
    .filter(entry => entry.attackType) // Ensure attackType exists
    .sort((a, b) => new Date(b.datetime) - new Date(a.datetime)) // Sort by latest datetime
    .slice(0, count)
    .map(entry => ({
      datetime: entry.datetime,
      attackTypes: entry.attackType,
    }));
}

// Get most used attack type
function getMostUsedAttackType() {
  const attackTypes = aggregateAttackTypes();
  return attackTypes.length > 0 ? attackTypes[0] : null;
}

// Get most targeted industry
function getMostTargetedIndustry() {
  const industries = aggregateIndustries();
  return industries.length > 0 ? industries[0] : null;
}

// Get top 5 attack types
function getTopAttackTypes() {
  return aggregateAttackTypes().slice(0, 5);
}

// Get top 5 attackers with the most attacks
function getTopAttackers() {
  return aggregateCounts("threatActor").slice(0, 5);
}

export {
  aggregateIndustries,
  aggregateAttackTypes,
  aggregateTargetCountries,
  aggregateAttacksPerMonth,
  getTopTargetCountries,
  getLatestAttacks,
  getMostUsedAttackType,
  getMostTargetedIndustry,
  getTopAttackTypes,
  getTopAttackers,
};
