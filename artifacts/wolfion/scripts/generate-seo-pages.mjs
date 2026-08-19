import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.resolve(here, "../dist/public");
const templatePath = path.join(outputDir, "index.html");
const canonicalOrigin = "https://www.wolfion.com.au";

const products = [
  {
    name: "Wolfion Classic Black",
    description:
      "A premium short sock in soft pima cotton with a fine ribbed cuff, hand-linked toe seam and tonal WOLFION wordmark.",
    image: "/products/wolfion-classic-black.png",
    url: "/product/p_wolfion_classic_black",
  },
  {
    name: "Wolfion Classic White",
    description:
      "A crisp premium short sock made with soft pima cotton, a fine ribbed cuff and a hand-linked toe seam.",
    image: "/products/wolfion-classic-white.png",
    url: "/product/p_wolfion_classic_white",
  },
  {
    name: "Wolfion Ankle Black",
    description:
      "A low-cut ankle sock in premium combed cotton with a snug heel cup and woven WOLFION wordmark.",
    image: "/products/wolfion-ankle-black.png",
    url: "/product/p_wolfion_ankle_black",
  },
  {
    name: "Wolfion Kids Blue",
    description:
      "A soft cotton-blend kids crew sock with a gentle ribbed cuff and seamless toe.",
    image: "/products/wolfion-kids-blue.png",
    url: "/product/p_wolfion_kids_blue",
  },
];

