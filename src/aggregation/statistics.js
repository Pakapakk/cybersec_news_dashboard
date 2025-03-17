// import data from "../data/json/cyber_attack_news.json";

// // Aggregate target industries
// function aggregateIndustries(data) {
//   console.log("[DEBUG] Raw Data for Industries:", data);

//   const industryCounts = {};
//   data.forEach(entry => {
//     if (Array.isArray(entry.industry)) {
//       entry.industry.forEach(industry => {
//         industryCounts[industry] = (industryCounts[industry] || 0) + 1;
//       });
//     }
//   });

//   const result = Object.keys(industryCounts).map(industry => ({
//     label: industry,
//     value: industryCounts[industry],
//   }));

//   console.log("[DEBUG] Aggregated Industry Data:", result);
//   return result;
// }

// // Aggregate attack types
// function aggregateAttackTypes(data) {
//   console.log("[DEBUG] Raw Data for Attack Types:", data);

//   const attackCounts = {};
//   data.forEach(entry => {
//     if (Array.isArray(entry.attackType)) {
//       entry.attackType.forEach(type => {
//         attackCounts[type] = (attackCounts[type] || 0) + 1;
//       });
//     }
//   });

//   const result = Object.keys(attackCounts).map(type => ({
//     label: type,
//     value: attackCounts[type],
//   }));

//   console.log("[DEBUG] Aggregated Attack Types:", result);
//   return result;
// }

// // Aggregate target countries
// function aggregateTargetCountries(data) {
//   console.log("[DEBUG] Raw Data for Countries:", data);

//   const countryCounts = {};
//   data.forEach(entry => {
//     if (Array.isArray(entry.country)) {
//       entry.country.forEach(country => {
//         countryCounts[country] = (countryCounts[country] || 0) + 1;
//       });
//     }
//   });

//   const result = Object.keys(countryCounts).map(country => ({
//     label: country,
//     value: countryCounts[country],
//   }));

//   console.log("[DEBUG] Aggregated Country Data:", result);
//   return result;
// }

// // Aggregate attacks per month
// function aggregateAttacksPerMonth(data) {
//   console.log("[DEBUG] Raw Data for Attacks Per Month:", data);

//   const monthlyCounts = {};
//   data.forEach(entry => {
//     if (entry.datetime) {
//       const month = entry.datetime.substring(0, 7); // Extract YYYY-MM
//       monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
//     }
//   });

//   const result = Object.keys(monthlyCounts).sort().map(month => ({
//     label: month,
//     value: monthlyCounts[month],
//   }));

//   console.log("[DEBUG] Aggregated Attacks Per Month:", result);
//   return result;
// }

// export {
//   aggregateIndustries,
//   aggregateAttackTypes,
//   aggregateTargetCountries,
//   aggregateAttacksPerMonth
// };

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
  console.log("[DEBUG] Aggregating Industries...");
  console.log(aggregateCounts("industry"));
  return aggregateCounts("industry");
}

// Aggregate attack types
function aggregateAttackTypes() {
  console.log("[DEBUG] Aggregating Attack Types...");
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
