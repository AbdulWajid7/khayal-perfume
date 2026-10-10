/**
 * Ready-written journal guides. Admin → Journal Posts → "Import guides" creates each one as
 * a draft (existing slugs are left untouched) so it can be reviewed and published.
 */
export interface GuideContent {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  excerpt: string;
  tags: string[];
  readTime: number;
  coverImage: { url: string; alt: string };
  content: string;
}

const link = (handle: string, name: string) => `<a href="/shop/${handle}">${name}</a>`;

export const guides: GuideContent[] = [
  {
    slug: "long-lasting-perfume-for-men-pakistan",
    title: "Long-Lasting Perfume for Men in Pakistan: How to Choose One Under PKR 5,000",
    metaTitle: "Long-Lasting Perfume for Men in Pakistan Under 5000",
    metaDescription:
      "How to pick a men's perfume that survives Pakistani heat: extrait vs EDP vs attar, the notes that last, how to apply it, and our picks for office, evenings and weddings.",
    focusKeyword: "long lasting perfume for men in Pakistan",
    excerpt:
      "Why most perfumes fade by lunchtime in Pakistan, what actually makes a scent last, and which KHAYAL extrait de parfum to wear for the office, evenings and weddings.",
    tags: ["Men", "Guides", "Longevity", "Office", "Wedding"],
    readTime: 6,
    coverImage: { url: "/images/hero/the-gentleman.jpg", alt: "THE GENTLEMAN extrait de parfum bottle on dark stone" },
    content: `
<p>Most men in Pakistan have the same complaint: you spray a perfume at 8 am and by lunch nobody can smell it, not even you. Heat, humidity and long days are hard on fragrance. The good news is that longevity isn't luck. It comes down to three things: how concentrated the perfume is, which notes it is built on, and how you wear it. This guide walks through all three, then suggests a KHAYAL extrait de parfum for each part of your week.</p>

<h2>1. Start with the concentration: extrait de parfum, not body spray</h2>
<p>The label tells you how much perfume oil is in the bottle. A body spray or deodorant has very little and is designed to fade in an hour or two. An eau de toilette (EDT, roughly 5 to 15% perfume oil) usually lasts 3 to 5 hours. An eau de parfum (EDP, roughly 15 to 20%) lasts longer. An <strong>extrait de parfum</strong> (20 to 40%) is the strongest spray you can buy, and lasts the longest on skin and clothes.</p>
<p>Attars are different again: oil-based, very concentrated and worn close to the skin. They last well but don't spread far. If you want people around you to notice your scent, a spray is the better everyday choice. Every KHAYAL fragrance is an extrait de parfum with 38% perfume oil, so you get attar-level strength in a spray.</p>

<h2>2. Choose notes that last in the heat</h2>
<p>Every fragrance unfolds in three stages. The <strong>top notes</strong> (citrus, mint, pepper) are what you smell first and fade within 15 to 30 minutes. The <strong>heart notes</strong> (lavender, spices, florals) carry the next few hours. The <strong>base notes</strong> (woods, musk, amber, vanilla, oud, leather) are what is still there at night.</p>
<p>So when you read a perfume's notes, look at the base. Cedarwood, vetiver, sandalwood, musk, amber, tonka and leather are the notes that hold on through a long Karachi or Lahore day. A perfume that is all citrus will smell wonderful for twenty minutes and then disappear.</p>

<h2>3. Apply it the right way</h2>
<ul>
<li><strong>Spray on moisturised skin.</strong> Fragrance evaporates faster from dry skin. An unscented lotion first makes a real difference.</li>
<li><strong>Pulse points, not the air.</strong> Neck, behind the ears, wrists and inner elbows. Two to four sprays is plenty.</li>
<li><strong>Don't rub your wrists together.</strong> It crushes the top notes and speeds everything up.</li>
<li><strong>One spray on clothes.</strong> Fabric holds scent far longer than skin. A spray on your collar or shalwar kameez lasts into the next day. Test on an inside seam first with light fabrics.</li>
<li><strong>Keep the bottle out of the heat.</strong> A car dashboard or a sunny windowsill will damage any perfume. A drawer or cupboard is best.</li>
</ul>

<h2>Our picks for every part of your week</h2>
<p>All of these are KHAYAL extraits de parfum in 50 ml bottles, made in Karachi. Every bottle comes with a separate tester, so you can wear it for a day before you open the full bottle.</p>

<h3>For the office: ${link("the-gentleman", "THE GENTLEMAN")} or ${link("dark-ice", "DARK ICE")}</h3>
<p>THE GENTLEMAN opens with bergamot, lemon and pink pepper, moves to lavender and cedar, and dries down to white musk and vetiver. Clean, polished and never too loud for a meeting room. DARK ICE is the cooler option: grapefruit, mint and black pepper over a smooth base of patchouli, suede and musk.</p>

<h3>For hot days and weekends: ${link("samandar", "SAMANDAR")}</h3>
<p>Grapefruit, lemon and mint, then ginger and jasmine, finishing on incense, cedar and sandalwood. It feels like a sea breeze but has enough wood in the base to last.</p>

<h3>For evenings and dinners: ${link("victor", "VICTOR")} or ${link("jazba", "JAZBA")}</h3>
<p>VICTOR is warm and spicy: orange and cardamom, cinnamon and nutmeg, vetiver and tonka. JAZBA is sweeter and bolder, with pineapple and apple on top, cinnamon and rose in the heart, and vanilla, sandalwood and amber underneath.</p>

<h3>For weddings and formal events: ${link("dastaan", "DASTAAN")} or ${link("oud-musk", "OUD MUSK")}</h3>
<p>DASTAAN starts fresh with lavender, mint and bergamot, warms up with cinnamon and clary sage, and settles on cedar, tonka and leather. OUD MUSK is the one to share with your partner: saffron and cardamom, oud and rose, softened with white musk, sandalwood and amber.</p>

<h2>Frequently asked questions</h2>
<h3>How many hours should a good perfume last?</h3>
<p>In normal conditions an eau de parfum gives you around 6 to 10 hours on skin, and an extrait de parfum a few hours more, with longer still on clothes. In strong heat or if you sweat a lot, expect a little less. That is why a spray on your clothes helps.</p>
<h3>Why can't I smell my own perfume after an hour?</h3>
<p>Your nose gets used to a smell very quickly, so you stop noticing it long before other people do. Before you spray more, ask someone close to you whether they can still smell it.</p>
<h3>Is it safe to buy perfume online in Pakistan?</h3>
<p>Buy from the brand directly, check that cash on delivery is offered, and look for a clear return policy. KHAYAL delivers across Pakistan with cash on delivery, Karachi in 24 hours and other cities in 3 to 4 working days, and includes a tester with every bottle.</p>

<p><strong>Not sure which one is yours?</strong> Take our <a href="/scent-finder">two-minute scent finder</a>, browse <a href="/shop/men">all perfumes for men</a>, or message us on WhatsApp and we will help you choose.</p>
`.trim(),
  },
];
