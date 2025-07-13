// NEW: pages/api/commit.ts
import { NextApiRequest, NextApiResponse } from "next";
import { Octokit } from "@octokit/rest";

const octokit = new Octokit({
  auth: process.env.GH_PAT
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 0) Debug: staat de token er wel in?
  console.log("▶︎ GH_PAT is", process.env.GH_PAT ? "[FOUND]" : "[MISSING]");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { html, prompt } = req.body as { html: string; prompt: string };

  // 1) Bepaal zoekterm: eerste <h1> of fallback op prompt
  const match = html.match(/<h1[^>]*>([^<]+)<\/h1>/);
  const searchTerm = match ? match[1] : prompt;

  let filePath: string;

  try {
    // 2) Vind het bestand in je GitHub-repo
    const searchRes = await octokit.search.code({
      q: `repo:Schapkun/agent-action-atlas "${searchTerm}"`
    });

    if (searchRes.data.items.length === 0) {
      return res.status(404).json({ error: `Geen bestand gevonden voor tekst: ${searchTerm}` });
    }

    filePath = searchRes.data.items[0].path;
  } catch (err: any) {
    return res.status(500).json({ error: `Bestand zoeken mislukt: ${err.message}` });
  }

  // 3) Haal de huidige SHA op (voor update)
  let sha: string | undefined;
  try {
    const getResp = await octokit.repos.getContent({
      owner: "Schapkun",
      repo:  "agent-action-atlas",
      path:  filePath,
    });
    sha = Array.isArray(getResp.data)
      ? (getResp.data[0] as any).sha
      : (getResp.data as any).sha;
  } catch {
    // 404 → nieuw bestand, sha blijft undefined
  }

  // 4) Commit de nieuwe HTML
  try {
    await octokit.repos.createOrUpdateFileContents({
      owner:   "Schapkun",
      repo:    "agent-action-atlas",
      path:    filePath,
      message: `AI-update: ${prompt}`,
      content: Buffer.from(html).toString("base64"),
      ...(sha ? { sha } : {}),
    });
    return res.status(200).json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: `Commit mislukt: ${err.message}` });
  }
}
