You are working on the existing SkillPath project.

Your task is to redesign and refactor the ENTIRE FRONTEND based on:

SkillPath/docs/DESIGN.md

Treat `DESIGN.md` as the primary source of truth for all visual, UI, UX, motion, responsive, typography, color, glass, soft UI, animation, and page design decisions.

Also read:

SkillPath/docs/Document.md

Use `Document.md` as the source of truth for product behavior, features, business logic, roadmap logic, API behavior, and system requirements.

PRIORITY ORDER:

1. Preserve all existing functionality.
2. Follow DESIGN.md accurately.
3. Keep frontend fully connected to the real backend.
4. Maintain responsive usability.
5. Improve visual consistency across the whole application.
6. Implement motion and interaction carefully.
7. Keep performance and accessibility strong.
8. Do NOT introduce AI features.

Do not rewrite backend business logic unless a frontend integration bug requires a minimal compatible fix.

==================================================
1. BEFORE CODING
==================================================

Before making changes:

1. Read `docs/DESIGN.md` completely.
2. Read `docs/Document.md` completely.
3. Inspect the entire frontend repository.
4. Inspect all routes/pages.
5. Inspect all reusable components.
6. Inspect Tailwind/global CSS/theme setup.
7. Inspect current typography/font loading.
8. Inspect current SkillIcon / technology logo system.
9. Inspect current roadmap diagram implementation.
10. Inspect animation libraries already installed.
11. Inspect current dependencies.
12. Inspect API client/types.
13. Inspect responsive behavior.
14. Inspect loading/error/empty states.

Do NOT immediately rewrite everything.

First understand what already works and preserve useful components.

==================================================
2. DESIGN SOURCE OF TRUTH
==================================================

The frontend redesign MUST follow:

SkillPath/docs/DESIGN.md

Do not invent a different visual direction.

The intended design is:

- Dark theme
- Navy / blue / cyan accents
- Soft UI
- Glass UI
- Glassmorphism
- Motion
- Premium developer-platform feel
- Technical but friendly
- Modern SaaS / developer-tool aesthetic

The frontend must NOT look like:

- generic AI dashboard
- cyberpunk UI
- gaming interface
- purple neon AI website
- overly futuristic sci-fi product
- random glass cards everywhere

The experience should feel like:

"Developer Learning Platform"

==================================================
3. LANGUAGE
==================================================

Use:

Thai as the primary interface language.

Use English where technical terminology is clearer.

Major headings should generally be Thai.

Examples:

ค้นหาเส้นทางอาชีพของคุณ

ประเมินทักษะปัจจุบัน

วิเคราะห์ Skill Gap

เส้นทางการเรียนรู้ของคุณ

ความพร้อมสู่อาชีพ

Keep technical terms in English:

Career Readiness
Skill Gap
Learning Roadmap
Current Level
Target Level
Framework
Programming Language
Database
Cloud Platform
DevOps

Do NOT translate technology names:

React
Next.js
Python
Docker
AWS
FastAPI
PostgreSQL
Kubernetes
Terraform

Do NOT duplicate every sentence in both Thai and English.

Use English only where useful.

==================================================
4. GLOBAL DESIGN SYSTEM
==================================================

Implement the design tokens defined in DESIGN.md.

Create or refactor centralized tokens for:

- colors
- spacing
- typography
- border radius
- shadows
- glass surfaces
- blur levels
- animation durations
- easing
- containers
- z-index

Avoid scattered hard-coded styling.

Where practical, use:

CSS variables

Tailwind theme extensions

shared utility classes

reusable UI components

==================================================
5. GLOBAL COLOR DIRECTION
==================================================

Use the color system defined in DESIGN.md.

General direction:

Dark navy background

Deep blue-black base

Soft blue surfaces

Cyan / blue accents

White text

Muted blue-gray supporting text

Technology logos may use official brand colors.

Do NOT use:

large purple gradients

rainbow gradients

pink-purple AI styling

excessive saturated neon

==================================================
6. TYPOGRAPHY
==================================================