const pages = [
  {
    route: "/",
    title: "WOLFION | Australian Fashion & Textile Brand",
    description:
      "WOLFION is an Australian fashion and textile brand combining considered design, textile engineering, product development and manufacturing knowledge.",
    eyebrow: "Australian Fashion & Textiles",
    h1: "WOLFION — Fearless by Design",
    lead:
      "WOLFION is an Australian fashion and textile brand creating considered socks and apparel through design, textile knowledge and practical manufacturing experience.",
    sections: [
      [
        "Discover WOLFION",
        "Explore premium socks, public product collections, the WOLFION app and the story behind the brand.",
      ],
      [
        "Design with intention",
        "WOLFION brings fashion design, textile engineering and product development together with a focus on comfort, construction and long-term wear.",
      ],
    ],
    schema: ["organization"],
  },
  {
    route: "/shop",
    title: "Shop WOLFION | Premium Socks and Fashion",
    description:
      "Explore the official WOLFION store for premium short, ankle, kids and specialty socks designed with comfort, material and construction in mind.",
    eyebrow: "Official Store",
    h1: "Shop WOLFION",
    lead:
      "Discover the WOLFION collection, including premium short socks, ankle socks, kids styles and specialty pieces.",
    sections: [
      [
        "WOLFION socks",
        "Explore everyday and specialty socks developed through a textile-led approach to material, fit and finishing.",
      ],
      [
        "Public collection",
        "Browse product details and discover the latest WOLFION pieces in the official online store.",
      ],
    ],
    schema: ["organization", "products"],
  },
  {
    route: "/about",
    title: "About WOLFION | Fashion, Textiles and Design",
    description:
      "Learn about WOLFION, an Australian fashion and textile brand founded by textile engineer, fashion designer and entrepreneur Md Rabby Bapari.",
    eyebrow: "About WOLFION",
    h1: "A fashion brand built on textile knowledge",
    lead:
      "WOLFION connects fashion design, textile engineering, manufacturing knowledge and entrepreneurship in an Australian fashion and textile brand.",
    sections: [
      [
        "The brand",
        "WOLFION develops socks and apparel with attention to material, construction, function and a refined customer experience.",
      ],
      [
        "The founder",
        "Md Rabby Bapari is a textile engineer, fashion designer, entrepreneur and Founder of WOLFION.",
      ],
      [
        "Academic foundation",
        "In 2012, Rabby secured 1st position in Class 10 and achieved an A+ in the SSC board examination in Bangladesh.",
      ],
      [
        "Choosing textile engineering",
        "In 2014, Rabby secured admission to Dhaka Government Polytechnic Institute in Civil Engineering, competing among approximately 52,000 candidates. At the same time, he earned a place to study Textile Engineering at Barisal Textile Engineering College. He ultimately chose Textile Engineering and continued his studies in that field.",
      ],
    ],
    advocacyImage: "/founder/advocacy-2024.jpg",
    achievementImage: "/founder/waejuc-east-java-2024.jpg",
    scholarshipImage: "/founder/chengdu-textile-college.jpg",
    fashionScholarshipImage: "/founder/beijing-fashion-institute-2021.jpeg",
    curtinScholarshipImage: "/founder/curtin-university-2023.jpg",
    schema: ["organization", "person"],
  },
  {
    route: "/founder/md-rabby-bapari",
    title: "Md Rabby Bapari | Founder of WOLFION",
    description:
      "Md Rabby Bapari is a textile engineer, fashion designer, entrepreneur and Founder of WOLFION, an Australian fashion and textile brand.",
    eyebrow: "Founder Profile",
    h1: "Md Rabby Bapari — Founder of WOLFION",
    lead:
      "Md Rabby Bapari is a textile engineer, fashion designer and entrepreneur, and the Founder of WOLFION, an Australian fashion and textile brand.",
    image: {
      src: "/founder/md-rabby-bapari-portrait.jpg",
      alt: "Md Rabby Bapari — Founder of WOLFION",
    },
    sections: [
      [
        "Background",
        "His background combines textile engineering, fashion design, manufacturing and entrepreneurship, beginning with textile engineering in Bangladesh and fashion studies in China and Australia.",
      ],
      [
        "Work",
        "His work focuses on fashion, textiles, product development and manufacturing, blending engineering precision with creative direction.",
      ],
      [
        "Academic foundation",
        "In 2012, Rabby secured 1st position in Class 10 and achieved an A+ in the SSC board examination in Bangladesh.",
      ],
      [
        "Choosing textile engineering",
        "In 2014, Rabby secured admission to Dhaka Government Polytechnic Institute in Civil Engineering, competing among approximately 52,000 candidates. At the same time, he earned a place to study Textile Engineering at Barisal Textile Engineering College. He ultimately chose Textile Engineering and continued his studies in that field.",
      ],
    ],
    advocacyImage: "/founder/advocacy-2024.jpg",
    achievementImage: "/founder/waejuc-east-java-2024.jpg",
    scholarshipImage: "/founder/chengdu-textile-college.jpg",
    fashionScholarshipImage: "/founder/beijing-fashion-institute-2021.jpeg",
    curtinScholarshipImage: "/founder/curtin-university-2023.jpg",
    schema: ["organization", "person"],
  },
  {
    route: "/app",
    title: "WOLFION App | Shop WOLFION on Mobile",
    description:
      "Discover the WOLFION app for a mobile way to browse the official customer store, explore products and stay connected to the WOLFION collection.",
    eyebrow: "WOLFION App",
    h1: "The WOLFION App",
    lead:
      "The WOLFION app brings the public customer store to mobile, making it easy to discover the collection and review product details.",
    sections: [
      [
        "Browse on mobile",
        "Explore WOLFION socks and apparel through the same customer experience available on the official public website.",
      ],
      [
        "Connected to WOLFION",
        "The app keeps the official WOLFION store and public product collection close at hand.",
      ],
    ],
    schema: ["organization", "software"],
  },
  {
    route: "/products",
    title: "WOLFION Products | Premium Socks Collection",
    description:
      "Browse WOLFION products, including premium short socks, ankle socks, kids socks and specialty styles engineered for comfort and daily wear.",
    eyebrow: "Product Collection",
    h1: "WOLFION Products",
    lead:
      "Browse premium WOLFION socks and specialty pieces developed with attention to textile, fit, construction and comfort.",
    sections: [
      [
        "Everyday socks",
        "Discover short and ankle socks in considered materials and versatile colours for everyday wear.",
      ],
      [
        "Specialty pieces",
        "Explore kids styles, wool, silk and other textile-led WOLFION products across the public collection.",
      ],
    ],
    schema: ["organization", "products"],
  },
  {
    route: "/socks",
    title: "WOLFION Socks | Engineered Everyday Comfort",
    description:
      "Discover WOLFION socks designed with textile knowledge and everyday comfort in mind, including short, ankle, kids and specialty sock styles.",
    eyebrow: "WOLFION Socks",
    h1: "Socks engineered for everyday comfort",
    lead:
      "WOLFION socks combine considered design, textile knowledge and practical comfort across short, ankle, kids and specialty styles.",
    sections: [
      [
        "Bapari Socks",
        "The WOLFION sock collection is shaped by a textile-engineering approach to fit, material, durability and finishing.",
      ],
      [
        "Made to move",
        "Different constructions and materials support daily wear across casual, dress and active settings.",
      ],
    ],
    schema: ["organization", "products"],
  },
  {
    route: "/manufacturing",
    title: "WOLFION Manufacturing | Textile Product Knowledge",
    description:
      "Learn how WOLFION combines textile engineering, fashion design, product development and practical manufacturing knowledge across its work.",
    eyebrow: "Manufacturing",
    h1: "Textile knowledge behind every product",
    lead:
      "WOLFION brings textile engineering, fashion design and manufacturing knowledge together with careful attention to material, construction and use.",
    sections: [
      [
        "Product development",
        "Ideas are considered through the full product journey, from textile selection and construction choices to fit, finishing and presentation.",
      ],
      [
        "Manufacturing focus",
        "WOLFION's approach is informed by practical garment and sock manufacturing experience, with quality and long-term wear in mind.",
      ],
    ],
    schema: ["organization"],
  },
  {
    route: "/services",
    title: "WOLFION Services | Fashion and Textile Expertise",
    description:
      "Explore WOLFION capabilities across fashion design, textile engineering, product development and practical manufacturing knowledge.",
    eyebrow: "Capabilities",
    h1: "Fashion, textile and product expertise",
    lead:
      "WOLFION's capabilities connect fashion design with textile engineering, product development and manufacturing knowledge.",
    sections: [
      [
        "Fashion and textiles",
        "The brand's work draws on fashion design, textile materials, garment construction and a practical understanding of how products are made.",
      ],
      [
        "Concept to product",
        "WOLFION develops ideas with attention to material, function, manufacturing requirements and the final customer experience.",
      ],
    ],
    schema: ["organization"],
  },
  {
    route: "/contact",
    title: "Contact WOLFION | Official Brand Enquiries",
    description:
      "Contact WOLFION for official brand, product and customer enquiries, and find verified links to the Australian fashion and textile brand.",
    eyebrow: "Contact",
    h1: "Contact WOLFION",
    lead:
      "Use the official WOLFION contact page for brand, product and customer enquiries, or continue exploring the public collection.",
    sections: [
      [
        "Official enquiries",
        "Send an email to wolfion@wolfion.com.au for enquiries about WOLFION, its products or its public customer experience.",
      ],
      [
        "Explore the brand",
        "Learn about WOLFION, founder Md Rabby Bapari, the WOLFION app, products and textile-led capabilities.",
      ],
    ],
    schema: ["organization"],
  },
  {
    route: "/privacy",
    title: "WOLFION Privacy Policy | Website and App",
    description:
      "Read the WOLFION privacy policy for information about how the official website and mobile app collect, use, protect and retain personal information.",
    eyebrow: "Privacy",
    h1: "WOLFION Privacy Policy",
    lead:
      "The WOLFION privacy policy explains how information is collected, used and protected across the official website, mobile app and related services.",
    sections: [
      [
        "Your information",
        "The policy describes account, order, payment reference, device and usage information associated with the WOLFION service.",
      ],
      [
        "Your choices",
        "It explains data access, correction and deletion rights, security measures, retention and how to contact WOLFION with privacy questions.",
      ],
    ],
    schema: ["organization"],
  },
];

