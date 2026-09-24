# SkillPath Frontend Design Specification

Status: specification for a future redesign; no implementation is included in this phase. Repository inspection: 24 September 2026.

## 1. Scope, authority, and existing foundations

This document is the visual and interaction source of truth for SkillPath. It implements the direction in [prompt-design.md](../prompt-design.md) and the product purpose in [Document.md](Document.md): assess skills, compare career requirements, explain gaps, generate a dependency-safe learning roadmap, and recalculate after progress. Where the original product proposal describes an aspirational stack or example data, the current source code is the implementation baseline.

Preserve all seven routes, existing API contracts, learner profile/session behavior, skill identity metadata, strategy choices, resource links, and progress actions. Backend algorithms remain authoritative. Do not change RoadmapEngine, add authentication, introduce AI features or Gemini/OpenAI integrations, or generate learning order in the frontend. Careers about AI remain valid catalog content; they do not make SkillPath an AI product.

### 1.1 Source audit

The inspection covered source files and local package manifests, not a rendered browser session. Responsive findings below describe implemented CSS and component logic; they are not claims of completed visual or accessibility testing.

| Area | Current implementation | Redesign consequence |
| --- | --- | --- |
| Architecture | Next.js App Router under `frontend/app`, React, TypeScript; `@/` imports | Keep route architecture; isolate interactive effects in small client components |
| Dependencies | `package.json`: Next 15.5.25, React/React DOM 19.1.1, React Flow `^12.11.6`, Dagre `^3.1.1`, Lucide `^1.47.0`, Simple Icons `^16.32.0` | Reuse existing icons and graph tools; installed Next/React Flow/Dagre manifests match 15.5.25/12.11.6/3.1.1 |
| Styling | `app/globals.css`, CSS variables and semantic classes; no Tailwind package or configuration | Implement future tokens in CSS; Tailwind migration is not required |
| Motion/charts | CSS hover transitions; no Framer Motion, GSAP, Recharts, or other dedicated animation/chart dependency declared | Use CSS, IntersectionObserver and requestAnimationFrame first; the stack proposed in Document.md is not installed reality |
| Fonts/language | Inter named in CSS but no font loader/assets; system fallback; `html lang="en"`; UI primarily English | Load a Thai-capable font deliberately; future root language becomes Thai |
| Shared shell | `components/Shell.tsx`: Shell, Status, Readiness; sticky header, three navigation links, footer | Evolve these foundations rather than duplicating independent page shells |
| Identity | `components/SkillIcon.tsx`: SkillIcon/SkillIdentity; `lib/skills/skillIdentity.ts`: named Simple Icons, aliases, Lucide fallback | Preserve central registry and API metadata; add presentation variants centrally |
| Home `/` | English hero, career/dashboard links, three explanatory cards | Expand into the product narrative in section 9 |
| Explorer `/careers` | API category select and auto-fit cards; `top_skills`, required skill count; no search | Retain category filtering; add frontend search and explicit result states |
| Detail `/careers/[id]` | Description, assessment CTA, requirements with difficulty/importance | Add hierarchy and real prerequisite preview without inventing career metrics |
| Assessment `/assessment/[careerId]` | Name, weekly hours, 0–5 range inputs; creates profile, posts assessment, stores session, goes to dashboard | Preserve workflow and validation; strengthen level explanations and form states |
| Dashboard `/dashboard` | Analysis readiness, counts, first five priority gaps, links | Give readiness visual dominance; enrich only with available roadmap data |
| Analysis `/analysis` | Skill cards, status, current/required levels, readiness bar, gap, priority | Add an explicit common-scale comparison and accessible dense desktop layout |
| Roadmap `/roadmap` | Page delegates to RoadmapPageClient; legacy timeline is commented out | Active graph implementation is baseline; do not revive obsolete timeline code |
| Graph | `components/roadmap/RoadmapGraph.tsx`, `lib/roadmap/layoutRoadmap.ts`: React Flow, Dagre, nodes, controls, details, error boundary/list fallback | Preserve graph semantics, ordering, selection and fallback while restyling |
| API/session | `lib/api.ts` uses `/api` base, localStorage profile/career/roadmap IDs, no authentication | Explain missing sessions with an assessment CTA; do not present account UI |
| Responsive | Shared breakpoint 620px; graph 720px and header 1050px; 1120px outer container | Consolidate breakpoints; current nested 1400px roadmap cannot escape 1120px shell |

Source references: [global styles](../frontend/app/globals.css), [layout](../frontend/app/layout.tsx), [Shell](../frontend/components/Shell.tsx), [types](../frontend/lib/types.ts), [graph](../frontend/components/roadmap/RoadmapGraph.tsx), [layout adapter](../frontend/lib/roadmap/layoutRoadmap.ts), [seed catalog](../backend/app/seed.py), and [services](../backend/app/services/services.py). Existing uncommitted roadmap/backend work was inspected as the current baseline and must be preserved.

### 1.2 Data boundaries

| Display | Authoritative source | Missing-data behavior |
| --- | --- | --- |
| Careers, categories, required counts, top technologies | `GET /careers`, `GET /careers/{id}` | Loading/error state; no hardcoded catalog totals |
| Requirements, difficulty, prerequisites | Career requirement skill objects; `/skills` for additional identities when needed | Omit absent metadata; never fabricate a dependency |
| Current skill, gap, priority, readiness | `GET /profiles/{id}/analysis` | Assessment CTA if no profile; retry if retrieval failed |
| Strategy, schedule, hours, resources | Saved `Roadmap`, ordered `items` | No invented study estimate; prompt to generate a roadmap |
| Graph status, edges, current readiness, completed totals | `GET /roadmaps/{id}/graph` | Ordered roadmap fallback and graph retry |
| Recent Progress history | No history feed in inspected frontend contracts | Show only confirmed updates from the current session; omit historical chart/feed |
| Career-level difficulty or job prospects | No such fields | Do not display derived stars, salaries, demand, or employment promises |

`Roadmap.readiness_before` is a snapshot; use analysis or graph readiness for the current score. Completed graph counts describe requirements met, not necessarily the number of learning actions performed. Never label estimated study hours as tracked study time.

## 2. Design vision and brand personality

SkillPath should feel like a calm developer learning workspace: dark navy, blue/cyan accents, readable Thai, recognizable technologies, clear next steps. It is technical, friendly, precise, and quietly premium. The strongest expression belongs to Home; assessment and analytics favor concentration.

Use the product clarity associated with developer tools such as Linear, Raycast, Vercel and GitHub as a mood, not a copied layout. Create identity through the learning graph, transparent level comparisons and technology ecosystem. Avoid generic blocks of equally weighted metrics, decorative dashboards, robot/brain imagery, AI sparkles, gaming chrome and sci-fi effects.

## 3. Language and content strategy

