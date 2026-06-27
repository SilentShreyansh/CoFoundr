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
const CODE_BG = "F3F4F6";

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
    spacing: { before: 220, after: 90 },
    children: [new TextRun({ text, bold: true, size: 25 })],
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

const numbered = (text, ref = "steps") =>
  new Paragraph({
    numbering: { reference: ref, level: 0 },
    spacing: { after: 60 },
    children: Array.isArray(text) ? text : [new TextRun({ text, size: 22 })],
  });

const bold = (label, body) => [
  new TextRun({ text: `${label}: `, bold: true, size: 22 }),
  new TextRun({ text: body, size: 22 }),
];

// Code block: one shaded paragraph, monospace, lines separated by soft breaks.
function code(lines) {
  const arr = Array.isArray(lines) ? lines : [lines];
  const runs = [];
  arr.forEach((line, i) => {
    if (i > 0) runs.push(new TextRun({ break: 1 }));
    runs.push(new TextRun({ text: line, font: "Consolas", size: 20 }));
  });
  return new Paragraph({
    shading: { type: ShadingType.SOLID, color: CODE_BG },
    spacing: { before: 60, after: 120 },
    border: {
      top: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" },
      left: { style: BorderStyle.SINGLE, size: 6, color: BRAND },
      right: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" },
    },
    children: runs,
  });
}

const mono = (text) => new TextRun({ text, font: "Consolas", size: 20 });

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
          (c, i) =>
            new TableCell({
              width: widths ? { size: widths[i], type: WidthType.PERCENTAGE } : undefined,
              margins: { top: 50, bottom: 50, left: 100, right: 100 },
              children: [
                new Paragraph({
                  children: [
                    c.startsWith("`") && c.endsWith("`")
                      ? mono(c.slice(1, -1))
                      : new TextRun({ text: c, size: 20 }),
                  ],
                }),
              ],
            }),
        ),
      }),
  );
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: { ...{ top: border, bottom: border, left: border, right: border }, insideHorizontal: border, insideVertical: border },
    rows: [headerRow, ...bodyRows],
  });
}

const spacer = () => new Paragraph({ children: [new TextRun({ text: "", size: 10 })] });

// ---------- content ----------
const c = [];

c.push(
  new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "CoFoundr", bold: true, size: 56, color: BRAND })] }),
  new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "How to Run the Project", bold: true, size: 32 })] }),
  new Paragraph({
    spacing: { after: 240 },
    children: [new TextRun({ text: "Local setup & run guide — Next.js 15 · Prisma · PostgreSQL · Auth.js", italics: true, color: MUTED, size: 20 })],
  }),
);

// 0. TL;DR
c.push(
  h1("0. Quick Start (TL;DR)"),
  p("If you already have Node 20+ and a PostgreSQL database ready, these five commands get you running:"),
  code([
    "npm install",
    "# edit .env so DATABASE_URL points at your Postgres",
    "npm run db:push      # create the database schema",
    "npm run db:seed      # load demo users + ideas",
    "npm run dev          # start http://localhost:3000",
  ]),
  p([
    new TextRun({ text: "Then log in at ", size: 22 }),
    mono("http://localhost:3000/login"),
    new TextRun({ text: " with ", size: 22 }),
    mono("ada@cofoundr.dev"),
    new TextRun({ text: " / ", size: 22 }),
    mono("password123"),
    new TextRun({ text: ".", size: 22 }),
  ]),
  p("The rest of this document explains each step in detail and covers the optional integrations.", { italics: true, color: MUTED }),
  spacer(),
);

// 1. Prerequisites
c.push(
  h1("1. Prerequisites"),
  table(
    ["Tool", "Required?", "Notes"],
    [
      ["Node.js 20+ (24 tested)", "Yes", "Includes npm. Check with `node -v`."],
      ["A PostgreSQL 14+ database", "Yes", "Local (Docker), or hosted Neon/Supabase — see Section 3."],
      ["Docker Desktop", "Optional", "Only if you want a local Postgres via docker-compose."],
      ["Google / GitHub OAuth apps", "Optional", "Needed only for social login."],
      ["Pusher account", "Optional", "Enables live chat/typing/presence; polling works without it."],
      ["Cloudinary account", "Optional", "Persistent image storage (required for production)."],
    ],
    [30, 18, 52],
  ),
  spacer(),
);

// 2. Install
c.push(
  h1("2. Install Dependencies"),
  p([...bold("From the project root", "D:\\Pratice")]),
  code(["npm install"]),
  p([
    new TextRun({ text: "This also runs ", size: 22 }),
    mono("prisma generate"),
    new TextRun({ text: " automatically (via the postinstall hook), creating the typed Prisma client.", size: 22 }),
  ]),
  spacer(),
);

