// Hardcoded posts used whenever the API is unreachable or returns nothing,
// so "01 / FEATURED" and "02 / LATEST ARTICLES" are never empty.

export const FALLBACK_CATEGORIES = [
  { _id: 'c1', name: 'Software Development', slug: 'software-development', shortName: 'DEV', description: 'Engineering practices, architecture and tooling.' },
  { _id: 'c2', name: 'Artificial Intelligence & Machine Learning', slug: 'artificial-intelligence-machine-learning', shortName: 'AI & ML', description: 'Models, agents and applied intelligence.' },
  { _id: 'c3', name: 'Web and Mobile App Development', slug: 'web-and-mobile-app-development', shortName: 'WEB & MOBILE', description: 'Frontend, backend and cross-platform apps.' },
  { _id: 'c4', name: 'Technology & Innovation', slug: 'technology-innovation', shortName: 'INNOVATION', description: 'Emerging tech and where it is heading.' },
  { _id: 'c5', name: 'Cybersecurity', slug: 'cybersecurity', shortName: 'SECURITY', description: 'Threats, defences and secure-by-design.' },
  { _id: 'c6', name: 'Cloud Computing', slug: 'cloud-computing', shortName: 'CLOUD', description: 'Infrastructure, containers and platforms.' },
  { _id: 'c7', name: 'Industry Insights', slug: 'industry-insights', shortName: 'INSIGHTS', description: 'Trends, data and analysis from the field.' },
];
const cat = (i) => FALLBACK_CATEGORIES[i];

const AUTHORS = {
  aarav: { _id: 'a1', name: 'Aarav Mehta', role: 'Staff Engineer', avatar: 'https://i.pravatar.cc/120?img=12', bio: 'Builds distributed systems and writes about making them boring.' },
  priya: { _id: 'a2', name: 'Priya Nair', role: 'ML Lead', avatar: 'https://i.pravatar.cc/120?img=47', bio: 'Applied machine learning, evaluation and responsible AI.' },
  daniel: { _id: 'a3', name: 'Daniel Okafor', role: 'Security Architect', avatar: 'https://i.pravatar.cc/120?img=33', bio: 'Threat modelling, zero trust and incident response.' },
  sofia: { _id: 'a4', name: 'Sofia Alvarez', role: 'Cloud Advocate', avatar: 'https://i.pravatar.cc/120?img=32', bio: 'Kubernetes, FinOps and platform engineering.' },
};

const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString();
const tag = (n) => ({ _id: `t-${n}`, name: n, slug: n.toLowerCase().replace(/[^a-z0-9]+/g, '-') });
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const code = (lang, src) => `<pre><code class="language-${lang}">${esc(src)}</code></pre>`;