Thai is the main interface language. Major headings, explanations, action labels, errors and confirmations are Thai. Keep technology names, appropriate career titles, skill types and established terms in English: React, Next.js, Python, Skill Gap, Career Readiness, Learning Roadmap, Framework, Database, Current Level, Target Level, Balanced, Fast Track, Foundation First.

Use one Thai heading with an optional smaller English subtitle. Do not translate every sentence twice. Career titles may remain English beneath a Thai page heading. Preserve English descriptions received from the API until reviewed Thai copy exists; do not silently invent translated catalog content or mutate backend data for presentation.

| Context | Main copy | Supporting label |
| --- | --- | --- |
| Explorer | ค้นหาเส้นทางอาชีพของคุณ | Career Explorer |
| Assessment | ทักษะที่คุณมีอยู่ | Skill Assessment |
| Dashboard | ความพร้อมสู่อาชีพ | Career Readiness |
| Analysis | วิเคราะห์ทักษะที่ยังขาด | Skill Gap Analysis |
| Roadmap | เส้นทางการเรียนรู้ของคุณ | Learning Roadmap |
| Assessment action | วิเคราะห์ Skill Gap | Saving: กำลังบันทึก… |
| Graph action | บันทึกว่าเรียนถึงระดับเป้าหมายแล้ว | Explain the target level before saving |

Use Arabic numerals for levels, percentages and hours. Show current and target explicitly, such as `Current 2 → Target 4`; do not imply a level is a percentage. Use Thai unit labels in prose: `8 ชั่วโมง/สัปดาห์`. Readiness is alignment with configured requirements based on self-assessment, not a guarantee of employment. Estimates are planning guidance, not deadlines.

Future root markup uses `lang="th"`; mark extended English passages with `lang="en"` where helpful. Do not letter-space Thai text or apply uppercase transformations to mixed-language headings.

## 4. Color system and design tokens

Keep the existing semantic token names as compatibility aliases during migration. The existing accent `#55A6FF`, success `#48D597`, and warning `#FFB454` already fit the direction and are retained. Move the neutral charcoal backgrounds to blue-black/navy. Technology logos may retain brand colors; their surrounding cards stay within this palette.

| Token | Value | Use |
| --- | --- | --- |
| `--bg` | `#07111F` | Main page background |
| `--bg-deep` | `#050B14` | Hero depth, graph backdrop |
| `--bg-secondary` | `#0B1728` | Quiet section separation |
| `--surface` | `#0E1D30` | Standard cards/forms |
| `--surface-elevated` | `#12243A` | Raised panels and selected surfaces |
| `--glass` | `rgba(15,35,58,.72)` | Navbar and optional filter bar; stronger than the prompt's starting opacity for readability |
| `--glass-strong` | `rgba(17,42,70,.90)` | Detail panels and dialogs |
| `--border` | `rgba(148,200,255,.12)` | Decorative separators only |
| `--border-hover` | `rgba(91,192,255,.30)` | Decorative hover enhancement |
| `--border-control` | `#70859B` | Necessary input/control boundaries |
| `--text` | `#F4F8FC` | Primary text |
| `--muted` | `#A9B9CB` | Secondary text, helpful metadata |
| `--text-subtle` | `#70859B` | Nonessential decoration; not small instructional text |
| `--primary` | `#298CFF` | Filled primary action |
| `--accent` | `#55A6FF` | Links, active UI; retained existing accent |
| `--cyan` | `#49D7FF` | Focus, small interactive highlights |
| `--good` | `#48D597` | Ready/completed; retained |
| `--warn` | `#FFB454` | Critical gap/caution; retained |
| `--danger` | `#FF667A` | Failed actions and invalid fields |
| `--on-primary` | `#050B14` | Text/icons on bright filled buttons |

Do not put small white text on the bright primary blue without checking contrast; default to `--on-primary`. Links within prose are underlined. Use status color alongside a word and icon, never as the only indication. Muted content must remain readable on elevated and composited glass backgrounds. Do not lower the opacity of an entire locked or completed node, which also weakens text contrast.

### 4.1 Spacing, shape, elevation and layers

| Family | Tokens/values | Application |
| --- | --- | --- |
| Spacing | `--space-1:4px`, `2:8px`, `3:12px`, `4:16px`, `5:20px`, `6:24px`, `8:32px`, `10:40px`, `12:48px`, `16:64px`, `20:80px`, `24:96px` | Use this scale; 2px only for optical adjustment |
| Radius | `--radius-sm:8px`, `--radius-md:12px`, `--radius-lg:20px`, `--radius-xl:28px`, `--radius-pill:999px` | Controls, cards, major panels, hero panels, badges respectively |
| Shadows | `--shadow-soft:0 8px 24px rgba(0,0,0,.18)`; `--shadow-raised:0 16px 40px rgba(0,0,0,.28)` | Soft cards, floating controls/dialogs |
| Inset | `--highlight-inset:inset 0 1px 0 rgba(244,248,252,.04)` | Optional glass top highlight |
| Glow | `--glow-primary:0 0 20px rgba(41,140,255,.16)` | Restricted primary CTA; not every card |
| Blur | `--blur-glass:16px`, `--blur-strong:24px`, mobile `8px` | At most two overlapping backdrop layers |
| Containers | `--container-reading:760px`, `--container-page:1280px`, `--container-workspace:1440px` | Forms/prose, standard pages, dashboard/graph |
| Layers | background `0`, content `1`, sticky `20`, navbar `30`, popover `40`, modal backdrop `50`, modal `60`, toast `70` | Establish local stacking contexts; avoid arbitrary 9999 values |

All sizes are CSS pixels expressed in rem where appropriate. Use `min-width:0` in grid children. Page gutters are 16px mobile, 24px tablet and 32px desktop. Standard section gaps are 48/64/96px across mobile/tablet/desktop. Card padding is 16/24px and grid gaps 16/24px.

### 4.2 Gradients and backgrounds

Use one low-opacity blue radial highlight behind the hero and an optional deep-navy linear background. Cyan is a small highlight, not a second dominant background. Headings remain solid text. Cards remain solid except deliberately selected glass components. Removing gradients must leave a complete, legible design. No purple/pink/rainbow fields, large blurred blobs or image downloads for basic backgrounds.

## 5. Typography

Choose **Noto Sans Thai**, weights 400, 500, 600 and 700, as the primary UI family for Thai and compatible Latin coverage. Keep one family initially to minimize font requests and visual mismatch. During implementation, use Next.js font loading in `app/layout.tsx`; use `next/font/local` with licensed local WOFF2 assets if build-time remote font access is unavailable. No font assets are currently bundled. Use swap behavior and a stable sans-serif fallback; verify actual Thai and Latin coverage before shipping.