// 3. Environment + Database
c.push(
  h1("3. Configure Environment & Database"),
  h2("3.1 Create your .env file"),
  p("Copy the template and fill in values. A .env may already exist for local dev; otherwise:"),
  code(["# PowerShell", "Copy-Item .env.example .env", "", "# macOS / Linux / Git Bash", "cp .env.example .env"]),
  p("The only two variables required to boot are DATABASE_URL and AUTH_SECRET. Generate a secret with:"),
  code(["npx auth secret", "# or: openssl rand -base64 32"]),
  h2("3.2 Choose a database (pick ONE)"),
  p([new TextRun({ text: "Option A — Docker Postgres (matches docker-compose.yml). Easiest if Docker is installed.", bold: true, size: 22 })]),
  code(["docker compose up -d", "# Postgres now listens on localhost:5432 with user/pass/db = cofoundr"]),
  p([new TextRun({ text: "Option B — Hosted Postgres (Neon or Supabase). ~2 minutes, no local install.", bold: true, size: 22 })]),
  bullet("Create a free project at neon.tech or supabase.com."),
  bullet("Copy the connection string into DATABASE_URL in .env (use the pooled URL for serverless/Vercel)."),
  p([new TextRun({ text: "Option C — Existing local Postgres.", bold: true, size: 22 })]),
  bullet([
    new TextRun({ text: "Set DATABASE_URL to your connection string, e.g. ", size: 22 }),
    mono("postgresql://user:pass@localhost:5432/cofoundr?schema=public"),
  ]),
  spacer(),
);

// 4. Schema + seed
c.push(
  h1("4. Create the Schema & Seed Data"),
  p("With the database reachable, push the Prisma schema and load demo content:"),
  code(["npm run db:push     # creates all tables from prisma/schema.prisma", "npm run db:seed     # inserts demo users, ideas, comments, a chat"]),
  p([...bold("Tip", "")]),
  p([
    mono("npm run db:studio"),
    new TextRun({ text: " opens Prisma Studio to browse the data, and ", size: 22 }),
    mono("npm run db:reset"),
    new TextRun({ text: " drops, recreates, and re-seeds everything.", size: 22 }),
  ]),
  spacer(),
);

// 5. Run
c.push(
  h1("5. Run the App"),
  code(["npm run dev"]),
  p([
    new TextRun({ text: "Open ", size: 22 }),
    mono("http://localhost:3000"),
    new TextRun({ text: ". The landing page is public; the app (feed, chat, etc.) requires login.", size: 22 }),
  ]),
  h2("Seeded accounts (password for all: password123)"),
  table(
    ["Email", "Role"],
    [
      ["ada@cofoundr.dev", "Admin (can access /admin)"],
      ["bruno@cofoundr.dev", "User"],
      ["carmen@cofoundr.dev", "User"],
      ["diego@cofoundr.dev", "User"],
    ],
    [55, 45],
  ),
  spacer(),
);

// 6. Optional integrations
c.push(
  h1("6. Optional Integrations"),
  h2("6.1 Google & GitHub login"),
  bullet("Google: create OAuth credentials at console.cloud.google.com → set AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET."),
  bullet("GitHub: create an OAuth app at github.com/settings/developers → set AUTH_GITHUB_ID / AUTH_GITHUB_SECRET."),
  bullet([
    new TextRun({ text: "Authorized redirect URI: ", size: 22 }),
    mono("http://localhost:3000/api/auth/callback/{google|github}"),
  ]),
  h2("6.2 Real-time messaging (Pusher)"),
  p("Without Pusher, chat still works via 4-second polling. To enable instant messages, typing, and presence:"),
  bullet("Create a free app at pusher.com (Channels)."),
  bullet("Set PUSHER_APP_ID, PUSHER_SECRET, NEXT_PUBLIC_PUSHER_KEY, NEXT_PUBLIC_PUSHER_CLUSTER, then restart the dev server."),
  h2("6.3 Image storage (Cloudinary)"),
  p("By default uploads are saved to /public/uploads on the local disk (fine for local dev). For production set STORAGE_PROVIDER=cloudinary and the CLOUDINARY_* keys."),
  h2("6.4 Email (verification & password reset)"),
  p("With no SMTP configured, verification and reset links are printed to the server console (terminal) — perfectly usable in development. Set EMAIL_SERVER_* + EMAIL_FROM to send real email."),
  spacer(),
);

