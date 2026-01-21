type Env = {
  DB: D1Database;
  ACCESS_TEAM_DOMAIN?: string;
  ACCESS_AUD?: string;
  ADMIN_EMAIL: string;
};

type BlogPost = {
  title: string;
  titleZh: string;
  excerpt: string;
  excerptZh: string;
  date: string;
  category: string;
  categoryZh: string;
  slug: string;
  readTime: string;
  content: string;
  contentZh: string;
};

type AccessPayload = {
  aud?: string | string[];
  email?: string;
  exp?: number;
};

function json(data: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...(init?.headers ?? {}),
    },
    ...init,
  });
}

function base64UrlToUint8Array(input: string) {
  const pad = "=".repeat((4 - (input.length % 4)) % 4);
  const base64 = (input + pad).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

function parseJwt(token: string) {
  const [h, p, s] = token.split(".");
  if (!h || !p || !s) throw new Error("invalid jwt");
  const header = JSON.parse(new TextDecoder().decode(base64UrlToUint8Array(h)));
  const payload = JSON.parse(new TextDecoder().decode(base64UrlToUint8Array(p)));
  const signature = base64UrlToUint8Array(s);
  return { header, payload, signature, signingInput: `${h}.${p}` };
}

async function importRsaKeyFromJwk(jwk: JsonWebKey) {
  return crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"],
  );
}

async function verifyAccessJwt(token: string, env: Env) {
  if (!env.ACCESS_TEAM_DOMAIN || !env.ACCESS_AUD) {
    throw new Error("access config missing");
  }

  const { header, payload, signature, signingInput } = parseJwt(token);
  const kid = header?.kid;
  if (!kid) throw new Error("kid missing");

  const certUrl = `https://${env.ACCESS_TEAM_DOMAIN}/cdn-cgi/access/certs`;
  const certRes = await fetch(certUrl, { cf: { cacheTtl: 300, cacheEverything: true } } as any);
  if (!certRes.ok) throw new Error("failed to fetch jwks");
  const jwks = (await certRes.json()) as { keys?: JsonWebKey[] };
  const jwk = jwks.keys?.find((k) => (k as any).kid === kid);
  if (!jwk) throw new Error("jwk not found");

  const key = await importRsaKeyFromJwk(jwk);
  const ok = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    key,
    signature,
    new TextEncoder().encode(signingInput),
  );
  if (!ok) throw new Error("signature invalid");

  const p = payload as AccessPayload;
  const now = Math.floor(Date.now() / 1000);
  if (typeof p.exp === "number" && p.exp < now) throw new Error("token expired");

  const aud = p.aud;
  const audOk = Array.isArray(aud) ? aud.includes(env.ACCESS_AUD) : aud === env.ACCESS_AUD;
  if (!audOk) throw new Error("aud mismatch");

  return p;
}

async function requireAdmin(request: Request, env: Env) {
  const jwt = request.headers.get("Cf-Access-Jwt-Assertion");
  if (!jwt) return { ok: false as const, reason: "missing access jwt" };

  try {
    const payload = await verifyAccessJwt(jwt, env);
    if (!payload.email || payload.email.toLowerCase() !== env.ADMIN_EMAIL.toLowerCase()) {
      return { ok: false as const, reason: "forbidden" };
    }
    return { ok: true as const, email: payload.email };
  } catch (e) {
    return { ok: false as const, reason: e instanceof Error ? e.message : "invalid token" };
  }
}

async function listPosts(env: Env) {
  const { results } = await env.DB.prepare(
    "SELECT title,titleZh,excerpt,excerptZh,date,category,categoryZh,slug,readTime,content,contentZh FROM posts ORDER BY rowid DESC",
  ).all<BlogPost>();
  return results;
}

async function getPostBySlug(env: Env, slug: string) {
  const row = await env.DB.prepare(
    "SELECT title,titleZh,excerpt,excerptZh,date,category,categoryZh,slug,readTime,content,contentZh FROM posts WHERE slug = ? LIMIT 1",
  )
    .bind(slug)
    .first<BlogPost>();
  return row ?? null;
}

