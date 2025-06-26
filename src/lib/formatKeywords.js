export const formatKeyword = (category, item) => {
  if (!item) return "";

  // List of known acronyms (extend as needed)
  const knownAcronyms = new Set([
    "AWS", "FBI", "IT", "NSA", "CIA", "APT", "DDoS", "CISA", "NATO", "URL", "AI", "API", "S3", "DPRK", "DEFI", "US", "CCCS", "MFA", "AES", "SHA", "CNAPP", "CVE", "SSHFP"
  ]);

  if (category.toLowerCase() === "attackers") {
    return item.toUpperCase();
  }

  const isAcronym = (word) =>
    knownAcronyms.has(word.toUpperCase()) || (/^[A-Z0-9]+$/.test(word) && word.length <= 5);

  const formatWord = (word) =>
    word
      .split("-")
      .map((part) =>
        isAcronym(part)
          ? part.toUpperCase()
          : part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
      )
      .join("-");

  return item
    .split(" ")
    .map((word) => formatWord(word))
    .join(" ");
};