Fallback stack: `"Noto Sans Thai", "Leelawadee UI", Tahoma, system-ui, sans-serif`. Use tabular numerals for metrics when supported; monospace is reserved for code or identifiers, not Thai copy.

| Role | Mobile | Desktop | Weight / line height |
| --- | --- | --- | --- |
| Hero h1 | 34px | 60px maximum | 700 / 1.30 |
| Page h1 | 30px | 44px | 700 / 1.35 |
| Section h2 | 24px | 32px | 600 / 1.40 |
| Card h3 | 18px | 20px | 600 / 1.45 |
| Lead | 18px | 20px | 400 / 1.75 |
| Body/form | 16px | 16px | 400–500 / 1.75 |
| Supporting metadata | 14px | 14px | 400–500 / 1.60 |
| Minor label | 12px minimum | 12px minimum | 500 / 1.60; never key instructions |
| Readiness metric | 48px | 64px | 700 / 1.15, separate unit label |

Interpolate heading sizes fluidly between endpoints. Thai heading letter spacing is normal; do not retain the current global `-.04em`. Do not clip tone marks with fixed line boxes or overflow-hidden text wrappers. Keep explanatory text within roughly 60–70 Latin characters of width and visually inspect Thai wrapping. Allow long career names to wrap; technical identifiers may use overflow wrapping, not break-all across every word.

## 6. Layout, navigation and responsive system

Use one AppNavbar and footer on all pages, with a standard or workspace container selected by the route. Keep reading/form content narrower than the shell. Dashboard and roadmap must receive an actual wider outer wrapper, not a larger max-width nested inside the existing 1120px container.

| Viewport | Layout and behavior |
| --- | --- |
| Mobile: below 640px | One-column content, full-width stacked hero actions, compact top bar/menu, 16px gutters; static ring field; graph top-to-bottom or accessible list |
| Tablet: 640–1023px | Two-column career grid, 24px gutters, reduced hero decoration; graph details below canvas; menu remains compact if labels do not fit |
| Desktop: 1024–1439px | Three-column career grid, centered 1280px page shell; graph left-to-right with 320px details panel; full navbar |
| Large desktop: 1440px and above | Content remains capped at 1280px, workspace at 1440px; graph gains room, text does not stretch indefinitely |

Use a single documented graph direction threshold of 768px during the redesign; update CSS and matchMedia together. Below this threshold use top-to-bottom graph ranks. This is a future replacement for the current 720px threshold, not an observation of current behavior. Node handles must switch to top/bottom with the direction; the current component keeps left/right handles even when Dagre switches to TB.

### 6.1 Navbar

Desktop: 64px high, 12px from top, width `min(1280px, viewport - 48px)`, 16px radius, dark glass, thin border, soft shadow. Brand left; links right: หน้าหลัก, สำรวจอาชีพ, Dashboard, Roadmap. Use `aria-current="page"` and a visible active underline/pill. One optional continue action only when a valid session exists. Do not add a login button.

On scroll, increase surface opacity; avoid height changes initially to prevent content jumps. Offset anchors and keyboard focus so the sticky bar never covers headings/controls. Include a visible-on-focus skip link to main content.

Mobile: 56px compact bar with brand and a 44px menu button. Open a simple modal drawer with visible text navigation, close button, Escape dismissal, focus containment and focus return. Label expanded state and menu target. Close on route selection. No hover-only navigation or gesture-only dismissal.

Footer: small wordmark, Career Learning Platform, navigation links, and Thai project note about transparent algorithmic planning. Use normal document flow and modest 24–32px padding.

## 7. Surfaces, cards and controls

### 7.1 Soft UI and card levels

| Level | Treatment | Typical use |
| --- | --- | --- |
| 1: plain | Solid surface, decorative border, 12px radius; no shadow | Requirement rows, forms, dense data |
| 2: soft | Solid surface, 12–20px radius, soft shadow, optional inset highlight | CareerCard, MetricCard, readiness section |
| 3: glass | Glass token, 16px blur, 1px border, raised shadow; 16–20px radius | Navbar, hero action panel, filters, floating graph controls |

Strong glass is permitted for a graph detail panel or modal only when its background does not compromise text. Use a solid elevated fallback when backdrop filtering is unsupported. Mobile reduces blur or becomes opaque. Never nest glass within glass just to create depth. Soft UI means gentle layered surfaces, not low-contrast neumorphic controls.

Interactive cards get a 2px lift, border change and slightly stronger shadow only on devices with hover and fine pointers. Icons may scale to 1.04, maximum 1.08. Focus gets an explicit ring; it must not depend on movement. Static metrics do not lift or imply clickability. Linked career cards use a single link with no nested buttons.

### 7.2 Button hierarchy

| Variant | Style | Use |
| --- | --- | --- |
| Primary | Bright blue, dark text, 12px radius | Main form submission or next action |
| NeonGlowButton | Deep blue elevated fill, primary text, blue/cyan outline and restricted glow | Home hero/final CTA; optionally main roadmap generation |
| Secondary | Surface/transparent fill, readable border and text | Back, recalculate, change view |
| Tertiary | Underlined text or quiet text button | Low-priority navigation |
| Destructive/error | Danger text/icon plus explicit label | Only actual destructive actions; a normal skill gap is not an error |

Minimum height 44px, default 48px, large CTA 52px; horizontal padding 20–24px. Use links for navigation and buttons for actions. Include default, hover, focus-visible, pressed, disabled and loading states. Loading preserves width, shows action-specific copy, sets busy state and prevents duplicate submissions. Disabled controls retain legible labels and an adjacent reason when needed.

### 7.3 Neon Glow Button specification

Use an elevated navy base with `--text`, a 1px blue boundary, and `--glow-primary`. A decorative pseudo-element may sweep a narrow cyan highlight once on hover/focus over 280ms. Idle state has no looping sweep. Hover lift: 2px; press: return to baseline or 1px inset. Optional pointer magnetic translation is capped at 2px and replaces, rather than adds to, hover movement; total movement must never exceed 4px. Keep hit area stationary by moving only the inner visual layer.

Focus uses a separate 2px cyan outline with 3px offset, not glow alone. Touch has no magnetic behavior. Reduced motion removes sweep and movement; static border remains. Disabled removes glow. Use no more than one glow CTA in the visible action group; ordinary form controls and secondary actions remain quiet.

### 7.4 Inputs and filters

Use permanent text labels, 16px input text, 48px height and control-border token. Placeholder is an example, never the only label. Describe errors beside the field with `aria-describedby` and `aria-invalid`. Selected filter uses text plus outline/check, not color alone. Category filters act as buttons with `aria-pressed` when filtering one list; do not use tab semantics unless there are real tab panels.

## 8. Skill and technology identity