async function searchPosts(env: Env, q: string) {
  const like = `%${q}%`;
  const { results } = await env.DB.prepare(
    "SELECT title,titleZh,excerpt,excerptZh,date,category,categoryZh,slug,readTime,content,contentZh FROM posts WHERE title LIKE ? OR titleZh LIKE ? OR excerpt LIKE ? OR excerptZh LIKE ? OR content LIKE ? OR contentZh LIKE ? ORDER BY rowid DESC LIMIT 50",
  )
    .bind(like, like, like, like, like, like)
    .all<BlogPost>();
  return results;
}

async function upsertPosts(env: Env, posts: BlogPost[]) {
  const now = new Date().toISOString();
  const batch = posts.map((p) =>
    env.DB.prepare(
      "INSERT INTO posts (slug,title,titleZh,excerpt,excerptZh,date,category,categoryZh,readTime,content,contentZh,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(slug) DO UPDATE SET title=excluded.title,titleZh=excluded.titleZh,excerpt=excluded.excerpt,excerptZh=excluded.excerptZh,date=excluded.date,category=excluded.category,categoryZh=excluded.categoryZh,readTime=excluded.readTime,content=excluded.content,contentZh=excluded.contentZh,updatedAt=excluded.updatedAt",
    ).bind(
      p.slug,
      p.title,
      p.titleZh,
      p.excerpt,
      p.excerptZh,
      p.date,
      p.category,
      p.categoryZh,
      p.readTime,
      p.content,
      p.contentZh,
      now,
    ),
  );

  await env.DB.batch(batch);
}

function withCors(request: Request, response: Response) {
  const origin = request.headers.get("Origin") || "*";
  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", origin);
  headers.set("Vary", "Origin");
  headers.set("Access-Control-Allow-Headers", "content-type, cf-access-jwt-assertion");
  headers.set("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  return new Response(response.body, { status: response.status, headers });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return withCors(request, new Response(null, { status: 204 }));
    }

    const url = new URL(request.url);
    if (!url.pathname.startsWith("/api/")) {
      return new Response("Not Found", { status: 404 });
    }

    try {
      if (request.method === "GET" && url.pathname === "/api/posts") {
        const posts = await listPosts(env);
        return withCors(request, json(posts));
      }

      if (request.method === "GET" && url.pathname.startsWith("/api/posts/")) {
        const slug = decodeURIComponent(url.pathname.slice("/api/posts/".length));
        const post = await getPostBySlug(env, slug);
        if (!post) return withCors(request, json({ error: "not_found" }, { status: 404 }));
        return withCors(request, json(post));
      }

      if (request.method === "GET" && url.pathname === "/api/search") {
        const q = (url.searchParams.get("q") ?? "").trim();
        if (!q) return withCors(request, json([]));
        const results = await searchPosts(env, q);
        return withCors(request, json(results));
      }

      if (url.pathname === "/api/admin/posts") {
        const admin = await requireAdmin(request, env);
        if (!admin.ok) {
          return withCors(request, json({ error: "unauthorized", reason: admin.reason }, { status: 401 }));
        }

        if (request.method === "PUT") {
          const body = (await request.json()) as unknown;
          if (!Array.isArray(body)) {
            return withCors(request, json({ error: "bad_request" }, { status: 400 }));
          }
          const posts = body as BlogPost[];
          if (posts.some((p) => !p.slug)) {
            return withCors(request, json({ error: "slug_required" }, { status: 400 }));
          }

          await upsertPosts(env, posts);
          return withCors(request, json({ ok: true }));
        }
      }

      return withCors(request, json({ error: "not_found" }, { status: 404 }));
    } catch (e) {
      return withCors(
        request,
        json(
          { error: "internal_error", message: e instanceof Error ? e.message : "unknown" },
          { status: 500 },
        ),
      );
    }
  },
};