const navigation = [
  ["/", "Home"],
  ["/about", "About"],
  ["/founder/md-rabby-bapari", "Founder"],
  ["/app", "App"],
  ["/products", "Products"],
  ["/socks", "Socks"],
  ["/manufacturing", "Manufacturing"],
  ["/services", "Services"],
  ["/contact", "Contact"],
];

function absolute(relativePath) {
  return `${canonicalOrigin}${relativePath}`;
}

function organizationSchema() {
  return {
    "@type": "Organization",
    "@id": `${canonicalOrigin}/#organization`,
    name: "WOLFION",
    alternateName: "Wolfion",
    url: `${canonicalOrigin}/`,
    logo: absolute("/app-icon-512.png"),
    image: absolute("/opengraph.jpg"),
    description:
      "WOLFION is an Australian fashion and textile brand combining fashion design, textile engineering, product development and manufacturing knowledge.",
    founder: { "@id": absolute("/founder/md-rabby-bapari#person") },
  };
}

function personSchema() {
  return {
    "@type": "Person",
    "@id": absolute("/founder/md-rabby-bapari#person"),
    name: "Md Rabby Bapari",
    jobTitle: "Textile Engineer, Fashion Designer and Founder",
    url: absolute("/founder/md-rabby-bapari"),
    image: absolute("/founder/md-rabby-bapari-portrait.jpg"),
    worksFor: { "@id": `${canonicalOrigin}/#organization` },
    knowsAbout: [
      "Textile Engineering",
      "Fashion Design",
      "Product Development",
      "Garment Manufacturing",
      "Entrepreneurship",
    ],
  };
}