Preserve `name`, `skill_type`, `icon_key`, `icon_kind` through every presentation. Reuse SkillIdentity for logo + name + type and SkillIcon for decorative icons beside readable names. Current sizes 20/28/38px can remain for small/medium/large. Align to consistent icon boxes, not raw SVG contours.

The registry includes HTML, CSS, JavaScript, TypeScript, React, Next.js, Python, FastAPI, PostgreSQL, Git, Docker, Kubernetes, Terraform, NumPy, Pandas, PyTorch and others. CSS3 and Next.js aliases already exist. AWS currently uses the generic Lucide Cloud icon; do not claim an official AWS mark is installed. Generic concepts use type-based Lucide fallbacks, with Code2 as the final fallback. No random external logo URLs or permanent emoji icons.

Normal product UI uses recognizable brand colors where legible; black marks use light text color as the current component does. Put problematic marks on a neutral contained surface rather than recoloring whole cards. Add a centralized monochrome presentation variant for the marquee instead of overriding each page or duplicating registry data. Icon-only controls need accessible labels; decorative logos remain hidden from assistive technology when adjacent text provides identity. A `title` tooltip alone is insufficient.

## 9. Home page specification

Home has the strongest visual treatment but remains a factual demonstration of the product. Use this final order; category ecosystem examples share one section to avoid redundant card galleries.

| Order | Section | Content, layout and action |
| --- | --- | --- |
| 1 | Navbar | Shared shell |
| 2 | Hero | Centered Thai headline, restrained lighting, Cursor Ring Field, supporting copy and two actions |
| 3 | Technology Logo Marquee | Existing technology identities, slow movement and pause control |
| 4 | Product statement | Thai statement with Text Emerge, maximum two short sentences |
| 5 | How SkillPath Works | Five connected steps; horizontal desktop, vertical mobile |
| 6 | Career Categories | Actual catalog categories with Thai descriptions and live counts |
| 7 | Skill Gap Preview | Logo, current/target comparison and explanation of gap |
| 8 | Interactive Learning Roadmap Preview | Small real prerequisite subgraph with keyboard-selectable details |
| 9 | Career Readiness Preview | One score plus the breakdown that produced it |
| 10 | Technology / Career Ecosystem | Example career paths from catalog, 3 compact links with technologies |
| 11 | Why SkillPath | Explain transparent priorities, prerequisite order and recalculation |
| 12 | Final CTA | One clear next step with restrained NeonGlowButton |
| 13 | Footer | Minimal navigation/project note |

Hero eyebrow: `SKILLPATH · Career Learning Platform`.

Hero h1:

> รู้ว่าคุณอยู่ตรงไหน  
> และต้องเรียนอะไรต่อ

Supporting copy:

> วิเคราะห์ Skill Gap จากทักษะปัจจุบัน เปรียบเทียบกับสายอาชีพที่คุณสนใจ และสร้าง Learning Roadmap ที่ช่วยให้เห็นลำดับการเรียนรู้ชัดเจน

Primary: `เริ่มค้นหาเส้นทางของคุณ` → `/careers`. Secondary: `สำรวจสายอาชีพ` → the career category section on Home, whose cards lead into filtered Explorer. A valid returning session may replace the secondary action with `เรียนต่อจากแผนของฉัน` → `/dashboard`; avoid hydration layout shifts by reserving the same space. Small supporting line: `Software · AI · Data · Cloud`.

Hero has 80–112px vertical space on desktop, 48–64px on mobile, and a readable headline width around 900px. Do not force 100vh or hide the next section. CTA pair is centered and becomes stacked on mobile. No stock imagery is necessary.

Product statement:

> SkillPath ไม่ได้บอกแค่ว่าคุณขาด Skill ไหน แต่ช่วยเรียงให้เห็นว่าควรเริ่มเรียนจากตรงไหน

Five process steps: `01 เลือก Career`, `02 ประเมิน Skill ปัจจุบัน`, `03 วิเคราะห์ Skill Gap`, `04 สร้าง Learning Roadmap`, `05 อัปเดต Progress`. Each has one concrete sentence; connectors are decorative, with reading order preserved in HTML.

Categories derive from the catalog: Software Engineering, AI & Machine Learning, Data, Cloud & DevOps, Design, Marketing. The seed currently defines 15 careers; display runtime counts, not a permanent “15” marketing claim. Example category descriptions include `สร้างระบบ เว็บไซต์ และซอฟต์แวร์` and `จัดการข้อมูลและค้นหาข้อมูลเชิงลึก`. Category navigation uses a future frontend query convention such as `/careers?category=Data`; implement both link and query initialization together.

### 9.1 Preview data policy

Home must not create profiles or call mutation endpoints to generate promotional demos. Use read-only career/skill endpoints for actual names, requirements and prerequisite edges. If an approved read-only demo fixture is later introduced, derive it from the seeded catalog and document its synthetic learner levels separately. No reusable learner demo fixture was identified during this inspection.

Label sample levels and scores `ตัวอย่างการประเมิน` and separate them from the visitor's own results. Until a coherent fixture/response exists, display the real requirement/prerequisite preview and a textual readiness explanation instead of a fabricated 57% score. If showing 57%, it must be the rounded score returned for that fixture's complete assessment; three decorative bars do not establish it.

Safe prerequisite excerpt: JavaScript → React → Next.js, labeled as a partial view because React also requires HTML and CSS. Python → FastAPI is another valid edge. Do not draw FastAPI → PostgreSQL: seed prerequisites instead include SQL → Database Design → PostgreSQL. Use API IDs, not hardcoded numeric IDs. Read-only node selection may show real minimum levels. The preview has no completion controls and never alters the learner session.

When catalog retrieval fails, keep the hero and product explanation usable; replace dynamic sections with a concise retry panel. Do not let missing preview data blank Home.

Final CTA copy: `พร้อมรู้หรือยังว่า Skill ต่อไปของคุณคืออะไร?` with optional `Explore your next step.` and `เริ่มค้นหาเส้นทางของคุณ` → `/careers`.

## 10. Career Explorer specification

Route `/careers`. Order: Thai page heading + short explanation; search and category filters; result count; career grid. Search is a future frontend feature over the fetched catalog, matching case-insensitive title, description and available top-skill names; empty search shows all category matches. Keep search responsive without adding backend search dependencies. Clear resets search/category and announces the resulting count politely.

Desktop: search and category controls in one quiet optional glass bar, then a three-column grid. Tablet: two columns. Mobile: one column, full-width search and native category select; no horizontally inaccessible filter strip. Preserve chosen filters through a documented URL query so category links from Home and browser Back are predictable.

CareerCard: category label, English career title, short description, 3–5 top technology icons, accessible names, required skill count, and `ดูเส้นทางอาชีพ`. Use API top-skill order, not a client-invented ranking. Cards align within each row but allow long titles/descriptions to wrap; do not truncate essential copy behind hover. Do not show readiness before assessment or invent career difficulty.

