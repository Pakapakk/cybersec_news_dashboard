import { namedNode } from "n3";

export function getOntologyClasses(quads) {
  const classes = [];

  for (const quad of quads) {
    const isClass = quad.predicate.value.includes("type") && quad.object.value.includes("Class");
    if (isClass) {
      const uri = quad.subject.value;
      const labelQuad = quads.find(q =>
        q.subject.equals(quad.subject) &&
        q.predicate.value.includes("label")
      );
      const label = labelQuad ? labelQuad.object.value : uri.split("#").pop();
      classes.push({ uri, label });
    }
  }

  return classes;
}
