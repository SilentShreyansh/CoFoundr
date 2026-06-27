import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ShadingType,
} from "docx";
import { writeFileSync } from "fs";

const BRAND = "2563EB";
const MUTED = "6B7280";
const GREEN = "059669";

// ---------- helpers ----------
const h1 = (text) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 320, after: 140 },
    children: [new TextRun({ text, bold: true, color: BRAND, size: 30 })],
  });

const h2 = (text) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 220, after: 100 },
    children: [new TextRun({ text, bold: true, size: 26 })],
  });

const p = (text, opts = {}) =>
  new Paragraph({
    spacing: { after: 100 },
    children: Array.isArray(text) ? text : [new TextRun({ text, size: 22, ...opts })],
  });

const bullet = (text, level = 0) =>
  new Paragraph({
    bullet: { level },
    spacing: { after: 60 },
    children: Array.isArray(text) ? text : [new TextRun({ text, size: 22 })],
  });

const labelRun = (label, body) => [
  new TextRun({ text: `${label}: `, bold: true, size: 22 }),
  new TextRun({ text: body, size: 22 }),
];

const badge = (text, color) =>
  new Paragraph({
    spacing: { after: 80 },
    children: [
      new TextRun({
        text: `  ${text}  `,
        bold: true,
        color: "FFFFFF",
        size: 20,
        shading: { type: ShadingType.SOLID, color },
      }),
    ],
  });

function table(headers, rows, widths) {
  const border = { style: BorderStyle.SINGLE, size: 1, color: "D1D5DB" };
  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map(
      (hdr) =>
        new TableCell({
          shading: { type: ShadingType.SOLID, color: "EFF6FF" },
          margins: { top: 60, bottom: 60, left: 100, right: 100 },
          children: [new Paragraph({ children: [new TextRun({ text: hdr, bold: true, size: 20 })] })],
        }),
    ),
  });
  const bodyRows = rows.map(
    (cells) =>
      new TableRow({
        children: cells.map(
          (cell, i) =>
            new TableCell({
              width: widths ? { size: widths[i], type: WidthType.PERCENTAGE } : undefined,
              margins: { top: 50, bottom: 50, left: 100, right: 100 },
              children: [new Paragraph({ children: [new TextRun({ text: cell, size: 20 })] })],
            }),
        ),
      }),
  );
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: { top: border, bottom: border, left: border, right: border, insideHorizontal: border, insideVertical: border },
    rows: [headerRow, ...bodyRows],
  });
}

const spacer = () => new Paragraph({ children: [new TextRun({ text: "", size: 10 })] });

// ---------- content ----------
const c = [];

c.push(
  new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "CoFoundr", bold: true, size: 56, color: BRAND })] }),
  new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "Remaining Work & Outstanding Items", bold: true, size: 32 })] }),
  new Paragraph({
    spacing: { after: 240 },
    children: [new TextRun({ text: "Status report — updated 14 June 2026 (revision 2)", italics: true, color: MUTED, size: 20 })],
  }),
);

// 1. Executive summary
c.push(
  h1("1. Executive Summary"),
  p("All 8 build slices plus a post-spec hardening batch are implemented. The project compiles cleanly (`tsc --noEmit` and `npm run build` pass across 31 routes), and there are now 19 passing Vitest unit tests — the first code in the project that is actually executed rather than only type-checked."),
  p("Since the first revision of this report, a large share of the previously-listed work has been completed (see Section 2). The remaining work has therefore narrowed to four themes:"),
  bullet("Running the app against a real PostgreSQL database and fixing the runtime bugs that first contact will surface."),
  bullet("Swapping development placeholders (local file storage, console-only email) for real providers + their API keys."),
  bullet("Deeper testing (integration + end-to-end) beyond the new unit tests."),
  bullet("A few unbuilt features (group chat) and polish items."),
  spacer(),
);