States: six matching skeleton cards initially; empty catalog explains unavailable careers with retry; zero filtered matches uses `ไม่พบอาชีพที่ตรงกับการค้นหา` and clear filters; errors preserve user query/filter values and show retry. Category count is based on the fetched catalog, not the filtered search subset unless explicitly labeled.

## 11. Career Detail specification

Route `/careers/[id]`. Breadcrumb back to Explorer, Thai context `เส้นทางอาชีพ`, English career title, category, description and leading skill identities. Primary `ประเมิน Skill ของฉัน` → `/assessment/{id}`. Use a desktop 2:1 main/summary layout, single column on mobile.

Sections: About Career (real description); Core Skills (leading identities); Skill Requirements (all skills, target level, importance, skill difficulty); Prerequisite Preview (actual edges and minimum levels); Learning Estimate explanation; repeated assessment CTA only after substantial content.

Requirements use readable rows with 28px logo, name/type, `Target 4/5`, `Importance 5/5`; difficulty belongs to each skill, not the career. On mobile metadata wraps below identity. Prerequisite preview can use an accessible list rather than loading the full graph bundle.

A personalized estimate cannot be known before assessment. Show `ประเมินทักษะเพื่อดูเวลาที่คาดว่าจะใช้` rather than calculating a new estimate from scratch. If a valid matching saved roadmap exists, label its estimate and weekly-hours assumption clearly. Invalid career ID: not-found state with Explorer link; network failure: retry the same request; missing requirements: explain that assessment is unavailable and disable its action with a reason.

## 12. Skill Assessment specification

Route `/assessment/[careerId]`. A focused 760px form with static background. Header: Thai heading, career name, self-assessment explanation and visible 0–5 legend. Then name, weekly study hours, skill rows, submission. Preserve name maxLength 100; weekly hours 1–80 in increments of 0.5; integer levels 0–5.

| Level | Thai explanation | English term |
| --- | --- | --- |
| 0 | ยังไม่เคยเรียน | Never learned |
| 1 | รู้จักแนวคิดเบื้องต้น | Basic awareness |
| 2 | ทำงานพื้นฐานโดยมีคำแนะนำ | Beginner |
| 3 | ทำงานทั่วไปได้ด้วยตนเอง | Intermediate |
| 4 | ใช้ได้คล่องในงานที่ซับซ้อนขึ้น | Proficient |
| 5 | ใช้ได้เชี่ยวชาญและอธิบายแนวทางได้ | Advanced |

Skill row: logo/name/type, target level, labeled native integer range control with visible ticks 0–5, numeric output and selected level explanation. An optional segmented radio alternative must give each option a 44px target and wrap safely on narrow screens. Keep one accessible input model, not two contradictory values. Arrow keys change the native range by one; labels expose the technology and current value meaning.

All initial values currently default to zero. A future `8 / 14 Skills` progress indicator must count explicitly reviewed rows, including confirmed zero, not positive values or prefilled zeros. If reviewed-state tracking is not implemented, display total required skills only. Do not introduce mandatory review gating that changes the current valid zero assessment behavior.

Sticky submit summary may sit below navbar on desktop or at the bottom on mobile with safe-area padding. Add enough content padding that it covers no fields. CTA `วิเคราะห์ Skill Gap`; no glow/magnetic movement on form rows. Optional initial row reveal is brief and never delays access or hides focused fields.

Submit preserves the current create-profile → save-assessments → store session → dashboard flow. Show field errors and a summary linked to invalid controls. Preserve inputs on failure. If profile creation succeeded but assessment saving failed, retain that created profile ID for retry to avoid duplicate profiles; do not claim saved success until both operations finish. Do not change API validation or algorithms. Loading disables duplicate submit only, keeps entered data visible, and announces success/failure.

## 13. Dashboard specification

Route `/dashboard`. Heading `ความพร้อมสู่อาชีพ`, selected career and a restrained self-assessment note. Readiness dominates: 48–64px score, accessible bar/gauge, explanatory sentence. Use a two-column desktop composition with readiness taking roughly two thirds of the top row and next action/roadmap summary taking one third; stack on mobile.

Below: Priority Skills (first five gaps in backend priority order), Critical Skill Gaps (backend analysis status), and compact requirement-ready/remaining counts. Preserve a full-analysis link and roadmap action. Avoid repeating the same metric in multiple equally sized tiles.

Current dashboard's `gaps[0]?.gap` is the gap of the highest-priority skill, not necessarily the largest numerical gap. Relabel it `Gap ของทักษะลำดับแรก` or remove that tile; do not misstate the number.

Current Roadmap / Learning Progress / Estimated Study Time are conditional sections when a valid matching saved roadmap and graph are available. Show strategy, weekly hours, estimated weeks and graph requirement-completion count. If summing remaining `items.estimated_hours`, label it as estimated remaining learning effort, not elapsed time. Ignore unrelated/stale career roadmap data. No roadmap: `สร้างแผนการเรียนรู้` CTA without zero-valued pretend metrics.

Recent Progress is a confirmed current-session message only; persistent historical timelines and streak charts are deferred until a real history contract exists. On a progress update, refresh analysis/graph values, announce the new score once, and avoid looping count animations. No session: welcoming assessment state. Ready for all configured requirements: success message plus Explore link, not a warning that there are no gaps.

## 14. Skill Gap Analysis specification

Route `/analysis`. Heading `วิเคราะห์ทักษะที่ยังขาด`, career context, and concise explanation that priority combines gap, importance and dependencies. Default order remains the API order. Optional local filters All / To develop / Ready never replace engine ranking.

Desktop: semantic table or aligned rows with SkillIdentity, Current, Target, Gap, Priority, Status. Mobile: stacked cards retaining exactly the same values and order. Current/target visual uses a fixed 0–5 scale: filled blue segment for current, outlined marker for target, numeric labels alongside. A current level above target is valid; gap remains the backend's zero and the row is Ready.

If displaying `skill.readiness`, label it as requirement readiness and distinguish it from the 0–5 scale. Do not substitute a client-calculated overall score. Critical gaps use a small amber icon/badge and a readable label, not red cards. Ready uses green check; ordinary gaps use neutral/blue. Add a text equivalent such as `React: Current 1, Target 4, Gap 3` for nonvisual use.

Primary action links to `/roadmap`; it does not generate a plan merely on viewing analysis. Empty skills, all-ready, missing profile and API failure have distinct messages. A missing profile always includes an assessment/Explorer link.

## 15. Roadmap Diagram specification

Route `/roadmap`; preserve deterministic RoadmapEngine output, graph API status/edges, item identity, strategy names and progress workflow. Dagre determines coordinates only. Never infer a new learning order from screen position, use an AI ordering service, or connect adjacent cards merely because they appear next to each other.

