import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");
const postsPath = path.join(root, "src", "data", "posts.json");

function sqlString(value) {
  if (value === null || value === undefined) return "''";
  return `'${String(value).replace(/'/g, "''")}'`;
}

const raw = fs.readFileSync(postsPath, "utf-8");
const posts = JSON.parse(raw);

const now = new Date().toISOString();

let out = "-- seed posts into D1\n";
out += "DELETE FROM posts;\n";

for (const p of posts) {
  out +=
    "INSERT INTO posts (slug,title,titleZh,excerpt,excerptZh,date,category,categoryZh,readTime,content,contentZh,updatedAt) VALUES (" +
    [
      sqlString(p.slug),
      sqlString(p.title),
      sqlString(p.titleZh),
      sqlString(p.excerpt),
      sqlString(p.excerptZh),
      sqlString(p.date),
      sqlString(p.category),
      sqlString(p.categoryZh),
      sqlString(p.readTime),
      sqlString(p.content),
      sqlString(p.contentZh),
      sqlString(now),
    ].join(",") +
    ");\n";
}

process.stdout.write(out);