export const FALLBACK_POSTS = [
  {
    _id: 'p1', slug: 'designing-event-driven-systems-that-do-not-fall-over',
    title: 'Designing Event-Driven Systems That Do Not Fall Over',
    excerpt: 'Idempotency, back-pressure and replay: the three properties that separate resilient event pipelines from fragile ones.',
    featuredImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80',
    category: cat(0), author: AUTHORS.aarav, tags: [tag('Node.js'), tag('DevOps'), tag('Performance')],
    featured: true, views: 4210, readingTime: 6, publishedAt: daysAgo(2), status: 'published',
    content: `<h2>Why events fail in production</h2><p>Event-driven architectures promise loose coupling, but the coupling moves into the semantics of your messages. When consumers fall behind, duplicates arrive, or a schema quietly changes, the cracks show.</p><h2>Make every consumer idempotent</h2><p>At-least-once delivery is the norm. Design handlers so processing the same event twice has the same effect as processing it once.</p>${code('javascript', `async function handle(event) {\n  const seen = await db.processed.findOne({ id: event.id });\n  if (seen) return; // duplicate, safely ignored\n  await applyChange(event);\n  await db.processed.insertOne({ id: event.id, at: new Date() });\n}`)}<h2>Back-pressure beats buffering</h2><p>Unbounded queues turn latency problems into outages. Prefer bounded buffers, visible lag metrics and explicit load shedding.</p><table><thead><tr><th>Strategy</th><th>Trade-off</th></tr></thead><tbody><tr><td>Bounded queue</td><td>Predictable memory, may reject work</td></tr><tr><td>Rate limiting</td><td>Protects downstream, adds latency</td></tr><tr><td>Load shedding</td><td>Keeps core paths alive, drops low priority</td></tr></tbody></table><h2>Plan for replay</h2><p>Keep events immutable and versioned. Replay is how you recover from bugs, backfill new read models and prove what happened.</p>`,
  },
  {
    _id: 'p2', slug: 'shipping-llm-features-an-evaluation-first-playbook',
    title: 'Shipping LLM Features: An Evaluation-First Playbook',
    excerpt: 'Before you tune prompts, build the test set. How to measure quality, catch regressions and keep costs in check.',
    featuredImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1600&q=80',
    category: cat(1), author: AUTHORS.priya, tags: [tag('LLMs'), tag('TypeScript')],
    featured: true, views: 6890, readingTime: 5, publishedAt: daysAgo(4), status: 'published',
    content: `<h2>Start with the eval set</h2><p>Collect 50 to 200 real inputs with expected outcomes. Without them, every prompt change is a guess.</p><h2>Score what matters</h2><p>Combine deterministic checks (format, citations present) with rubric-based grading for tone and helpfulness.</p>${code('typescript', `const results = await Promise.all(\n  cases.map(async (c) => ({\n    id: c.id,\n    output: await run(c.input),\n  }))\n);\nconst pass = results.filter((r) => grade(r)).length / results.length;\nconsole.log('pass rate', pass);`)}<h2>Watch cost and latency</h2><p>Track tokens per request and p95 latency next to quality. A tiny quality gain rarely justifies doubling spend.</p><h2>Gate releases</h2><p>Run the suite in CI and block merges that regress the pass rate beyond an agreed threshold.</p>`,
  },
  {
    _id: 'p3', slug: 'zero-trust-in-practice-beyond-the-buzzword',
    title: 'Zero Trust in Practice: Beyond the Buzzword',
    excerpt: 'A pragmatic path to zero trust: identity first, least privilege by default, and continuous verification.',
    featuredImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1600&q=80',
    category: cat(4), author: AUTHORS.daniel, tags: [tag('Zero Trust'), tag('DevOps')],
    featured: true, views: 3320, readingTime: 4, publishedAt: daysAgo(6), status: 'published',
    content: `<h2>Identity is the new perimeter</h2><p>Start with strong authentication and device posture. Network location should never be the sole basis for trust.</p><h2>Least privilege, enforced</h2><p>Replace standing access with time-boxed, audited elevation. Review entitlements on a schedule, not after an incident.</p><h2>Verify continuously</h2><p>Sessions drift. Re-evaluate risk signals during a session and step up authentication when behaviour changes.</p><blockquote>Assume breach, then design so a breach is small.</blockquote>`,
  },
  {
    _id: 'p4', slug: 'kubernetes-cost-control-without-killing-reliability',
    title: 'Kubernetes Cost Control Without Killing Reliability',
    excerpt: 'Right-sizing, autoscaling and bin-packing tactics that cut cloud bills while keeping SLOs intact.',
    featuredImage: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=1600&q=80',
    category: cat(5), author: AUTHORS.sofia, tags: [tag('Kubernetes'), tag('DevOps'), tag('Performance')],
    featured: false, views: 2780, readingTime: 5, publishedAt: daysAgo(8), status: 'published',
    content: `<h2>Measure before you cut</h2><p>Compare requested versus used CPU and memory per workload. Most clusters are over-provisioned by a wide margin.</p>${code('yaml', `resources:\n  requests:\n    cpu: 250m\n    memory: 256Mi\n  limits:\n    memory: 512Mi`)}<h2>Autoscale on the right signal</h2><p>CPU is a weak proxy for many services. Scale on queue depth or request rate where it reflects real demand.</p><h2>Pack tighter</h2><p>Use node pools by workload shape and consider spot capacity for stateless, interruptible jobs.</p>`,
  },
  {
    _id: 'p5', slug: 'react-server-components-a-mental-model-that-sticks',
    title: 'React Server Components: A Mental Model That Sticks',
    excerpt: 'Where the server/client boundary lives, what crosses it, and how to avoid the common data-fetching traps.',
    featuredImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=1600&q=80',
    category: cat(2), author: AUTHORS.aarav, tags: [tag('React'), tag('TypeScript'), tag('Performance')],
    featured: false, views: 5120, readingTime: 4, publishedAt: daysAgo(10), status: 'published',
    content: `<h2>Two kinds of components</h2><p>Server components render ahead of time and ship no JavaScript. Client components hydrate and handle interaction.</p><h2>The boundary</h2><p>Props that cross the boundary must be serialisable. Push interactivity to small leaves so most of the tree stays on the server.</p>${code('jsx', `// Server component\nexport default async function Posts() {\n  const posts = await getPosts();\n  return posts.map((p) => <PostCard key={p.id} post={p} />);\n}`)}<h2>Avoid waterfalls</h2><p>Fetch in parallel at the highest sensible level and stream slow sections behind Suspense.</p>`,
  },
  {
    _id: 'p6', slug: 'mongodb-indexing-patterns-for-real-workloads',
    title: 'MongoDB Indexing Patterns for Real Workloads',
    excerpt: 'Compound indexes, the ESR rule and how to read an explain plan before your queries read your whole collection.',
    featuredImage: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=1600&q=80',
    category: cat(0), author: AUTHORS.sofia, tags: [tag('MongoDB'), tag('Node.js'), tag('Performance')],
    featured: false, views: 3950, readingTime: 4, publishedAt: daysAgo(12), status: 'published',
    content: `<h2>The ESR rule</h2><p>Order compound index keys as Equality, Sort, then Range. It keeps scans tight and avoids in-memory sorts.</p>${code('javascript', `db.posts.createIndex({ status: 1, publishedAt: -1, views: -1 });\ndb.posts.find({ status: 'published' }).sort({ publishedAt: -1 }).explain('executionStats');`)}<h2>Read the plan</h2><p>Look for COLLSCAN, high docsExamined to nReturned ratios and blocking sorts.</p><h2>Index cost is real</h2><p>Every index slows writes and uses memory. Drop the ones the plan never picks.</p>`,
  },
];