### 15.1 Workspace

Header: Thai roadmap heading, career name and compact summary: current readiness, active strategy, weekly hours, estimated weeks, completed/total requirements. Toolbar: strategy selector (Balanced/Fast Track/Foundation First), generate/apply action, secondary recalculate, Graph/List view and fit controls. A selected strategy is a draft until successful generation; keep the existing graph's active strategy label until the response arrives.

Use a navy canvas with 24px-spaced low-contrast dots, 20px workspace radius and quiet border. Default desktop canvas height 620px, bounded by available viewport where practical; mobile about 520px with page scroll outside the graph. Graph zoom range may retain current 0.35–1.6; pan and zoom must not trap ordinary page scrolling. Provide fit/zoom buttons with accessible labels. Disable node drag and connection creation as today.

Desktop selected details take 320px within the workspace. Tablet/mobile details appear below the graph with a clear heading and close button, not an overlay covering nodes. Preserve selection by node ID after successful refresh if still present; announce its removal if it disappears. Do not refit or reset pan on every pointer/selection update.

### 15.2 Nodes and edges

Start from existing 244px-wide/164px-minimum nodes, but allow a proposed 264px width and 184px minimum height for Thai labels. If dimensions change, update Dagre measurement inputs together with CSS; fixed 164px layout math must not overlap taller rendered nodes. Prefer measured or bounded content height with full name available in details. Node contents: 28px logo, name, type, status, Current → Target and estimated hours. Display backend order as a small optional step number when it represents a roadmap item.

| API status | Visual treatment | Interaction |
| --- | --- | --- |
| Completed | Solid surface, green check and เรียนถึงเป้าหมายแล้ว; normal text contrast | Details/resources accessible; no repeat completion |
| Current | Blue 2px border and arrow label เรียนต่อขั้นนี้ | Main suggested next step; normal completion action |
| Available | Standard surface, label พร้อมเรียน | Details and eligible completion |
| Locked | Neutral surface, lock and ต้องเรียนพื้นฐานก่อน; do not fade the entire card | Details available; completion disabled with reason |
| Critical | Amber status label and modest border accent | Follow backend status; no red alarm treatment |

Selected and keyboard-focused are independent visual states: a cyan outer outline that does not replace status color/label. The service currently assigns one status, in precedence completed → current → locked → critical → available. Do not locally override a locked node to critical based on its gap. Analysis and graph critical labels need not be identical because their contexts differ.

Edges are actual prerequisite relations with arrowheads, smooth paths and 1.5px muted strokes; focused/active relation uses 2px accent. Show `minimum_level` in details and accessible edge descriptions. No neon edge glow, moving dashed lines, or perpetual particles. Change source/target handles with LR/TB orientation. Respect backend node order in the list view; graph coordinates need not form a simple sequence.

### 15.3 Details, completion and partial failures

Details show description; current/target/gap/estimated hours; prerequisites with minimum levels; unlocks; resource title/type/difficulty/time where supplied. Do not put a check next to every prerequisite as the current component does: distinguish met, unmet and unknown using actual data. Graph edges may omit prerequisites outside the visible career subset; enrich from existing skill data if needed or label the list as prerequisites shown in this graph. Absence of an edge is not proof of no prerequisites.

Completion copy explains that marking complete updates the skill to the displayed target level. Preserve the existing PATCH roadmap item → POST recalculate → GET graph sequence. Disable completion while busy and for locked/completed nodes; if no corresponding roadmap item exists, give an explanation instead of a silent no-op. Do not fabricate optimistic readiness or unlock nodes before the server responds.

If PATCH succeeds but recalculation fails, say progress was saved and offer recalculation retry; do not report the whole operation as unsaved. If graph refresh fails, retain the ordered roadmap and label any displayed graph as stale; do not mix fresh totals with stale nodes without notice. Keep strategy and input selection on error. Use an inline polite confirmation after success, not a blocking modal.

### 15.4 Accessible fallback

Provide an always-available ordered List view, not just an error-boundary rescue. Include all node names/statuses/levels, prerequisites, resources and eligible progress actions. Keyboard Enter/Space on a graph node opens the same details; verify this explicitly because the current handler is click-based despite focusable nodes. Focus order follows backend order, not SVG position. Include graph instructions and an exit path without panning. Failure of the graph bundle or render must not remove core learning/progress functionality.

### 15.5 Graph motion

On first load, nodes may fade with an 8px visual offset over 240–320ms; stagger at most the first six visible nodes, total under 500ms. Animate an inner wrapper so React Flow's positioning transforms are not overwritten. Edges may fade once; optional short draw is allowed only after stable layout. Current-node emphasis is static by default; any pulse is capped at two cycles and stops. Completed nodes remain still. After progress, transition colors over 180ms and preserve viewport. Reduced motion uses immediate states and no animated fit-view movement.

## 16. Motion system and animation rules

Motion clarifies hierarchy, response and changed state. Functional pages remain usable immediately. CSS transform and opacity are the default; avoid animating width, height, top/left, large filters or backdrop blur. Filters are optional small-area effects, not the main motion mechanism.

| Token | Value | Use |
| --- | --- | --- |
| `--motion-micro` | 150ms | Hover, pressed, icon response |
| `--motion-normal` | 280ms | Panel/selection changes |
| `--motion-reveal` | 560ms | Home section entrance |
| `--motion-hero` | 800ms | Decorative initial hero entrance |
| `--ease-standard` | `cubic-bezier(.2,0,0,1)` | General transitions |
| `--ease-out` | `cubic-bezier(.16,1,.3,1)` | Entrance and settling |

Route content may fade with 6px translation over 180–220ms without delaying navigation or awaiting an exit animation. Do not remount the graph or form on decorative transition keys. Navigation focus must land predictably on the new page heading/main region.

Home scroll reveal: once per section, opacity + 20px rise, 560ms, trigger when approximately 15% enters view; child delay 50ms capped at 200ms. Forms, navigation, tables and long technical lists are not scroll-revealed. Server-rendered content is visible by default; an animation failure must never leave opacity-zero content. Keep primary hero copy/CTA visible promptly; the full 800ms timing applies to decoration, not a wait before reading.

### 16.1 Cursor Ring Field

Home Hero only. Use an optimized decorative DOM/CSS field initially: 8 columns × 5 rows on desktop, at most 40 rings. Rings are 28–44px with 1px blue/cyan outlines; base opacity .04–.08, near-cursor peak .18. Fade the field behind dense text using a static mask or opaque reading layer. It has `aria-hidden`, no focus targets, and `pointer-events:none`.

Listen on the hero container for fine-pointer movement; store coordinates in refs. Within roughly 180px of the cursor, ease rings toward the pointer up to 6px and scale from 1 to at most 1.08. Use a distance falloff and frame-rate-independent interpolation. Batch reads before writes, cache the hero bounds, and update only transform/opacity through one requestAnimationFrame loop. Never use React state per pointer event. Recalculate bounds on resize/necessary scroll events, not per ring per frame.

