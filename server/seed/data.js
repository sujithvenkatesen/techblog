// Seed data: 7 required categories, authors, tags and 8 sample articles.
export const categories = [
  { name: 'Software Development', shortName: 'DEV', description: 'Engineering practices, architecture and tooling.' },
  { name: 'Artificial Intelligence & Machine Learning', shortName: 'AI & ML', description: 'Models, agents and applied intelligence.' },
  { name: 'Web and Mobile App Development', shortName: 'WEB & MOBILE', description: 'Frontend, backend and cross-platform apps.' },
  { name: 'Technology & Innovation', shortName: 'INNOVATION', description: 'Emerging tech and where it is heading.' },
  { name: 'Cybersecurity', shortName: 'SECURITY', description: 'Threats, defences and secure-by-design.' },
  { name: 'Cloud Computing', shortName: 'CLOUD', description: 'Infrastructure, containers and platforms.' },
  { name: 'Industry Insights', shortName: 'INSIGHTS', description: 'Trends, data and analysis from the field.' },
];

export const authors = [
  { name: 'Aarav Mehta', role: 'Staff Engineer', bio: 'Builds distributed systems and writes about making them boring.', avatar: 'https://i.pravatar.cc/120?img=12' },
  { name: 'Priya Nair', role: 'ML Lead', bio: 'Applied machine learning, evaluation and responsible AI.', avatar: 'https://i.pravatar.cc/120?img=47' },
  { name: 'Daniel Okafor', role: 'Security Architect', bio: 'Threat modelling, zero trust and incident response.', avatar: 'https://i.pravatar.cc/120?img=33' },
  { name: 'Sofia Alvarez', role: 'Cloud Advocate', bio: 'Kubernetes, FinOps and platform engineering.', avatar: 'https://i.pravatar.cc/120?img=32' },
];

export const tags = ['React', 'Node.js', 'MongoDB', 'Kubernetes', 'LLMs', 'Zero Trust', 'DevOps', 'Performance', 'TypeScript', 'Serverless'];