Use the Thai-compatible font specified in DESIGN.md.

If DESIGN.md gives multiple candidates, choose the most appropriate based on current setup.

Recommended behavior:

Thai:
high readability

English:
clean developer-style typography

Typography hierarchy must be consistent across:

Home
Career Explorer
Career Detail
Assessment
Dashboard
Skill Gap
Roadmap

Do not use inconsistent page-specific typography.

==================================================
7. APP SHELL
==================================================

Create or refactor the global app shell.

Include:

- global background
- navbar
- main content container
- page transition behavior
- footer where appropriate

Navbar should follow DESIGN.md:

floating
dark glass
soft blur
thin border
subtle shadow

Desktop navigation may include:

หน้าหลัก

สำรวจอาชีพ

Dashboard

Roadmap

Do not make navigation too large.

==================================================
8. NAVBAR BEHAVIOR
==================================================

Navbar:

- floating
- glass surface
- responsive
- clear active route
- compact on scroll
- slightly stronger background opacity after scroll
- smooth transition
- accessible focus states

Do NOT create dramatic morphing animations.

Mobile:

- compact navigation
- menu/drawer if needed
- no hover-dependent interactions

==================================================
9. BUTTON SYSTEM
==================================================

Create a consistent reusable button system.

Variants:

Primary

Secondary

Ghost

Danger where required

Primary main CTA should support the DESIGN.md Neon Glow Button style.

Neon Glow Button must remain restrained.

Use:

blue / cyan subtle glow

small hover lift

soft light sweep

optional magnetic pointer response

Do NOT:

use neon glow on every button

use large pointer displacement

use cyberpunk glow

Use Neon Glow only for key actions such as:

เริ่มค้นหาเส้นทางของคุณ

วิเคราะห์ Skill Gap

สร้าง Roadmap

Update Progress

==================================================
10. CARD SYSTEM
==================================================

Follow the DESIGN.md card hierarchy.

Use approximately:

Level 1
normal dark surface

Level 2
Soft UI surface

Level 3
Glass panel

Do not make every card glass.

Create reusable components where appropriate:

SoftCard

GlassPanel

MetricCard

Do not over-abstract trivial elements.

==================================================
11. MOTION SYSTEM
==================================================

Implement the motion rules from DESIGN.md.

Use motion for:

- page entrance
- section reveal
- card hover
- button feedback
- hero interaction
- roadmap node appearance
- progress updates
- marquee
- text emergence

Prefer:

transform

opacity

filter

Avoid continuous unnecessary motion.

Use smooth, premium motion.

Do not create playful bounce-heavy animation.

==================================================
12. REDUCED MOTION
==================================================

Respect:

prefers-reduced-motion

When reduced motion is enabled:

- disable Cursor Ring Field interaction
- stop or simplify marquee
- replace Text Emerge with simple appearance
- disable decorative looping effects
- simplify roadmap animation

All pages must remain fully usable.

==================================================
13. HOME PAGE — FULL REDESIGN
==================================================

Redesign the Home page according to DESIGN.md.

Required sections:

1. Navbar

2. Hero

3. Technology Logo Marquee

4. SkillPath explanation / Text Emerge

5. How SkillPath Works

6. Career Categories

7. Skill Gap Preview

8. Interactive Roadmap Preview

9. Career Readiness Preview

10. Technology / Career Ecosystem

11. Why SkillPath

12. Final CTA

13. Footer

Do not leave Home as a short generic landing page.

The Home page should clearly explain the real application.

==================================================
14. HOME HERO
==================================================

Hero must include:

Eyebrow such as:

SKILLPATH · Career Learning Platform

Primary Thai heading:

รู้ว่าคุณอยู่ตรงไหน
และต้องเรียนอะไรต่อ

Supporting text should explain:

- Skill Gap
- Career readiness
- Roadmap
- skill prerequisites

Primary CTA:

เริ่มค้นหาเส้นทางของคุณ

Secondary CTA:

สำรวจสายอาชีพ