Start the frame loop only while movement/settling requires it. On pointer leave, settle back over about 280ms and stop. Pause offscreen and when the document is hidden; clean up listeners/observers/frame requests on unmount. Tablet has at most 24 static rings unless a fine pointer and sufficient performance justify interaction. Touch/mobile uses a static sparse field or none; no fake cursor and no ambient loop by default. Reduced motion disables all ring movement. No Canvas/WebGL dependency is justified by this first version; use one only after profiling proves a need.

Acceptance: text contrast is unchanged across pointer positions, hit targets never move, the hero never rerenders per pointer event, and the animation loop is idle when the field is settled/offscreen.

### 16.2 Text Emerge

Use for the Home product statement and a small number of section introductions. Reveal whole lines or authored phrase groups with opacity and an 8px rise; 400ms per group, 60ms stagger, total at most 700ms. Do not split Thai by spaces or individual characters: Thai word boundaries and tone marks make this unsuitable. Use semantic continuous text with decorative wrappers; do not duplicate the paragraph for screen readers.

Reveal once through IntersectionObserver, leave it readable thereafter, and do not reanimate when scrolling backward. Wrappers must wrap naturally and allow Thai marks without clipping. No use in forms, tables, metric values, navigation or resource lists. Reduced motion uses a short opacity-only fade of at most 100ms or immediate display. JavaScript failure leaves all text visible.

### 16.3 Technology Logo Marquee

Reuse the central registry and supported catalog identities. Start with 12–16 logos, visual size 24–28px inside equal 40px slots, 32px gap, strip height approximately 88px desktop/72px mobile. Default monochrome light treatment at roughly .65 opacity; hover may brighten or gently reveal brand color. Any visible name uses normal readable text contrast.

One track moves at roughly 24px/second, with duration based on actual track width (usually 35–60 seconds). Duplicate one track for seamless looping; duplicates are `aria-hidden` and never focusable. The readable original has technology names in a semantic list. Use 48px edge fade masks desktop/24px mobile; provide simple clipping fallback if masks are unsupported.

Include a visible `หยุดการเคลื่อนไหว` / `เล่นต่อ` button outside the mask. Pause on hover and focus-within as additional conveniences; those are not substitutes for the button. Pause offscreen/background tab. Reduced motion renders a static wrapping logo list with no duplicated visual sequence. Touch keeps the slow track only when motion is allowed and the explicit pause control is present. No marquee items require clicking moving targets. If data or logos are unavailable, omit missing entries; do not fetch arbitrary replacements.

### 16.4 Reduced-motion matrix

| Feature | Reduced-motion behavior |
| --- | --- |
| Cursor Ring Field/background | Static or removed; no frame loop |
| Marquee | Static wrapping list |
| Text Emerge/section reveal | Immediate or <=100ms opacity-only fade |
| Buttons/cards | No lift, scale, magnetic movement or sweep; color/focus remains |
| Route transitions | Immediate rendering; no spatial transition |
| Readiness/progress | Set final value immediately; announce once |
| Graph nodes/edges/viewport | Immediate state/position; no draw/pulse/animated fit |
| Skeletons | Static shapes without shimmer |

Listen to preference changes while the page is open. Essential operations never depend on animation finishing. No continuously animated backgrounds on Dashboard, Assessment or Analysis; Roadmap uses a static graph field. Home ambient gradient motion is optional and off by default.

## 17. Loading, empty, error and success states

Extend the existing Status concept into consistent reusable states. Thai copy should state what happened and the next useful action; do not expose stack traces, internal service details or raw validation objects. Preserve useful content during refreshes and failures.

| State | Visual and behavior |
| --- | --- |
| Initial loading | Geometry-matched skeleton, `aria-busy` region and a single polite loading message; skeleton blocks hidden from assistive technology |
| Background refresh | Existing values remain with small `กำลังอัปเดต…` label; actions disabled only where duplicate writes matter |
| Empty catalog | `ยังไม่มีข้อมูลอาชีพ` plus retry/navigation |
| Filter no results | `ไม่พบอาชีพที่ตรงกับการค้นหา` plus clear filters |
| Missing profile | `เริ่มประเมินทักษะเพื่อดูแผนของคุณ` plus Explorer CTA; not a frightening error |
| Missing roadmap | Explain generation prerequisites and show the appropriate assessment/generate action |
| All requirements met | Green check and factual success text; no empty-error illustration |
| Request failure | `โหลดข้อมูลไม่สำเร็จ กรุณาลองอีกครั้ง` with retry; retain current input |
| Invalid record | Not-found state with relevant back link |
| Graph failure | Ordered list with resources/actions, retry graph control |
| Saved progress | Polite inline confirmation and refreshed server values |

Skeleton shapes: CareerCard category/title/description/logo row; Assessment header + identity/slider rows; Dashboard large score + secondary rows; Roadmap fixed-height canvas with a few node silhouettes and summary shapes. Use neutral navy blocks and a low-contrast 1.6s shimmer only while loading, never a page-sized spinner. Avoid decorative loading delays. Reserve geometry to prevent layout shifts.

## 18. Accessibility acceptance criteria

Target WCAG 2.2 AA behavior. This is an implementation target, not certification of the current code.

- Normal text contrast at least 4.5:1, large text at least 3:1; necessary control/focus/graph boundaries at least 3:1 against adjacent surfaces. Test actual glass composites and hover/disabled explanations. Decorative borders may be weaker only when not needed to identify controls.
- All interactive targets at least 44×44px as the product standard; node details, zoom controls and mobile menus included.
- Complete keyboard path from skip link through navbar, filters, level controls, graph/list selection, details, progress and retry. Visible focus survives dark backgrounds and sticky UI.
- One meaningful h1 per route, ordered heading hierarchy, main/nav/footer landmarks, lists for collections, tables for tabular comparisons, fieldsets/legends when grouping choices.
- Names and labels accompany logos and status colors. Charts include numeric text and descriptions; graph/list presents equivalent dependencies and actions.
- Drawer/dialog Escape behavior, focus containment and restoration; inline graph details do not trap focus. Reopening selection must not unexpectedly move focus away from the user.
- Live regions announce result counts, save completion and recalculation once; no per-frame metric announcements.
- Test 200% text zoom and 400% browser zoom, 320px reflow, long Thai/English labels and no unintended horizontal page scrolling. The graph may pan internally, with a reflowing list alternative.
- Honor reduced motion and forced-color/high-contrast modes. Focus and selected state use borders/outlines as well as shadows; content remains usable when transparency and background imagery disappear.

## 19. Performance rules and future verification

