// Next/Turbopack writes server .map files but leaves them out of each
// function's .nft.json, so Vercel deploys functions without them and
// production stack traces point at .next chunks. Add every traced chunk's
// sibling .map file to its trace, so Node can resolve frames to src/ files.
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const root = join(import.meta.dirname, "..", ".next", "server");
let added = 0;

function walk(dir) {
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) walk(path);
		else if (entry.name.endsWith(".nft.json")) patch(path);
	}
}

function patch(file) {
	const trace = JSON.parse(readFileSync(file, "utf8"));
	const files = new Set(trace.files);
	const candidates = [...files, file.replace(/\.nft\.json$/, "").slice(dirname(file).length + 1)];
	for (const traced of candidates) {
		if (!traced.endsWith(".js")) continue;
		const map = `${traced}.map`;
		if (!files.has(map) && existsSync(join(dirname(file), map))) {
			files.add(map);
			added++;
		}
	}
	trace.files = [...files];
	writeFileSync(file, JSON.stringify(trace));
}

if (existsSync(root)) walk(root);
console.log(`trace-source-maps: added ${added} .map files to function traces`);