// 2. Recently completed
c.push(
  h1("2. Completed Since the Previous Report"),
  badge("DONE — build + typecheck green; unit tests pass", GREEN),
  p("These items from revision 1 are now implemented and no longer outstanding:"),
  table(
    ["Item", "Notes"],
    [
      ["Follow / unfollow", "Server action + FollowButton on profiles, with FOLLOW notification"],
      ["Share post", "Native share sheet with clipboard fallback"],
      ["Advanced search filters", "Industry / stage / tag controls wired into the feed query"],
      ["Live notification push", "lib/notify.ts fires Pusher events on a private per-user channel; nav bell subscribes (polling fallback remains)"],
      ["Cloudinary storage (code)", "Implemented behind STORAGE_PROVIDER in lib/storage.ts (still needs keys + a real test — see 3.2)"],
      ["Rate limiting (baseline)", "In-memory limiter on register / password-reset / upload (needs a shared store for prod — see 4)"],
      ["Security headers + CSP", "Added in next.config.mjs"],
      ["loading / error / not-found", "Graceful app states added"],
      ["Dynamic OG / SEO metadata", "generateMetadata on post + profile pages"],
      ["prisma.config.ts", "Replaces deprecated package.json#prisma key; deprecation warning gone"],
      ["CI workflow", "GitHub Actions: typecheck + test + build"],
      ["Unit tests (Vitest)", "19 tests passing — labels, scoring, Zod schemas (actually executed)"],
    ],
    [30, 70],
  ),
  spacer(),
);

// 3. P0
c.push(
  h1("3. Still Outstanding — Critical (P0)"),
  badge("P0 — BLOCKING", "DC2626"),
  h2("3.1 Runtime verification against PostgreSQL"),
  p("Unchanged as the #1 item. Nothing has executed against a database yet, so every query, server action, and auth flow is unverified."),
  bullet("Provision Postgres (Neon/Supabase URL or `docker compose up -d`)."),
  bullet("Run `npm run db:push` then `npm run db:seed`; run `npm run dev` and walk every flow."),
  bullet("Replace `prisma db push` with migration history (`prisma migrate dev` / `migrate deploy`) before production."),
  bullet("Fix runtime mismatches uncovered (query shapes vs. UI, server-action error paths, session issuance)."),
  h2("3.2 Production image storage (Cloudinary) — configure & test"),
  p("The Cloudinary code path is written behind STORAGE_PROVIDER, but it has never run. Local /public/uploads will NOT persist on Vercel (read-only, ephemeral filesystem)."),
  bullet([...labelRun("Action", "Create a Cloudinary account, set CLOUDINARY_* + STORAGE_PROVIDER=cloudinary, and verify an upload end-to-end.")]),
  h2("3.3 Transactional email — configure a provider"),
  p("Verification + password-reset emails are logged to the server console when no SMTP is set."),
  bullet([...labelRun("Action", "Configure SMTP or Resend/Postmark/SES via the EMAIL_* env vars (logic exists in src/lib/mail.ts).")]),
  spacer(),
);

// 4. P1
c.push(
  h1("4. Still Outstanding — Required for Launch (P1)"),
  badge("P1", "D97706"),
  table(
    ["Item", "Current state", "What's left"],
    [
      ["Integration + E2E tests", "19 unit tests pass", "API-route tests + Playwright journeys (signup→login, idea→publish, apply→accept, messaging)"],
      ["Distributed rate limiting", "In-memory baseline done", "Move to a shared store (Upstash Redis) so limits hold across serverless instances"],
      ["DB migration history", "Using db push", "Adopt prisma migrate for tracked, reversible schema changes"],
      ["Serverless DB pooling", "Single client", "Use Neon pooler / Prisma Accelerate / PgBouncer to avoid connection exhaustion on Vercel"],
      ["Group chats", "1:1 messaging complete", "Group creation, naming, multi-party UI (schema already supports isGroup)"],
      ["Error monitoring", "console.error only", "Add Sentry + structured logging"],
      ["Email verification gate", "Users can log in unverified", "Optionally require verification before key actions"],
      ["Admin depth", "Bans, delete, reports, stats", "Bulk actions, spam heuristics, richer platform analytics/charts"],
    ],
    [24, 30, 46],
  ),
  spacer(),
);

