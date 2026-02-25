import { getVercelApp } from "../src/init/server.js";

export default async function handler(req, res) {
  try {
    const app = await getVercelApp();
    return app(req, res);
  } catch (error) {
    const message = error?.message || "Server initialization failed";
    const requestId =
      req?.headers?.["x-vercel-id"] || req?.headers?.["x-request-id"] || "n/a";
    const acceptsHtml = String(req?.headers?.accept || "").includes("text/html");

    if (acceptsHtml) {
      res.statusCode = 503;
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.end(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ClickNow API Status</title>
    <style>
      :root { --bg:#0b1020; --card:#121a33; --line:#25345e; --ok:#21c07a; --warn:#ffb020; --txt:#e9efff; --muted:#9fb0d9; }
      *{box-sizing:border-box} body{margin:0;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto;background:radial-gradient(circle at 20% 10%,#1e2b54,transparent 45%),var(--bg);color:var(--txt)}
      .wrap{max-width:920px;margin:40px auto;padding:0 16px}
      .card{background:linear-gradient(180deg,#162248,#111833);border:1px solid var(--line);border-radius:16px;padding:20px}
      h1{margin:0 0 8px;font-size:28px} p{margin:0;color:var(--muted)}
      .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin-top:16px}
      .pill{padding:10px 12px;border:1px solid var(--line);border-radius:10px;background:#0f1730}
      .ok{color:var(--ok)} .warn{color:var(--warn)}
      .actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:16px}
      a{display:inline-block;padding:10px 12px;border-radius:10px;text-decoration:none;color:#0f1730;background:#d5e3ff;font-weight:600}
      code{display:block;overflow:auto;margin-top:12px;padding:12px;border-radius:10px;background:#0c1228;border:1px solid var(--line);color:#c6d5ff}
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="card">
        <h1>ClickNow API</h1>
        <p>Serverless runtime started, but app bootstrap is currently unavailable.</p>
        <div class="grid">
          <div class="pill"><strong class="warn">Status:</strong> degraded</div>
          <div class="pill"><strong>HTTP:</strong> 503</div>
          <div class="pill"><strong>Request ID:</strong> ${String(requestId)}</div>
          <div class="pill"><strong class="ok">Platform:</strong> Vercel</div>
        </div>
        <div class="actions">
          <a href="/health">/health</a>
          <a href="/api/v1/health">/api/v1/health</a>
        </div>
        <code>${String(message)}</code>
      </div>
    </div>
  </body>
</html>`);
      return;
    }

    res.status(503).json({
      success: false,
      message: "Service unavailable during startup",
      error: message,
      requestId,
      timestamp: new Date().toISOString(),
    });
  }
}
