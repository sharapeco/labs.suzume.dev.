import { readFile, readdir, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import * as cheerio from "cheerio";
import ignore from "ignore";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const htmlDir = join(__dirname, "..", "html");
const rootDir = join(__dirname, "..");

async function loadGitignore() {
	try {
		const gitignoreContent = await readFile(join(rootDir, ".gitignore"), "utf-8");
		const ig = ignore();
		ig.add(gitignoreContent);
		return ig;
	} catch (error) {
		console.warn("Warning: .gitignore file not found");
		return ignore();
	}
}

async function findIndexFiles(dir, ig) {
	const entries = await readdir(dir, { withFileTypes: true });
	const indexFiles = [];

	for (const entry of entries) {
		const fullPath = join(dir, entry.name);
		const relativePath = relative(rootDir, fullPath);

		if (ig.ignores(relativePath)) {
			continue;
		}

		if (entry.isDirectory()) {
			indexFiles.push(...(await findIndexFiles(fullPath, ig)));
		} else if (entry.name === "index.html") {
			indexFiles.push(fullPath);
		}
	}

	return indexFiles;
}

async function parseIndexFile(filePath) {
	const content = await readFile(filePath, "utf-8");
	const $ = cheerio.load(content);

	const title = $("title").text().trim();
	const description = $('meta[name="description"]').attr("content")?.trim();
	const keywords =
		$('meta[name="keywords"]')
			.attr("content")
			?.split(",")
			.map((k) => k.trim()) || [];

	if (isEmpty(title) || isEmpty(description)) {
		return null;
	}

	const relativePath = relative(htmlDir, filePath);
	const url = `/${relativePath.replace(/\/index\.html$/, "/")}`;

	return {
		url,
		title,
		keywords,
		description,
	};
}

function isEmpty(value) {
	return (
		value == null ||
		value === "" ||
		value === "Template" ||
		value === "Template Description"
	);
}

async function main() {
	const ig = await loadGitignore();
	const indexFiles = await findIndexFiles(htmlDir, ig);
	const contents = [];

	for (const file of indexFiles) {
		const content = await parseIndexFile(file);
		if (content) {
			contents.push(content);
		}
	}

	const output = `export const contents = ${JSON.stringify(contents, null, 2)};\n`;
	await writeFile(join(htmlDir, "build/index.js"), output);
}

main().catch(console.error);