Optional supporting text:

Software · AI · Data · Cloud

Keep hero copy concise and strong.

==================================================
15. CURSOR RING FIELD
==================================================

Implement Cursor Ring Field in the Home Hero as defined in DESIGN.md.

Behavior:

- subtle field of rings
- pointer-responsive
- rings near cursor slightly brighten / scale / shift
- smooth interpolation
- subtle blue/cyan response
- low visual intensity

Do NOT create:

particle explosion

bright neon trails

gaming-style effects

The effect must remain behind content.

Desktop:
interactive pointer response

Mobile:
static or slow ambient version

Performance:

- do not update React state on every mousemove
- use requestAnimationFrame
- minimize DOM work
- Canvas/WebGL only if justified
- keep CPU/GPU usage reasonable

==================================================
16. TECHNOLOGY MARQUEE
==================================================

Implement the Technology Logo Marquee.

Use SkillPath's existing icon registry if available.

Include technologies already supported by the project, such as:

HTML5

CSS3

JavaScript

TypeScript

React

Next.js

Python

FastAPI

PostgreSQL

Git

Docker

Kubernetes

Terraform

AWS

NumPy

Pandas

PyTorch

Style:

- white / monochrome logos
- consistent sizing
- lower opacity by default
- subtle hover brightness
- optional brand color reveal on hover
- smooth continuous movement
- edge fade masks

Do not use remote image URLs if the current icon system already supports local SVG icon rendering.

==================================================
17. TEXT EMERGE
==================================================

Create or reuse a TextEmerge component.

Use for:

- important Home statements
- section introductions
- large explanatory copy

Animation:

- opacity
- small upward movement
- line-by-line or small word groups

Do not animate every paragraph.

Do not use character-by-character animation for long text.

Respect reduced motion.

==================================================
18. HOW SKILLPATH WORKS
==================================================

Create a polished process section:

01
เลือก Career

02
ประเมิน Skill ปัจจุบัน

03
วิเคราะห์ Skill Gap

04
สร้าง Learning Roadmap

05
อัปเดต Progress

Use Thai main text.

Use English technical subtitles where useful.

Add subtle connected-step animation.

Do not overdecorate.

==================================================
19. CAREER CATEGORIES SECTION
==================================================

Display:

Software Engineering

AI & Machine Learning

Data

Cloud & DevOps

Design

Marketing

Each card should show:

- category
- Thai supporting description
- number of careers if available
- related career names or top examples
- subtle icon
- soft hover animation

Use real backend data when feasible.

Avoid duplicated hard-coded career counts if the backend already provides the information.

==================================================
20. HOME SKILL GAP PREVIEW
==================================================

Show a realistic preview of Skill Gap.

Example:

JavaScript

Current
2

Target
5

Gap
3

React

Current
1

Target
4

Gap
3

Use skill logos.

Use clean progress visualization.

This section should visually explain:

"SkillPath shows what you are missing."

==================================================
21. HOME ROADMAP PREVIEW
==================================================

Create a simplified roadmap preview.

Use real SkillPath seeded data if feasible.

Show concept such as:

JavaScript
↓
React
↓
Next.js

and/or:

Python
↓
FastAPI
↓
PostgreSQL

Use:

- technology logos
- clean arrows
- subtle motion

Do not use AI-generated content.

==================================================
22. HOME CAREER READINESS PREVIEW
==================================================

Show:

57%
Career Readiness

Use a progress ring / bar / gauge.

Animate once when entering viewport.

Do not loop indefinitely.

Show example skill breakdown.

==================================================
23. FINAL HOME CTA
==================================================

Use DESIGN.md copy direction:

พร้อมรู้หรือยังว่า
Skill ต่อไปของคุณคืออะไร?

Explore your next step.

Primary Neon Glow Button:

เริ่มค้นหาเส้นทางของคุณ

==================================================
24. CAREER EXPLORER — REDESIGN
==================================================

Redesign Career Explorer using DESIGN.md.

Include:

- Thai page heading
- supporting text
- search
- category filters
- career grid
- clean responsive layout

Career cards should include:

- Career title
- category
- description
- top 3–5 technology logos
- required skill count
- CTA

Example CTA:

ดูเส้นทางอาชีพ

Use subtle hover:

- small lift
- border highlight
- icon movement

Do not create oversized cards.

==================================================
25. CAREER DETAIL — REDESIGN
==================================================

Career Detail should include:

Career name

category

short description

top technologies

primary CTA:

ประเมิน Skill ของฉัน

Sections:

เกี่ยวกับสายอาชีพ

Core Skills

Skill Requirements

Prerequisite preview

Learning estimate where available

Skill cards should show:

- icon
- name
- type
- required level
- importance

==================================================
26. SKILL ASSESSMENT — REDESIGN
==================================================

Keep Assessment functional and focused.

Each skill row/card:

[Logo]

JavaScript
Programming Language

Current Level

0 1 2 3 4 5

Include:

- clear selected state
- progress indicator
- sticky progress summary if useful
- validation feedback
- main CTA

Main CTA:

วิเคราะห์ Skill Gap

Use minimal animation.

Do NOT apply distracting glow to input controls.

==================================================
27. DASHBOARD — REDESIGN
==================================================

Dashboard should feel like a modern developer analytics product.

Primary metric:

Career Readiness

Secondary:

Priority Skills

Critical Skill Gaps

Learning Progress

Current Roadmap

Estimated Study Time

Recent Progress

Use strong visual hierarchy.

Do not create a grid of identical metric cards.

The most important metric should visually dominate.

==================================================
28. SKILL GAP PAGE — REDESIGN
==================================================

Use a clean Current vs Target comparison.

Example:

React

Current
1

→

Target
4

Gap
3

Use:

- logo
- skill type
- progress visualization
- critical label where appropriate

Do not use danger red for normal gaps.

Reserve strong warning color for genuinely critical gaps.

==================================================
29. ROADMAP PAGE — REDESIGN
==================================================

Use the deterministic roadmap graph already provided by the application.

Do NOT change the backend ordering algorithm.

The visual roadmap should follow DESIGN.md:

- dark blue graph canvas
- subtle grid/dots
- readable skill nodes
- technology logos
- clean arrows
- status styling
- selected node panel

Node states:

Completed

Current

Available

Locked

Critical

Use restrained state emphasis.

Do not create bright glowing edges everywhere.

==================================================
30. ROADMAP NODE DESIGN
==================================================

Roadmap node should include:

technology icon

skill name

skill type

Current → Target

estimated hours

status

Example:

React
Library

1 → 4

28 hrs

CURRENT

Keep nodes compact.

==================================================
31. ROADMAP DETAIL PANEL
==================================================

Clicking a node should display useful details:

Skill name

type

current level

target level

gap

estimated time

prerequisites

skills unlocked

learning resources

progress action if supported

Use strong glass panel styling here.

==================================================
32. ROADMAP MOTION
==================================================

Allowed:

- nodes fade/slide into position
- edges draw subtly
- current node slight pulse
- smooth recalculation state transition

Do NOT create:

- constant floating graph nodes
- particle lines
- neon edge glow
- continuous unnecessary movement

==================================================
33. TECHNOLOGY IDENTITY
==================================================

Reuse the existing centralized SkillIcon system.

Do not create duplicate icon mapping systems.

Where skills appear, show:

icon

name

type

Use official logo color selectively.

Examples:

React
Next.js
Python
Docker
AWS
PostgreSQL

Generic skills use consistent generic icons.

==================================================
34. LOADING STATES
==================================================

Redesign loading states.

Use:

- skeleton
- soft shimmer
- low-contrast surfaces

Create appropriate skeletons for:

Career Explorer

Career Detail

Assessment

Dashboard

Skill Gap

Roadmap

Respect reduced motion.

==================================================
35. EMPTY STATES
==================================================

Create meaningful Thai empty states.

Examples:

ยังไม่มี Roadmap

ยังไม่มีข้อมูล Skill Assessment

คุณมี Skill ครบตาม Requirement แล้ว

Include useful CTA.

Do not show generic "No data".

==================================================
36. ERROR STATES
==================================================

Use clear Thai messages.

Examples:

ไม่สามารถโหลดข้อมูลได้

ไม่พบ Career นี้

ไม่สามารถสร้าง Roadmap ได้

กรุณาลองใหม่อีกครั้ง

Provide retry action where applicable.

Do not show raw backend stack traces.

==================================================
37. RESPONSIVE DESIGN
==================================================

Implement responsive behavior for:

Mobile

Tablet

Desktop

Large Desktop

Do not design only for desktop.

Suggested max width:

1200–1440px

Home Hero may be wider.

Dashboard and Roadmap may use wider workspace layouts.

==================================================
38. MOBILE RULES
==================================================

Mobile:

- Cursor Ring Field disabled or simplified
- Hero becomes single column
- marquee remains lightweight
- navigation becomes compact
- cards stack cleanly
- roadmap favors vertical orientation
- graph remains pan/zoom friendly
- hover-only interactions must have touch alternatives
- glass blur may be reduced for performance

==================================================
39. PERFORMANCE
==================================================

Frontend redesign must remain performant.

Rules:

- prefer transform / opacity animations
- avoid mouse-driven React state updates
- lazy load heavy effects
- avoid excessive blur layers
- avoid large unoptimized images
- avoid layout thrashing
- avoid unnecessary client components
- use memoization only where appropriate
- do not overuse backdrop-filter

Do not trade performance for visual effects.

==================================================
40. ACCESSIBILITY
==================================================

Ensure:

- readable contrast
- semantic headings
- keyboard navigation
- focus states
- accessible buttons
- labels for controls
- minimum touch target sizing
- reduced motion
- icons are not the only source of meaning

Thai text must remain readable.

==================================================
41. COMPONENTIZATION
==================================================

Create/refactor reusable components where they genuinely help.

Likely components:

AppNavbar

GlassPanel

SoftCard

NeonGlowButton

SectionHeading

TextEmerge

LogoMarquee

CursorRingField

CareerCard

SkillIcon

SkillBadge

SkillProgress

ReadinessGauge

RoadmapGraph

RoadmapSkillNode

MetricCard

FilterTabs

EmptyState

ErrorState

PageSkeleton

Do not create a component file for every tiny wrapper.

==================================================
42. GLOBAL CONSISTENCY
==================================================

All pages must use the same:

- typography
- spacing scale
- button hierarchy
- card hierarchy
- motion language
- icon system
- glass behavior
- radius
- shadow
- page container

Do not redesign each page independently.

==================================================
43. PRESERVE FUNCTIONALITY
==================================================

The redesign MUST NOT break:

Career Explorer

Career filtering

Career Detail

Profile creation

Skill Assessment

Skill Gap Analysis

Career Readiness

Roadmap generation

Roadmap strategies

Roadmap visualization

Progress updates

Roadmap recalculation

Learning Resources

API integration

If a visual refactor risks breaking logic, preserve the logic first.

==================================================
44. NO BACKEND REWRITE
==================================================

Do NOT rewrite:

GapAnalyzer

RoadmapEngine

RoadmapStrategy

prerequisite logic

priority calculation

career readiness

database logic

unless a frontend integration bug requires a minimal compatibility change.

Frontend should adapt to backend data.

==================================================
45. NO AI
==================================================

Do NOT add:

OpenAI

Gemini

Claude

AI API

chatbot

AI-generated roadmap

prompt system

The current deterministic SkillPath system remains authoritative.

==================================================
46. CLEANUP
==================================================

During the redesign:

- remove obsolete frontend components
- remove duplicated styles
- remove dead CSS
- remove unused imports
- remove abandoned mock data
- remove deprecated UI components

Do NOT remove backend-dependent logic.

==================================================
47. IMPLEMENTATION ORDER
==================================================