function softwareSchema() {
  return {
    "@type": "SoftwareApplication",
    "@id": absolute("/app#software"),
    name: "WOLFION App",
    url: absolute("/app"),
    applicationCategory: "ShoppingApplication",
    operatingSystem: "Android, Web",
    description:
      "The official WOLFION customer app for browsing the public WOLFION store and product collection.",
    publisher: { "@id": `${canonicalOrigin}/#organization` },
  };
}

function productSchemas() {
  const productEntities = products.map((product, index) => ({
    "@type": "Product",
    "@id": `${absolute("/products")}#product-${index + 1}`,
    name: product.name,
    description: product.description,
    image: absolute(product.image),
    url: absolute("/products"),
    category: "Socks",
    brand: { "@id": `${canonicalOrigin}/#organization` },
  }));

  return [
    ...productEntities,
    {
      "@type": "ItemList",
      "@id": absolute("/products#collection"),
      name: "WOLFION Products",
      numberOfItems: productEntities.length,
      itemListElement: productEntities.map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: { "@id": product["@id"] },
      })),
    },
  ];
}

function schemaGraph(page) {
  const graph = [
    {
      "@type": "WebSite",
      "@id": `${canonicalOrigin}/#website`,
      name: "WOLFION",
      url: `${canonicalOrigin}/`,
      publisher: { "@id": `${canonicalOrigin}/#organization` },
    },
    {
      "@type": "WebPage",
      "@id": `${absolute(page.route)}#webpage`,
      url: absolute(page.route),
      name: page.title,
      description: page.description,
      isPartOf: { "@id": `${canonicalOrigin}/#website` },
      about: { "@id": `${canonicalOrigin}/#organization` },
    },
  ];

  if (page.schema.includes("organization")) graph.push(organizationSchema());
  if (page.schema.includes("person")) graph.push(personSchema());
  if (page.schema.includes("software")) graph.push(softwareSchema());
  if (page.schema.includes("products")) graph.push(...productSchemas());

  return { "@context": "https://schema.org", "@graph": graph };
}

function headMarkup(page) {
  const pageUrl = absolute(page.route);
  const socialImage =
    page.image?.src ?? (page.schema.includes("products")
      ? "/products/wolfion-classic-black.png"
      : "/opengraph.jpg");

  return `<!-- SEO:START -->
    <title>${page.title}</title>
    <meta name="description" content="${page.description}" />
    <meta name="robots" content="index, follow, max-image-preview:large" />
    <link rel="canonical" href="${pageUrl}" />
    <meta property="og:title" content="${page.title}" />
    <meta property="og:description" content="${page.description}" />
    <meta property="og:url" content="${pageUrl}" />
    <meta property="og:type" content="${page.route.includes("/founder/") ? "profile" : "website"}" />
    <meta property="og:site_name" content="WOLFION" />
    <meta property="og:image" content="${absolute(socialImage)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${page.title}" />
    <meta name="twitter:description" content="${page.description}" />
    <meta name="twitter:image" content="${absolute(socialImage)}" />
    <script type="application/ld+json">${JSON.stringify(schemaGraph(page))}</script>
    <!-- SEO:END -->`;
}