// 7. Scripts reference
c.push(
  h1("7. npm Scripts Reference"),
  table(
    ["Command", "What it does"],
    [
      ["`npm run dev`", "Start the development server (hot reload)"],
      ["`npm run build`", "Generate Prisma client + production build"],
      ["`npm run start`", "Run the production build (after build)"],
      ["`npm run db:push`", "Apply the Prisma schema to the database (no migration history)"],
      ["`npm run db:migrate`", "Create + apply a dev migration"],
      ["`npm run db:seed`", "Load demo data"],
      ["`npm run db:studio`", "Open Prisma Studio (data browser)"],
      ["`npm run db:reset`", "Drop, recreate, and re-seed the database"],
    ],
    [32, 68],
  ),
  spacer(),
);

// 8. Try it
c.push(
  h1("8. A 2-Minute Walkthrough"),
  numbered("Log in as bruno@cofoundr.dev and open the Feed — try the Latest / Trending / Most-liked tabs."),
  numbered("Click ‘New idea’, fill it in, and Publish. You’re redirected to the idea page."),
  numbered("Like it, add a comment, and Save it (check the Saved tab)."),
  numbered("Open another user’s profile and hit ‘Message’ to start a chat."),
  numbered("On an idea you don’t own, click ‘Apply to join’, then log in as the founder to Accept it under ‘Review applications’."),
  numbered("Visit Top (leaderboard), Search, Discover (AI suggestions), and Dashboard (analytics)."),
  numbered("Log in as ada@cofoundr.dev to open the Admin dashboard."),
  spacer(),
);

// 9. Troubleshooting
c.push(
  h1("9. Troubleshooting"),
  table(
    ["Symptom", "Likely cause & fix"],
    [
      ["PrismaClientInitializationError / can't reach database", "DATABASE_URL is wrong or Postgres isn't running. Start Docker (`docker compose up -d`) or fix the URL."],
      ["‘relation does not exist’ errors", "Schema not pushed yet — run `npm run db:push`."],
      ["Login always fails", "Make sure you ran `npm run db:seed`, and AUTH_SECRET is set in .env."],
      ["OAuth button errors", "Google/GitHub env vars missing or redirect URI mismatch. Use email/password instead, or configure them."],
      ["Uploaded images vanish on Vercel", "Local storage doesn't persist on serverless — switch STORAGE_PROVIDER to cloudinary."],
      ["Chat not instant", "Expected without Pusher (it polls). Add Pusher keys for realtime."],
      ["Port 3000 in use", "Run `npm run dev -- -p 3001` or free the port."],
    ],
    [38, 62],
  ),
  spacer(),
);

// 10. Production
c.push(
  h1("10. Production Build & Deploy (Vercel)"),
  numbered("Push the repo to GitHub and import it into Vercel.", "prod"),
  numbered("Provision a Postgres database (Neon/Supabase/Vercel Postgres) with a pooled connection and set DATABASE_URL.", "prod"),
  numbered("Set AUTH_SECRET, AUTH_URL, OAuth, Cloudinary, Pusher, EMAIL_*, and CRON_SECRET in Vercel project settings.", "prod"),
  numbered("Update OAuth redirect URIs to the production domain.", "prod"),
  numbered("The build command runs prisma generate automatically; run `prisma migrate deploy` (or db push for the first deploy).", "prod"),
  numbered("Verify the weekly leaderboard cron (configured in vercel.json) and smoke-test every flow on the live URL.", "prod"),
  spacer(),
  p("Verify a production build locally any time with:", { italics: true, color: MUTED }),
  code(["npm run build", "npm run start"]),
);

// numbering config
const numbering = {
  config: [
    {
      reference: "steps",
      levels: [{ level: 0, format: "decimal", text: "%1.", alignment: "start", style: { paragraph: { indent: { left: 460, hanging: 260 } } } }],
    },
    {
      reference: "prod",
      levels: [{ level: 0, format: "decimal", text: "%1.", alignment: "start", style: { paragraph: { indent: { left: 460, hanging: 260 } } } }],
    },
  ],
};

const doc = new Document({
  numbering,
  styles: { default: { document: { run: { font: "Calibri" } } } },
  sections: [
    {
      properties: { page: { margin: { top: 1000, bottom: 1000, left: 1000, right: 1000 } } },
      children: c,
    },
  ],
});

const buffer = await Packer.toBuffer(doc);
writeFileSync("D:/Pratice/CoFoundr-How-To-Run.docx", buffer);
console.log("Wrote D:/Pratice/CoFoundr-How-To-Run.docx");