const code = (lang, src) => `<pre><code class="language-${lang}">${src.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;

export const posts = [
  {
    title: 'Designing Event-Driven Systems That Do Not Fall Over',
    excerpt: 'Idempotency, back-pressure and replay: the three properties that separate resilient event pipelines from fragile ones.',
    featuredImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80',
    category: 'Software Development', author: 'Aarav Mehta', tags: ['Node.js', 'DevOps', 'Performance'],
    featured: true, views: 4210, daysAgo: 2,
    content: `<h2>Why events fail in production</h2><p>Event-driven architectures promise loose coupling, but the coupling moves into the semantics of your messages. When consumers fall behind, duplicates arrive, or a schema quietly changes, the cracks show.</p><h2>Make every consumer idempotent</h2><p>At-least-once delivery is the norm. Design handlers so processing the same event twice has the same effect as processing it once.</p>${code('javascript', `async function handle(event) {\n  const seen = await db.processed.findOne({ id: event.id });\n  if (seen) return; // duplicate, safely ignored\n  await applyChange(event);\n  await db.processed.insertOne({ id: event.id, at: new Date() });\n}`)}<h2>Back-pressure beats buffering</h2><p>Unbounded queues turn latency problems into outages. Prefer bounded buffers, visible lag metrics and explicit load shedding.</p><table><thead><tr><th>Strategy</th><th>Trade-off</th></tr></thead><tbody><tr><td>Bounded queue</td><td>Predictable memory, may reject work</td></tr><tr><td>Rate limiting</td><td>Protects downstream, adds latency</td></tr><tr><td>Load shedding</td><td>Keeps core paths alive, drops low priority</td></tr></tbody></table><h2>Plan for replay</h2><p>Keep events immutable and versioned. Replay is how you recover from bugs, backfill new read models and prove what happened.</p>`,
  },
  {
    title: 'Shipping LLM Features: An Evaluation-First Playbook',
    excerpt: 'Before you tune prompts, build the test set. How to measure quality, catch regressions and keep costs in check.',
    featuredImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1600&q=80',
    category: 'Artificial Intelligence & Machine Learning', author: 'Priya Nair', tags: ['LLMs', 'TypeScript'],
    featured: true, views: 6890, daysAgo: 4,
    content: `<h2>Start with the eval set</h2><p>Collect 50 to 200 real inputs with expected outcomes. Without them, every prompt change is a guess.</p><h2>Score what matters</h2><p>Combine deterministic checks (format, citations present) with rubric-based grading for tone and helpfulness.</p>${code('typescript', `const results = await Promise.all(\n  cases.map(async (c) => ({\n    id: c.id,\n    output: await run(c.input),\n  }))\n);\nconst pass = results.filter((r) => grade(r)).length / results.length;\nconsole.log('pass rate', pass);`)}<h2>Watch cost and latency</h2><p>Track tokens per request and p95 latency next to quality. A tiny quality gain rarely justifies doubling spend.</p><h2>Gate releases</h2><p>Run the suite in CI and block merges that regress the pass rate beyond an agreed threshold.</p>`,
  },
  {
    title: 'Zero Trust in Practice: Beyond the Buzzword',
    excerpt: 'A pragmatic path to zero trust: identity first, least privilege by default, and continuous verification.',
    featuredImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1600&q=80',
    category: 'Cybersecurity', author: 'Daniel Okafor', tags: ['Zero Trust', 'DevOps'],
    featured: true, views: 3320, daysAgo: 6,
    content: `<h2>Identity is the new perimeter</h2><p>Start with strong authentication and device posture. Network location should never be the sole basis for trust.</p><h2>Least privilege, enforced</h2><p>Replace standing access with time-boxed, audited elevation. Review entitlements on a schedule, not after an incident.</p><h2>Verify continuously</h2><p>Sessions drift. Re-evaluate risk signals during a session and step up authentication when behaviour changes.</p><blockquote>Assume breach, then design so a breach is small.</blockquote>`,
  },
  {
    title: 'Kubernetes Cost Control Without Killing Reliability',
    excerpt: 'Right-sizing, autoscaling and bin-packing tactics that cut cloud bills while keeping SLOs intact.',
    featuredImage: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=1600&q=80',
    category: 'Cloud Computing', author: 'Sofia Alvarez', tags: ['Kubernetes', 'DevOps', 'Performance'],
    featured: false, views: 2780, daysAgo: 8,
    content: `<h2>Measure before you cut</h2><p>Compare requested versus used CPU and memory per workload. Most clusters are over-provisioned by a wide margin.</p>${code('yaml', `resources:\n  requests:\n    cpu: 250m\n    memory: 256Mi\n  limits:\n    memory: 512Mi`)}<h2>Autoscale on the right signal</h2><p>CPU is a weak proxy for many services. Scale on queue depth or request rate where it reflects real demand.</p><h2>Pack tighter</h2><p>Use node pools by workload shape and consider spot capacity for stateless, interruptible jobs.</p>`,
  },
  {
    title: 'React Server Components: A Mental Model That Sticks',
    excerpt: 'Where the server/client boundary lives, what crosses it, and how to avoid the common data-fetching traps.',
    featuredImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=1600&q=80',
    category: 'Web and Mobile App Development', author: 'Aarav Mehta', tags: ['React', 'TypeScript', 'Performance'],
    featured: false, views: 5120, daysAgo: 10,
    content: `<h2>Two kinds of components</h2><p>Server components render ahead of time and ship no JavaScript. Client components hydrate and handle interaction.</p><h2>The boundary</h2><p>Props that cross the boundary must be serialisable. Push interactivity to small leaves so most of the tree stays on the server.</p>${code('jsx', `// Server component\nexport default async function Posts() {\n  const posts = await getPosts();\n  return posts.map((p) => <PostCard key={p.id} post={p} />);\n}`)}<h2>Avoid waterfalls</h2><p>Fetch in parallel at the highest sensible level and stream slow sections behind Suspense.</p>`,
  },
  {
    title: 'MongoDB Indexing Patterns for Real Workloads',
    excerpt: 'Compound indexes, the ESR rule and how to read an explain plan before your queries read your whole collection.',
    featuredImage: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=1600&q=80',
    category: 'Software Development', author: 'Sofia Alvarez', tags: ['MongoDB', 'Node.js', 'Performance'],
    featured: false, views: 3950, daysAgo: 12,
    content: `<h2>The ESR rule</h2><p>Order compound index keys as Equality, Sort, then Range. It keeps scans tight and avoids in-memory sorts.</p>${code('javascript', `db.posts.createIndex({ status: 1, publishedAt: -1, views: -1 });\ndb.posts.find({ status: 'published' }).sort({ publishedAt: -1 }).explain('executionStats');`)}<h2>Read the plan</h2><p>Look for COLLSCAN, high docsExamined to nReturned ratios and blocking sorts.</p><h2>Index cost is real</h2><p>Every index slows writes and uses memory. Drop the ones the plan never picks.</p>`,
  },
  {
    title: 'The State of Developer Tooling: What 2026 Looks Like',
    excerpt: 'AI assistants, platform teams and typed everything: the shifts shaping how software gets built this year.',
    featuredImage: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&w=1600&q=80',
    category: 'Industry Insights', author: 'Priya Nair', tags: ['TypeScript', 'DevOps', 'LLMs'],
    featured: false, views: 4470, daysAgo: 15,
    content: `<h2>Assistants are everywhere</h2><p>Code generation moved from novelty to default. The differentiator is now review, testing and context quality.</p><h2>Platform engineering matures</h2><p>Internal developer platforms reduce cognitive load by offering paved paths with sane defaults.</p><h2>Types all the way down</h2><p>Typed APIs, schemas and infrastructure catch whole classes of errors before runtime.</p>`,
  },
  {
    title: 'Edge, Serverless and the Next Wave of Innovation',
    excerpt: 'Why compute is moving closer to users, and what it means for latency, cost and architecture choices.',
    featuredImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80',
    category: 'Technology & Innovation', author: 'Daniel Okafor', tags: ['Serverless', 'Performance'],
    featured: false, views: 2210, daysAgo: 18,
    content: `<h2>Latency is a feature</h2><p>Running logic near users shaves round trips that no amount of server tuning can recover.</p><h2>Know the limits</h2><p>Edge runtimes trade capability for speed: short execution, limited APIs and data locality constraints.</p><h2>Hybrid wins</h2><p>Keep stateful, heavy workloads in regions and push personalisation, routing and caching to the edge.</p>`,
  },
];