// 5. P2
c.push(
  h1("5. Still Outstanding — Polish (P2)"),
  badge("P2", "059669"),
  bullet("Followers / following list pages (counts exist; no list UI yet)."),
  bullet("Founder analytics charts / time-series trends."),
  bullet("New-user onboarding; notification preferences and email digests."),
  bullet("Chat history pagination / virtualization (currently last 100 messages)."),
  bullet("Repost-style sharing, internationalization, timezone-aware timestamps."),
  bullet("Optional: migrate generated docx scripts and remove the temporary `docx` dev install once reports are final."),
  spacer(),
);

// 6. Deployment checklist
c.push(
  h1("6. Deployment Checklist (Vercel)"),
  table(
    ["#", "Step", "Status"],
    [
      ["1", "Provision Postgres with a pooled connection", "To do"],
      ["2", "Run prisma migrate deploy (or db push for first deploy)", "To do"],
      ["3", "Seed initial data if desired", "To do"],
      ["4", "Set all env vars in Vercel project settings", "To do"],
      ["5", "Configure Google + GitHub OAuth redirect URIs", "To do"],
      ["6", "Set CLOUDINARY_* + STORAGE_PROVIDER=cloudinary (code ready)", "Config only"],
      ["7", "Set up Pusher (optional, live messaging — code ready)", "Config only"],
      ["8", "Configure email provider (code ready)", "Config only"],
      ["9", "Set CRON_SECRET; confirm weekly leaderboard cron (vercel.json ready)", "Config only"],
      ["10", "Smoke-test every flow on the deployed URL", "To do"],
    ],
    [8, 72, 20],
  ),
  spacer(),
);

// 7. Env checklist
c.push(
  h1("7. Environment Variables Checklist"),
  table(
    ["Variable", "Required", "Purpose"],
    [
      ["DATABASE_URL", "Yes", "Postgres connection (pooled for serverless)"],
      ["AUTH_SECRET", "Yes", "Session/JWT signing — long random value"],
      ["AUTH_URL", "Yes (prod)", "Canonical app URL for Auth.js"],
      ["AUTH_GOOGLE_ID / _SECRET", "For Google login", "Google OAuth credentials"],
      ["AUTH_GITHUB_ID / _SECRET", "For GitHub login", "GitHub OAuth credentials"],
      ["STORAGE_PROVIDER + CLOUDINARY_*", "Yes (prod)", "Persistent image storage"],
      ["EMAIL_SERVER_* / EMAIL_FROM", "Yes (prod)", "Verification + reset emails"],
      ["PUSHER_* / NEXT_PUBLIC_PUSHER_*", "Optional", "Live messaging + notification push"],
      ["CRON_SECRET", "Recommended", "Secures the weekly leaderboard cron route"],
      ["NEXT_PUBLIC_APP_URL", "Yes", "Email links and metadata"],
    ],
    [30, 22, 48],
  ),
  spacer(),
  p(
    "Summary: the codebase is feature-complete, hardened, build-green, and now has its first passing tests. The path to launch is: (1) run against Postgres and fix runtime bugs, (2) configure Cloudinary + a real email provider (code is ready), (3) add distributed rate limiting + integration/E2E tests, then deploy. Group chat and the Section 5 items are post-launch.",
    { italics: true, color: MUTED },
  ),
);

const doc = new Document({
  styles: { default: { document: { run: { font: "Calibri" } } } },
  sections: [
    {
      properties: { page: { margin: { top: 1000, bottom: 1000, left: 1000, right: 1000 } } },
      children: c,
    },
  ],
});

const buffer = await Packer.toBuffer(doc);
writeFileSync("D:/Pratice/CoFoundr-Remaining-Work.docx", buffer);
console.log("Updated D:/Pratice/CoFoundr-Remaining-Work.docx");