function bodyMarkup(page) {
  const image = page.image
    ? `<img class="seo-prerender__portrait" src="${page.image.src}" alt="${page.image.alt}" width="180" height="180" />`
    : "";
  const sections = page.sections
    .map(
      ([title, body]) =>
        `<section><h2>${title}</h2><p>${body}</p></section>`,
    )
    .join("");
  const navLinks = navigation
    .map(([href, label]) => `<a href="${href}">${label}</a>`)
    .join("");
  const productList = page.schema.includes("products")
    ? `<section class="seo-prerender__products" aria-labelledby="seo-products-heading">
        <h2 id="seo-products-heading">Selected WOLFION products</h2>
        <ul>${products
          .map(
            (product) =>
              `<li><strong>${product.name}</strong><span>${product.description}</span></li>`,
          )
          .join("")}</ul>
        <a href="/products">Browse the full WOLFION collection</a>
      </section>`
    : "";
  const advocacy = page.advocacyImage
    ? `<section class="seo-prerender__advocacy">
        <img src="${page.advocacyImage}" alt="A fearless social advocacy message shown during a public demonstration" width="720" height="720" />
        <div><p class="seo-prerender__eyebrow">Social advocacy</p><h2>Fearless beyond fashion</h2><p>Beyond fashion and entrepreneurship, Rabby has also used his influence for social advocacy. During the 2024 Bangladesh student uprising, he used his digital platforms to amplify student voices, raise awareness, share key developments, and support calls for reform, justice, and accountability.</p></div>
      </section>`
    : "";
  const achievement = page.achievementImage
    ? `<section class="seo-prerender__achievement">
        <div><p class="seo-prerender__eyebrow">Leadership and achievement</p><h2>1st place in East Java</h2><p>In 2024, under his leadership, Rabby and his team secured 1st place while representing Curtin University in the WAEJUC East Java Exploration program in Indonesia, involving students from Western Australian universities including Curtin University, Edith Cowan University, UWA, Murdoch University and the University of Notre Dame Australia.</p></div>
        <img src="${page.achievementImage}" alt="Rabby and his Curtin University team celebrating their WAEJUC East Java Exploration achievement" width="720" height="720" />
      </section>`
    : "";
  const scholarship = page.scholarshipImage
    ? `<section class="seo-prerender__scholarship">
        <img src="${page.scholarshipImage}" alt="Chengdu Qinggong Polytechnic University emblem" width="720" height="720" />
        <div><p class="seo-prerender__eyebrow">Education journey</p><h2>A full scholarship to study in China</h2><p>In 2018, Rabby received a full scholarship to study at Chengdu Textile College (CDTC) in China, now known as Chengdu Qinggong Polytechnic University.</p></div>
      </section>`
    : "";
  const fashionScholarship = page.fashionScholarshipImage
    ? `<section class="seo-prerender__fashion-scholarship">
        <div><p class="seo-prerender__eyebrow">Education journey</p><h2>Full scholarship in Beijing</h2><p>In 2021, Rabby secured admission to the Beijing Institute of Fashion Technology and was awarded a full scholarship to continue his studies there.</p></div>
        <img src="${page.fashionScholarshipImage}" alt="Beijing Institute of Fashion Technology campus" width="720" height="480" />
      </section>`
    : "";
  const curtinScholarship = page.curtinScholarshipImage
    ? `<section class="seo-prerender__curtin-scholarship">
        <img src="${page.curtinScholarshipImage}" alt="Curtin University campus in Perth, Australia" width="720" height="360" />
        <div><p class="seo-prerender__eyebrow">Education journey</p><h2>Curtin University in Australia</h2><p>In 2023, Rabby was admitted to Curtin University in Australia with a 25% scholarship and received credit for four units based on his previous studies and experience.</p></div>
      </section>`
    : "";

  return `<!-- SEO_BODY_START -->
      <div class="seo-prerender">
        <header class="seo-prerender__header">
          <a class="seo-prerender__brand" href="/">WOLFION</a>
          <nav aria-label="Public pages">${navLinks}</nav>
        </header>
        <main>
          <p class="seo-prerender__eyebrow">${page.eyebrow}</p>
          <h1>${page.h1}</h1>
          ${image}
          <p class="seo-prerender__lead">${page.lead}</p>
          <div class="seo-prerender__grid">${sections}</div>
          ${productList}
          ${advocacy}
          ${achievement}
          ${scholarship}
          ${fashionScholarship}
          ${curtinScholarship}
          <p class="seo-prerender__cta"><a href="/products">Explore WOLFION products</a> · <a href="/contact">Contact WOLFION</a></p>
        </main>
        <footer>WOLFION · Australian fashion and textiles · <a href="/founder/md-rabby-bapari">Md Rabby Bapari — Founder</a></footer>
      </div>
      <!-- SEO_BODY_END -->`;
}

const template = await readFile(templatePath, "utf8");
for (const page of pages) {
  const html = template
    .replace(
      /<!-- SEO:START -->[\s\S]*?<!-- SEO:END -->/,
      headMarkup(page),
    )
    .replace(
      /<!-- SEO_BODY_START -->[\s\S]*?<!-- SEO_BODY_END -->/,
      bodyMarkup(page),
    );

  if (page.route === "/") {
    await writeFile(templatePath, html);
    continue;
  }

  const destination = path.join(
    outputDir,
    page.route.replace(/^\/+/, ""),
    "index.html",
  );
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, html);
}

console.log(`Generated ${pages.length} crawlable WOLFION pages.`);