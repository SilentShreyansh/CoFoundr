import "dotenv/config";
import { PrismaClient, StartupStage, ExperienceLevel, TeamRole, ApplicationType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const SKILLS = [
  "React", "Next.js", "TypeScript", "Node.js", "Python", "Go", "Rust",
  "UI Design", "UX Research", "Product Management", "Growth Marketing",
  "SEO", "Sales", "Fundraising", "Data Science", "Machine Learning",
  "DevOps", "Mobile", "Branding", "Content",
];

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function main() {
  console.log("🌱 Seeding CoFoundr...");

  // Skills
  const skills = await Promise.all(
    SKILLS.map((name) =>
      prisma.skill.upsert({
        where: { slug: slugify(name) },
        update: {},
        create: { name, slug: slugify(name) },
      }),
    ),
  );
  const skillByName = Object.fromEntries(skills.map((s) => [s.name, s]));

  const passwordHash = await bcrypt.hash("password123", 10);

  // Users
  const usersData = [
    {
      name: "Ada Founder",
      username: "ada",
      email: "ada@cofoundr.dev",
      role: "ADMIN" as const,
      headline: "Serial founder · ex-fintech",
      bio: "Building the rails for the next generation of startups.",
      location: "San Francisco, CA",
      experienceLevel: ExperienceLevel.EXPERT,
      interests: ["Fintech", "AI", "Developer Tools"],
      skills: ["Product Management", "Fundraising", "TypeScript"],
    },
    {
      name: "Bruno Dev",
      username: "bruno",
      email: "bruno@cofoundr.dev",
      role: "USER" as const,
      headline: "Full-stack engineer looking for a technical co-founder role",
      bio: "I ship. Next.js, Node, Postgres. Love 0→1 products.",
      location: "Lisbon, Portugal",
      experienceLevel: ExperienceLevel.ADVANCED,
      interests: ["Developer Tools", "SaaS"],
      skills: ["React", "Next.js", "Node.js", "TypeScript"],
    },
    {
      name: "Carmen Design",
      username: "carmen",
      email: "carmen@cofoundr.dev",
      role: "USER" as const,
      headline: "Product designer · brand & systems",
      bio: "Design that converts. Previously at two seed-stage startups.",
      location: "Berlin, Germany",
      experienceLevel: ExperienceLevel.ADVANCED,
      interests: ["Design Tools", "Marketplaces"],
      skills: ["UI Design", "UX Research", "Branding"],
    },
    {
      name: "Diego Growth",
      username: "diego",
      email: "diego@cofoundr.dev",
      role: "USER" as const,
      headline: "Growth marketer · 0→100k users",
      bio: "Paid, organic, and lifecycle. I find the channel that works.",
      location: "Austin, TX",
      experienceLevel: ExperienceLevel.INTERMEDIATE,
      interests: ["Consumer", "Creator Economy"],
      skills: ["Growth Marketing", "SEO", "Content"],
    },
  ];

  const users = [];
  for (const u of usersData) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        name: u.name,
        username: u.username,
        email: u.email,
        emailVerified: new Date(),
        passwordHash,
        role: u.role,
        image: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(u.name)}`,
        profile: {
          create: {
            headline: u.headline,
            bio: u.bio,
            location: u.location,
            experienceLevel: u.experienceLevel,
            startupInterests: u.interests,
            linkedinUrl: `https://linkedin.com/in/${u.username}`,
            githubUrl: `https://github.com/${u.username}`,
          },
        },
        skills: {
          create: u.skills.map((name) => ({ skillId: skillByName[name].id })),
        },
      },
    });
    users.push(user);
  }
  const [ada, bruno, carmen, diego] = users;

  // Posts (startup ideas)
  const postsData = [
    {
      author: ada,
      title: "OpenLedger — open-source accounting for indie startups",
      description:
        "Most accounting tools are bloated and expensive. OpenLedger is a developer-first, open-source ledger with a clean API and a great UI. Looking for a design partner and a growth lead.",
      industry: "Fintech",
      stage: StartupStage.MVP,
      skillsNeeded: ["UI Design", "Growth Marketing"],
      teamSizeNeeded: 3,
      tags: ["fintech", "open-source", "b2b"],
    },
    {
      author: bruno,
      title: "ShipRoom — async standups for remote engineering teams",
      description:
        "Slack standups are noise. ShipRoom turns commits, PRs, and tickets into a daily digest your team actually reads. MVP is live. Need a co-founder who owns design + GTM.",
      industry: "Developer Tools",
      stage: StartupStage.EARLY_TRACTION,
      skillsNeeded: ["UI Design", "Sales"],
      teamSizeNeeded: 2,
      tags: ["devtools", "remote", "productivity"],
    },
    {
      author: carmen,
      title: "Palette — a marketplace for vetted brand designers",
      description:
        "Hiring a brand designer is a coin flip. Palette curates the top 5% and matches founders to them with fixed-scope sprints. Looking for a technical co-founder to build the matching engine.",
      industry: "Marketplaces",
      stage: StartupStage.IDEA,
      skillsNeeded: ["Next.js", "Node.js"],
      teamSizeNeeded: 2,
      tags: ["marketplace", "design", "creator"],
    },
  ];

  const posts = [];
  for (const p of postsData) {
    const post = await prisma.post.create({
      data: {
        authorId: p.author.id,
        title: p.title,
        description: p.description,
        industry: p.industry,
        stage: p.stage,
        skillsNeeded: p.skillsNeeded,
        teamSizeNeeded: p.teamSizeNeeded,
        tags: p.tags,
        status: "PUBLISHED",
        publishedAt: new Date(),
        viewCount: Math.floor(Math.random() * 400) + 50,
      },
    });
    posts.push(post);
  }

  // Social interactions
  await prisma.like.createMany({
    data: [
      { postId: posts[0].id, userId: bruno.id },
      { postId: posts[0].id, userId: carmen.id },
      { postId: posts[1].id, userId: ada.id },
      { postId: posts[1].id, userId: diego.id },
      { postId: posts[2].id, userId: bruno.id },
    ],
    skipDuplicates: true,
  });

  await prisma.comment.createMany({
    data: [
      { postId: posts[0].id, authorId: bruno.id, content: "Love this. Happy to help on the API side." },
      { postId: posts[1].id, authorId: carmen.id, content: "This is exactly the GTM problem I want to solve. Let's chat." },
      { postId: posts[2].id, authorId: bruno.id, content: "The matching engine sounds fun — I'd build that." },
    ],
  });

  await prisma.savedPost.createMany({
    data: [
      { postId: posts[1].id, userId: ada.id },
      { postId: posts[2].id, userId: diego.id },
    ],
    skipDuplicates: true,
  });

  // Team + application
  await prisma.startupTeam.create({
    data: { postId: posts[0].id, userId: ada.id, role: TeamRole.COFOUNDER },
  });

  await prisma.application.create({
    data: {
      postId: posts[1].id,
      applicantId: carmen.id,
      type: ApplicationType.COFOUNDER,
      role: TeamRole.DESIGNER,
      message: "I'd love to own design and GTM for ShipRoom.",
    },
  });

  // A notification + a chat
  await prisma.notification.create({
    data: {
      userId: bruno.id,
      actorId: carmen.id,
      type: "COMMENT",
      entityId: posts[1].id,
      message: "Carmen commented on your idea ShipRoom",
    },
  });

  const chat = await prisma.chat.create({
    data: {
      participants: {
        create: [{ userId: bruno.id }, { userId: carmen.id }],
      },
      messages: {
        create: [
          { senderId: carmen.id, content: "Hey! Saw ShipRoom — would love to help." },
          { senderId: bruno.id, content: "Awesome, let's set up a call this week." },
        ],
      },
    },
  });

  console.log(`✅ Seeded ${users.length} users, ${posts.length} posts, 1 chat (${chat.id}).`);
  console.log("   Login with any seeded email + password: password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
