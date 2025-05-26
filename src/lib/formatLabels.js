export function formatLabel(label = "") {
  return label
    .split(" ")
    .map((word) =>
      word.length > 2 ? word[0].toUpperCase() + word.slice(1) : word
    )
    .join(" ");
}
