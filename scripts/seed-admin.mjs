// One-time script to create the first admin user (and sample journal posts).
// Usage:
//   node --env-file=.env.local scripts/seed-admin.mjs
//
// Requires MONGODB_URI, ADMIN_EMAIL, ADMIN_PASSWORD to be set (in .env.local or the environment).

import mongoose from "mongoose";
import bcryptjs from "bcryptjs";

const { MONGODB_URI, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

if (!MONGODB_URI) {
  console.error("Missing MONGODB_URI. Set it in .env.local or pass it as an env var.");
  process.exit(1);
}
if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error("Missing ADMIN_EMAIL or ADMIN_PASSWORD. Set them in .env.local or pass them as env vars.");
  process.exit(1);
}

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin", "editor"], default: "editor" },
  },
  { timestamps: true }
);

const PostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    metaTitle: String,
    metaDescription: String,
    focusKeyword: String,
    canonicalUrl: String,
    noIndex: { type: Boolean, default: false },
    noFollow: { type: Boolean, default: false },
    ogImage: String,
    schemaType: { type: String, enum: ["Article", "BlogPosting", "NewsArticle"], default: "BlogPosting" },
    publishedAt: { type: Date, required: true },
    excerpt: { type: String, required: true, maxlength: 300 },
    coverImage: { url: String, alt: String },
    content: { type: String, default: "" },
    tags: { type: [String], default: [] },
    readTime: { type: Number, default: 5 },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

async function main() {
  await mongoose.connect(MONGODB_URI);
  const User = mongoose.models.User || mongoose.model("User", UserSchema);
  const Post = mongoose.models.Post || mongoose.model("Post", PostSchema);

  let admin = await User.findOne({ email: ADMIN_EMAIL.toLowerCase().trim() });

  if (admin) {
    console.log(`Admin user already exists: ${admin.email}`);
  } else {
    const passwordHash = await bcryptjs.hash(ADMIN_PASSWORD, 12);
    admin = await User.create({
      name: "Admin",
      email: ADMIN_EMAIL.toLowerCase().trim(),
      passwordHash,
      role: "admin",
    });
    console.log(`Created admin user: ${admin.email}`);
  }

  const postCount = await Post.countDocuments();
  if (postCount > 0) {
    console.log(`Skipping sample posts — ${postCount} post(s) already exist.`);
  } else {
    await Post.insertMany([
      {
        title: "The Art of Oud: Why Khayal Builds Fragrance Around Imagination",
        slug: "the-art-of-oud",
        metaTitle: "The Art of Oud | Khayal Journal",
        metaDescription:
          "Discover why oud remains the soul of luxury perfumery and how Khayal transforms raw resin into liquid imagination.",
        focusKeyword: "oud perfume",
        excerpt:
          "Discover why oud remains the soul of luxury perfumery and how Khayal transforms raw resin into liquid imagination.",
        content:
          "<p>Oud has been treasured for centuries across the Middle East and South Asia. At Khayal, we source the most resonant resins and let imagination guide the composition.</p>",
        publishedAt: new Date("2026-08-01"),
        readTime: 8,
        tags: ["Ingredients"],
        status: "published",
        authorId: admin._id,
        schemaType: "BlogPosting",
      },
      {
        title: "How to Choose a Signature Scent Without Testing Fifty Bottles",
        slug: "how-to-choose-signature-scent",
        metaTitle: "How to Choose a Signature Scent | Khayal Journal",
        metaDescription:
          "A practical guide to finding a fragrance that feels like an extension of your personality, mood, and memory.",
        focusKeyword: "signature scent",
        excerpt:
          "A practical guide to finding a fragrance that feels like an extension of your personality, mood, and memory.",
        content:
          "<p>Start with what you already love: the smell of rain, old books, sandalwood incense. A signature scent is a memory you choose to wear.</p>",
        publishedAt: new Date("2026-08-05"),
        readTime: 6,
        tags: ["Scent Guides"],
        status: "published",
        authorId: admin._id,
        schemaType: "BlogPosting",
      },
      {
        title: "The Ritual of Gifting Fragrance: Notes That Speak for You",
        slug: "ritual-of-gifting-fragrance",
        metaTitle: "The Ritual of Gifting Fragrance | Khayal Journal",
        metaDescription:
          "Why perfume is the most intimate gift you can give, and how to select one that carries meaning beyond the bottle.",
        focusKeyword: "perfume gift",
        excerpt:
          "Why perfume is the most intimate gift you can give, and how to select one that carries meaning beyond the bottle.",
        content:
          "<p>Fragrance is invisible, but it lingers. The right perfume says something the giver cannot put into words.</p>",
        publishedAt: new Date("2026-08-08"),
        readTime: 5,
        tags: ["Gifting"],
        status: "published",
        authorId: admin._id,
        schemaType: "BlogPosting",
      },
    ]);
    console.log("Created 3 sample journal posts.");
  }

  await mongoose.disconnect();
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