Follow this approximate order:

PHASE 1

Read DESIGN.md
Audit frontend
Define design tokens
Typography
Global styles
App shell
Navbar

PHASE 2

Button system
Card system
Glass components
Skill identity integration

PHASE 3

Home Hero
Cursor Ring Field
Logo Marquee
Text Emerge
Home sections

PHASE 4

Career Explorer
Career Detail

PHASE 5

Assessment
Skill Gap
Dashboard

PHASE 6

Roadmap visual polish
Roadmap details
Graph motion

PHASE 7

Loading
Empty
Error states

PHASE 8

Responsive
Accessibility
Performance
Cleanup

PHASE 9

Testing
Typecheck
Build
Manual verification

==================================================
48. TESTING
==================================================

After redesign:

Run frontend typecheck.

Run lint if configured.

Run production build.

Run existing backend tests if frontend integration changed.

Fix all TypeScript errors.

Fix hydration issues.

Fix broken imports.

Fix responsive layout issues.

Fix accessibility issues where practical.

==================================================
49. MANUAL VERIFICATION
==================================================

Manually verify:

Home

Career Explorer

Career Detail

Assessment

Dashboard

Skill Gap

Roadmap

Progress Update

Roadmap Recalculation

Test:

desktop

tablet

mobile

dark theme

reduced motion

keyboard navigation

loading states

empty states

error states

==================================================
50. FULL USER FLOW
==================================================

Test at least one complete flow:

Home

→ Career Explorer

→ Full Stack Developer

→ Skill Assessment

→ Skill Gap Analysis

→ Career Readiness

→ Generate Roadmap

→ Open Roadmap Diagram

→ Select Skill Node

→ Update Progress

→ Recalculate Roadmap

Confirm:

- styling remains consistent
- animation works
- API works
- progress works
- no layout breaks
- roadmap logic remains correct

==================================================
51. SECOND USER FLOW
==================================================

Also test another career such as:

AI Engineer

or

Cloud Engineer

Confirm the redesigned UI works with different skill sets and roadmap graph shapes.

==================================================
52. ANTI-PATTERNS
==================================================

Do NOT:

- put glass blur on every component
- add purple AI gradients
- add random animated backgrounds on every page
- add excessive glow
- add AI sparkle icons
- create giant pill buttons everywhere
- over-round every card
- overanimate forms
- use emoji as permanent UI icons
- duplicate API state in hard-coded frontend mocks
- hard-code career-specific UI
- break deterministic roadmap logic
- remove Thai readability for visual style

==================================================
53. DEFINITION OF DONE
==================================================

The redesign is complete only when:

- every main page follows DESIGN.md
- dark blue design system is consistent
- Thai-first language is applied consistently
- Home Hero uses Cursor Ring Field
- Home has Technology Marquee
- Text Emerge exists and is used selectively
- Neon Glow Button is implemented
- Home has expanded useful content
- Skill technology logos are integrated
- Career pages are redesigned
- Assessment is redesigned
- Dashboard is redesigned
- Skill Gap is redesigned
- Roadmap is redesigned
- loading states are consistent
- empty states are consistent
- error states are consistent
- mobile works
- reduced motion works
- TypeScript passes
- production build passes
- existing core functionality still works

==================================================
54. FINAL REPORT
==================================================

After completing the redesign, provide a concise report containing:

- DESIGN.md sections implemented
- pages redesigned
- reusable components created
- components removed
- color/tokens implemented
- typography
- Home Hero implementation
- Cursor Ring Field implementation
- Technology Marquee implementation
- Text Emerge implementation
- Neon Glow Button implementation
- roadmap UI changes
- responsive behavior
- accessibility improvements
- performance considerations
- dependencies added
- typecheck result
- build result
- remaining minor limitations

IMPORTANT:

Do not stop after redesigning only the Home page.

The task is to redesign the ENTIRE SkillPath frontend while preserving all existing functionality.

The final product should feel like one coherent application based on:

SkillPath/docs/DESIGN.md