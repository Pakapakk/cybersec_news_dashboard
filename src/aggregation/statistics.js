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
  
  return Object.entries(counts).map(([label, value]) => ({ label, value }));
}


// Aggregate industries
function aggregateIndustries() {
  // console.log("[DEBUG] Aggregating Industries...");
  // console.log(aggregateCounts("industry"));
  return aggregateCounts("industry");
}

// Aggregate attack types
function aggregateAttackTypes() {
  // console.log("[DEBUG] Aggregating Attack Types...");
  console.log(aggregateCounts('attackType'));
  return aggregateCounts("attackType");
}

// Aggregate target countries
function aggregateTargetCountries() {
  console.log("[DEBUG] Aggregating Target Countries...");
  return aggregateCounts("country");
}

// Aggregate attacks per month
function aggregateAttacksPerMonth() {
  console.log("[DEBUG] Aggregating Attacks Per Month...");

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

export {
  aggregateIndustries,
  aggregateAttackTypes,
  aggregateTargetCountries,
  aggregateAttacksPerMonth
};