No new animation, chart or WebGL dependency is required by this specification. Keep React Flow and Dagre scoped to the roadmap route; Home's small read-only preview can use a simple DOM/SVG representation of real edges. Do not import the whole icon namespace: retain named imports from the central registry. Do not change package versions as part of visual specification work.

Use CSS transform/opacity, small client boundaries, shared IntersectionObservers where sensible, and one rAF loop for the hero. Avoid pointer-triggered React renders, repeated layout measurements, full-page blurs and dozens of compositing layers. Apply will-change only while an effect needs it. Limit simultaneous overlapping backdrop filters to two; use solid surfaces for graph nodes and mobile details. Reserve font/content dimensions and avoid unoptimized images.

Future acceptance targets: LCP ≤2.5s, INP ≤200ms and CLS ≤0.1 at the 75th percentile when field measurements are available. For initial delivery, record repeatable lab results on a representative midrange mobile profile and compare with the baseline; these are targets, not measured results. Pointer effects should add no long tasks over 50ms; aim for under 4ms of effect scripting per active frame, reduce ring count or remove motion if profiling fails.

Verify future implementation at 360, 390, 768, 1024 and 1440px; additionally test 320px reflow, touch-only use, keyboard-only use, reduced motion, slow API, API failure, empty catalog, all-zero assessment, all-ready learner, missing/stale localStorage IDs and graph rendering failure. Check that server values/order/edges do not change when styling, filtering, selecting or resizing.

Current scripts available for future implementation checks: `npm run typecheck` and `npm run build` from `frontend`. No frontend test runner is declared. Add focused interaction checks only as needed for functional changes; documentation alone does not require executing or modifying the app. Visual QA must include Thai diacritics, logo alignment, focus visibility, input preservation after failure and graph/list parity.

## 20. Reusable component inventory

Names below are proposed responsibilities, not instructions to create files in this phase. Prefer adapting existing components before creating parallel systems.

| Component | Purpose / data contract | Visual and interaction behavior |
| --- | --- | --- |
| AppNavbar | Evolve Shell navigation; route/session context | Floating glass desktop, accessible mobile drawer |
| PageContainer | Standard/reading/workspace variants | Shared gutters/max widths; no nested width constraint |
| GlassPanel | Surface variant and semantic element | Controlled blur, opaque fallback, no built-in motion |
| SoftCard | Plain/soft depth variants | Optional interactive treatment only for actionable cards |
| Button / NeonGlowButton | Link or action, variant, busy/disabled | Shared sizes/states; restricted glow behavior |
| SectionHeading | Thai title, optional English subtitle, description | Stable hierarchy and line-height |
| CursorRingField | Decorative bounded pointer field | Home only, ref/rAF updates, static fallback |
| TextEmerge | Semantic text/phrase groups | One-time reveal and Thai-safe wrapping |
| LogoMarquee | Registry-resolved identities | Monochrome track, pause control, static reduced mode |
| CareerCard | Career title/category/top_skills/count | Soft card, single link, 3–5 logos |
| SkillIcon / SkillIdentity | Existing metadata and fallback system | Brand/monochrome variants; adjacent accessible text |
| SkillBadge | Identity or labeled status | Text/icon plus semantic color |
| SkillLevelControl | Name, current 0–5, target, onChange | Native input/legend, error association |
| SkillProgress | Current and target on fixed scale | Numeric text plus marker/bar; never color alone |
| ReadinessGauge | Authoritative numeric score | Evolve Readiness, one-time animation, accessible final value |
| MetricCard | Label/value/source context | Quiet solid surface; no invented trends |
| FilterTabs / CareerFilters | Category/search selection | Pressed-button/select semantics and result announcement |
| RoadmapGraph | Existing graph contract and completion callback | React Flow/Dagre; style/selection do not change semantics |
| RoadmapSkillNode | Server node status/identity/levels | Stable measured dimensions and separate selection state |
| RoadmapDetails | Selected node, prerequisites, resources, action | Desktop side panel/mobile inline panel; explicit completion consequences |
| RoadmapList | Same graph/items in engine order | Full keyboard/mobile/error alternative with action parity |
| EmptyState / ErrorState | Message and relevant action | Distinguish absence, completion and failure |
| PageSkeleton | Page-specific loading geometry | Shared neutral treatment; reduced-motion static |
| InlineNotice | Async success/partial-failure/status | Appropriate live region; no repeated announcements |

## 21. Anti-patterns and decision rules

- Do not replace business logic with client-side scoring or reorder learning paths for visual symmetry.
- Do not display invented readiness, history, category counts, career difficulty, salary, prerequisites or time estimates.
- Do not redesign seven pages as seven unrelated visual systems; reuse typography, tokens, controls, spacing and language patterns.
- Do not turn every card into glass or give every action a glow. Keep graph nodes and form rows solid.
- No rainbow/purple gradients, giant blurred blobs, neon edges, sparkles, robot imagery, confetti loops, 3D page flips or cinematic route delays.
- No character-by-character Thai reveals, uppercase mixed-language headings, tiny graph metadata, clipped tone marks or dimmed locked-node text.
- No hover-only information, inaccessible moving links, color-only status, hidden essential content pending animation, or graph-only progress workflow.
- No package migration, backend change or feature expansion disguised as styling. Missing data uses an honest empty/conditional state.

## 22. Future redesign implementation order

These phases are a future plan. Do not start implementing them as part of producing this specification. Accessibility, data fidelity and responsive behavior apply from phase 1; phase 7 consolidates verification rather than postponing them.

| Phase | Work | Exit criteria |
| --- | --- | --- |
| 1 | CSS design tokens, Thai font loading, root language, global background, container variants, navbar/footer | All routes retain functionality; Thai text/focus/gutters work at small and large widths |
| 2 | Buttons, card levels, glass fallbacks, inputs, central skill identity variants | Shared state examples cover hover/focus/pressed/disabled/busy; logo registry preserved |
| 3 | Home content, hero, Cursor Ring Field, marquee, Text Emerge and real-data previews | All sections have factual copy/data, pause/static behavior and keyboard access; no demo writes |
| 4 | Explorer and Detail | Search/category/Back behavior works; requirements and prerequisites match API; no fabricated metrics |
| 5 | Assessment, Analysis, Dashboard | Validation/session flow preserved; authoritative metrics; missing-data and partial-save recovery verified |
| 6 | Roadmap visual redesign and accessible list/details | Engine order and dependencies unchanged; LR/TB handles correct; progress/recalculation and fallback parity verified |
| 7 | Motion polish, responsive QA, accessibility review, performance profiling | Reduced-motion/keyboard/Thai/zoom/error checks pass; measured performance recorded; typecheck and build pass |

Final redesign handoff must identify changed files, actual checks performed and any remaining limitations. Until that implementation is separately requested, this document is the only deliverable.
