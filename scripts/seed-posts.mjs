// Seeds substantial, linkable journal articles for SEO.
// Usage:
//   node --env-file=.env.local scripts/seed-posts.mjs
//
// Requires MONGODB_URI. Uses the first admin/editor user as the author.
// Existing slugs are skipped, so it is safe to re-run.

import mongoose from "mongoose";

const { MONGODB_URI } = process.env;

if (!MONGODB_URI) {
  console.error("Missing MONGODB_URI. Set it in .env.local or pass it as an env var.");
  process.exit(1);
}

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

const ARTICLES = [
  {
    title: "Attar vs Perfume vs Eau de Parfum: What Is the Difference?",
    slug: "attar-vs-perfume-vs-eau-de-parfum",
    metaTitle: "Attar vs Perfume vs EDP: Complete Difference Guide | Khayal Journal",
    metaDescription:
      "Attar, eau de parfum, and eau de toilette explained — concentration, longevity, how each is made, and which one suits your skin and lifestyle.",
    focusKeyword: "attar vs perfume",
    excerpt:
      "Attar, eau de parfum, and eau de toilette explained — concentration, longevity, how each is made, and which suits your skin and lifestyle.",
    content: `<p>Walk into any fragrance discussion and three words appear constantly: attar, perfume, and eau de parfum. They are not interchangeable — each describes a different concentration, base, and wearing experience. This guide explains the differences so you can choose the right format for how you actually live.</p>

<h2>What Is Attar?</h2>
<p>Attar (also called ittar) is a concentrated, oil-based perfume with no alcohol. Traditionally produced in South Asia and the Middle East, attars are made by distilling aromatic materials — flowers, woods, resins, spices — directly into a base oil, historically sandalwood.</p>
<ul>
<li><strong>Concentration:</strong> Very high — often 20–40% aromatic compounds or pure oil blends.</li>
<li><strong>Base:</strong> Oil (sandalwood, jojoba, or fractionated coconut oil).</li>
<li><strong>Longevity:</strong> 12+ hours on skin; days on fabric.</li>
<li><strong>Projection:</strong> Intimate — sits close to the skin and unfolds slowly.</li>
<li><strong>Application:</strong> A small dab on pulse points; never sprayed.</li>
</ul>
<p>Because attars are alcohol-free, they are gentle on sensitive skin and perform exceptionally well in hot climates — which is why they have remained the preferred fragrance format across Pakistan, India, and the Gulf for centuries.</p>

<h2>What Is Eau de Parfum (EDP)?</h2>
<p>Eau de parfum is the modern luxury format — aromatic compounds dissolved in alcohol, sprayed onto skin and clothing. Most premium designer and niche fragrances are EDPs.</p>
<ul>
<li><strong>Concentration:</strong> 15–20% aromatic compounds.</li>
<li><strong>Base:</strong> Perfumer's alcohol.</li>
<li><strong>Longevity:</strong> 6–10 hours depending on the composition and skin type.</li>
<li><strong>Projection:</strong> Moderate to strong — alcohol carries the scent into the air.</li>
<li><strong>Application:</strong> Sprayed on pulse points, hair, or clothing.</li>
</ul>
<p>The alcohol base is why EDP projects further than attar: the volatile alcohol evaporates quickly and throws the top notes into the air around you. This is the format Khayal uses for its core collection — it gives oud, rose, and musk compositions the diffusion they deserve.</p>

<h2>What Is Eau de Toilette (EDT) and Cologne?</h2>
<p>Moving down the concentration ladder: eau de toilette contains roughly 5–15% aromatic compounds, and eau de cologne only 2–4%. These formats are lighter, fresher, and shorter-lived — typically 3–5 hours for EDT and 1–2 hours for cologne. They suit daytime wear, summer, and people who prefer a scent that whispers rather than speaks.</p>

<h2>Side-by-Side Comparison</h2>
<ul>
<li><strong>Attar:</strong> Oil base, alcohol-free, 12+ hours, intimate projection, dabbed on.</li>
<li><strong>EDP:</strong> Alcohol base, 6–10 hours, moderate-strong projection, sprayed.</li>
<li><strong>EDT:</strong> Alcohol base, 3–5 hours, light projection, sprayed.</li>
<li><strong>Cologne:</strong> Alcohol base, 1–2 hours, very light, sprayed liberally.</li>
</ul>

<h2>Which Should You Choose?</h2>
<p><strong>Choose attar</strong> if you want maximum longevity, have sensitive skin, prefer an intimate scent aura, or wear fragrance for religious occasions where alcohol-free options are preferred.</p>
<p><strong>Choose EDP</strong> if you want a scent that projects into a room, evolves through distinct top-heart-base phases, and can be refreshed with a quick spray. For most people building a modern fragrance wardrobe, EDP is the right everyday format.</p>
<p><strong>Choose EDT or cologne</strong> for the gym, office environments where heavy scent is inappropriate, or hot summer days when you want freshness over depth.</p>

<h2>The Bottom Line</h2>
<p>Neither format is objectively better — they are different tools. Attar is depth and intimacy; EDP is presence and complexity. Many fragrance lovers keep both: an attar for quiet, personal moments and an eau de parfum for when they want their scent to enter the room before they do.</p>`,
    publishedAt: new Date("2026-09-01"),
    readTime: 7,
    tags: ["Scent Guides", "Attar"],
    status: "published",
    schemaType: "BlogPosting",
  },
  {
    title: "Fragrance Notes Explained: Top, Heart, and Base Notes in Perfume",
    slug: "fragrance-notes-explained",
    metaTitle: "Top, Heart & Base Notes Explained | Perfume Guide — Khayal Journal",
    metaDescription:
      "What top, heart, and base notes actually mean, why your perfume smells different after three hours, and how to read a fragrance pyramid like a perfumer.",
    focusKeyword: "fragrance notes",
    excerpt:
      "What top, heart, and base notes actually mean, why perfume smells different after three hours, and how to read a fragrance pyramid like a perfumer.",
    content: `<p>Every fragrance description lists a pyramid: top notes, heart notes, base notes. Understanding this structure explains why the scent you spray at 9 AM smells completely different by noon — and helps you predict whether a perfume will suit you before you ever smell it.</p>

<h2>What Are Top Notes?</h2>
<p>Top notes (also called head notes) are the first impression — the molecules light enough to evaporate within minutes of spraying. They exist to grab attention and introduce the fragrance, then fade.</p>
<ul>
<li><strong>Typical materials:</strong> Citrus (bergamot, lemon, grapefruit), light herbs (lavender, basil), green notes, aldehydes.</li>
<li><strong>Lifespan:</strong> 5–30 minutes.</li>
<li><strong>Role:</strong> First impression and introduction — never the whole story.</li>
</ul>
<p>This is why buying a perfume based on the first spray alone is a mistake. You are smelling only the opening act.</p>

<h2>What Are Heart Notes?</h2>
<p>Heart notes (middle notes) emerge as the top notes evaporate — usually 15–30 minutes after application. They form the character of the fragrance, the part most people associate with the scent.</p>
<ul>
<li><strong>Typical materials:</strong> Florals (rose, jasmine, ylang-ylang), fruits, spices (cardamom, cinnamon), some woods.</li>
<li><strong>Lifespan:</strong> 2–4 hours.</li>
<li><strong>Role:</strong> The soul of the composition — what the perfume is actually "about".</li>
</ul>
<p>If a perfume lists a heart of damask rose and saffron, that combination is what people will smell on you through the middle of the day.</p>

<h2>What Are Base Notes?</h2>
<p>Base notes are the heavy molecules that evaporate slowly — the foundation that anchors everything above. They appear within an hour and can persist for 12+ hours, sometimes into the next morning.</p>
<ul>
<li><strong>Typical materials:</strong> Oud, sandalwood, amber, musk, vanilla, patchouli, vetiver, leather.</li>
<li><strong>Lifespan:</strong> 6–12+ hours.</li>
<li><strong>Role:</strong> Longevity and depth — the signature that lingers on fabric and memory.</li>
</ul>
<p>Base notes are why oud and musk dominate luxury fragrance: they are what remains when everything else has left.</p>

<h2>Why the Pyramid Matters When You Shop</h2>
<p>Reading a note pyramid lets you predict the journey. A fragrance opening with bergamot, moving through rose and cardamom, and drying down to oud and amber tells you exactly what will happen: fresh sparkle, spicy-floral heart, dark woody finish. If you love rose but dislike heavy oud, you can spot the mismatch before buying.</p>
<p>It also explains the single most useful sampling technique: <strong>never judge a fragrance before the drydown</strong>. Wear it for a full day. The base is where you live longest.</p>

<h2>Common Notes Worth Knowing</h2>
<ul>
<li><strong>Oud (agarwood):</strong> Deep, resinous, smoky — the cornerstone of Eastern perfumery.</li>
<li><strong>Musk:</strong> Clean, skin-like warmth that amplifies everything around it.</li>
<li><strong>Amber:</strong> A warm blend of resins, vanilla, and labdanum — sweet and golden.</li>
<li><strong>Saffron:</strong> Leathery, honeyed spice — instantly signals luxury.</li>
<li><strong>Sandalwood:</strong> Creamy, soft wood that rounds sharp edges.</li>
</ul>

<h2>The Bottom Line</h2>
<p>Top notes seduce you, heart notes define the perfume, and base notes are what you actually wear all day. Learn to read the pyramid and you will never be surprised by a fragrance purchase again.</p>`,
    publishedAt: new Date("2026-09-04"),
    readTime: 6,
    tags: ["Scent Guides", "Education"],
    status: "published",
    schemaType: "BlogPosting",
  },
  {
    title: "How to Make Perfume Last Longer: 11 Proven Techniques",
    slug: "how-to-make-perfume-last-longer",
    metaTitle: "How to Make Perfume Last Longer — 11 Proven Tips | Khayal Journal",
    metaDescription:
      "Your perfume fades too fast? 11 techniques that actually work — from moisturized skin and pulse points to fragrance layering and storage mistakes to avoid.",
    focusKeyword: "how to make perfume last longer",
    excerpt:
      "Your perfume fades too fast? 11 techniques that actually work — from moisturized skin and pulse points to fragrance layering and storage mistakes.",
    content: `<p>The most common complaint about any fragrance is the same: it doesn't last. Before blaming the bottle, know that longevity is half chemistry, half technique. These eleven methods genuinely extend how long perfume lasts on your skin.</p>

<h2>1. Apply to Moisturized Skin</h2>
<p>Dry skin absorbs fragrance oils and evaporates them quickly. Apply an unscented lotion or petroleum jelly to your pulse points first — the oils give the fragrance something to bind to. This single step can add hours.</p>

<h2>2. Target Warm Pulse Points</h2>
<p>Heat radiates scent. The best spots are wrists, inner elbows, sides of the neck, behind the ears, and behind the knees. Blood vessels run close to the surface at these points, warming the fragrance continuously.</p>

<h2>3. Don't Rub Your Wrists Together</h2>
<p>Rubbing breaks the fragrance molecules' structure and crushes the top notes, speeding evaporation. Spray or dab, then let it dry naturally.</p>

<h2>4. Spray After Showering</h2>
<p>Skin is clean, warm, and slightly damp after a shower — the ideal canvas. Pores are open and the fragrance absorbs better than on cold, dry morning skin.</p>

<h2>5. Layer Your Fragrance</h2>
<p>Layering is the technique perfumers actually use. Start with a matching or complementary body oil or attar as a base, then spray your EDP on top. The oil layer locks the alcohol-based fragrance in place and dramatically slows evaporation.</p>

<h2>6. Spray Clothing and Hair</h2>
<p>Fabric and hair fibers hold scent far longer than skin — often until the next wash. Test for staining on an inner seam first, and use a dedicated hair mist or spray from 20+ cm away (alcohol can dry hair at close range).</p>

<h2>7. Store Bottles Correctly</h2>
<p>Heat, light, and humidity degrade fragrance. Keep bottles in a cool, dark drawer or cabinet — not the bathroom windowsill, where steam and sunlight flatten the composition within months.</p>

<h2>8. Choose Stronger Concentrations</h2>
<p>Format is fate. An attar or EDP will always outlast an EDT. If longevity is your priority, choose eau de parfum concentrations of 15%+ or oil-based attars, which routinely exceed 12 hours.</p>

<h2>9. Pick Base-Heavy Compositions</h2>
<p>Notes have natural lifespans. Citrus and light florals fade fast no matter what you do; oud, amber, vanilla, musk, sandalwood, and patchouli anchor a scent for hours. A fragrance built on a deep base simply has more to give.</p>

<h2>10. Reapply Strategically</h2>
<p>Even a great perfume needs a midday refresh on skin. Carry a travel atomizer or a small attar dabber — one touch-up at hour six resets the wearing experience.</p>

<h2>11. Don't Overspray — Oversaturating Backfires</h2>
<p>More sprays do not mean more hours; they mean faster nose fatigue. After twenty minutes you stop smelling your own perfume and assume it faded. It didn't — your brain just filtered it out. Trust the technique, not the quantity.</p>

<h2>The Bottom Line</h2>
<p>Longevity lives in three places: skin preparation, application location, and the composition itself. Moisturize, hit warm points, avoid rubbing, choose base-heavy scents, and store bottles in the dark. Do these and even a modest fragrance will outlast a careless application of an expensive one.</p>`,
    publishedAt: new Date("2026-09-07"),
    readTime: 7,
    tags: ["Scent Guides", "Tips"],
    status: "published",
    schemaType: "BlogPosting",
  },
];

async function main() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;
  const Post = mongoose.models.Post || mongoose.model("Post", PostSchema);

  const admin = await db.collection("users").findOne({ role: "admin" });
  if (!admin) {
    console.error("No admin user found. Run scripts/seed-admin.mjs first.");
    process.exit(1);
  }

  let created = 0;
  for (const article of ARTICLES) {
    const exists = await Post.findOne({ slug: article.slug });
    if (exists) {
      console.log(`Skipping "${article.slug}" — already exists.`);
      continue;
    }
    await Post.create({ ...article, authorId: admin._id });
    console.log(`Created "${article.slug}".`);
    created += 1;
  }

  console.log(`\nDone. ${created} article(s) created.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
