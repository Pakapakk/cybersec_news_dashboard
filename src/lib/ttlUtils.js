const ONTOLOGY_NAMESPACE = "http://example.org/ontology#";

export function getTopClassesByInstanceCount(quads, topN = 15) {
    const classInstanceCounts = {};
    const classLabels = {};

    for (const quad of quads) {
        const subject = quad.subject.value;
        const object = quad.object.value;

        // Only handle items from our ontology namespace
        if (
            !subject.startsWith(ONTOLOGY_NAMESPACE) &&
            !object.startsWith(ONTOLOGY_NAMESPACE)
        )
            continue;

        if (
            quad.predicate.value ===
            "http://www.w3.org/2000/01/rdf-schema#label"
        ) {
            classLabels[subject] = quad.object.value;
        }

        if (
            quad.predicate.value ===
            "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
        ) {
            const classUri = object;

            if (
                classUri.endsWith("#Class") ||
                classUri.endsWith("/Class") ||
                classUri.endsWith("#CybersecurityNewsArticle") ||
                classUri.endsWith("/CybersecurityNewsArticle")
            )
                continue;

            if (!classUri.startsWith(ONTOLOGY_NAMESPACE)) continue;

            classInstanceCounts[classUri] =
                (classInstanceCounts[classUri] || 0) + 1;
        }
    }

    return Object.entries(classInstanceCounts)
        .map(([uri, count]) => ({
            uri,
            label:
                classLabels[uri] ||
                uri.split("#").pop() ||
                uri.split("/").pop(),
            count,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, topN);
}

export function getAllInstances(quads) {
    const instances = new Set();

    for (const quad of quads) {
        if (
            quad.predicate.value ===
                "http://www.w3.org/1999/02/22-rdf-syntax-ns#type" &&
            quad.subject.value.startsWith(ONTOLOGY_NAMESPACE)
        ) {
            const subject = quad.subject.value;
            const label = subject.includes("#")
                ? subject.split("#").pop()
                : subject.split("/").pop();

            instances.add(label);
        }
    }

    return Array.from(instances);
}

export function getOntologyClasses(quads) {
    const classes = [];

    for (const quad of quads) {
        const isClass =
            quad.predicate.value.includes("type") &&
            quad.object.value.includes("Class");
        if (isClass) {
            const uri = quad.subject.value;
            const labelQuad = quads.find(
                (q) =>
                    q.subject.equals(quad.subject) &&
                    q.predicate.value.includes("label")
            );
            const label = labelQuad
                ? labelQuad.object.value
                : uri.split("#").pop();
            classes.push({ uri, label });
        }
    }

    return classes;
}
