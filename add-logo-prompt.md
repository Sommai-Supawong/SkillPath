You are working on the existing SkillPath project.

Before modifying anything:

1. Read `SkillPath/docs/Document.md`.
2. Inspect the current Skill database model.
3. Inspect the Skill API schemas.
4. Inspect every frontend location where skills are displayed.
5. Inspect the current icon libraries already installed in the project.

The objective of this task is to improve SKILL RECOGNITION and SCANNABILITY across SkillPath.

Do NOT perform a full UI redesign.

Users should be able to quickly recognize technologies such as:

HTML
CSS
JavaScript
TypeScript
Python
React
Next.js
FastAPI
PostgreSQL
Docker
AWS
Kubernetes
Terraform
PyTorch

without needing to carefully read every skill name.

---

# CORE IDEA

Create a centralized Skill Identity System.

Each skill should visually support:

* skill logo/icon
* skill name
* skill type/category
* optional official brand color

Example:

React logo
React
Library

Next.js logo
Next.js
Framework

Python logo
Python
Programming Language

Docker logo
Docker
DevOps Tool

PostgreSQL logo
PostgreSQL
Database

---

# ICON SOURCE

Use `simple-icons` as the primary source for branded technology icons.

Install it if necessary:

npm install simple-icons

Use direct icon imports where possible so the frontend bundle can tree-shake unused icons.

Do not load the entire icon catalog dynamically into the browser if avoidable.

Examples:

import {
siReact,
siNextdotjs,
siJavascript,
siTypescript,
siPython,
siDocker
} from "simple-icons"

Simple Icons provides:

* SVG path
* title
* slug
* brand hex color

Use these values rather than manually redrawing logos.

---

# IMPORTANT ICON RULE

Use real branded icons only for technologies/products that actually have recognizable logos.

Examples:

HTML5
CSS
JavaScript
TypeScript
React
Next.js
Python
FastAPI
PostgreSQL
Git
GitHub
Docker
Kubernetes
Terraform
AWS
PyTorch
Pandas
NumPy
Scikit-learn

For abstract skills that do NOT have an official recognizable product logo, use a generic UI icon instead.

Examples:

Algorithms
Data Structures
Object-Oriented Programming
System Design
Statistics
Probability
Communication
Debugging
Testing
Data Modeling

Use the project's existing generic icon library such as Lucide for these.

Do NOT invent fake brand logos.

---

# SKILL TYPES

Introduce a normalized skill type system.

Recommended types:

Programming Language

Markup Language

Stylesheet

Framework

Library

Runtime

Database

API / Backend

Cloud Platform

DevOps

AI / Machine Learning

Data

Testing

Version Control

Infrastructure

Concept

Soft Skill

Tool

You may simplify this list if the existing database architecture already has a suitable category field.

---

# RECOMMENDED CLASSIFICATION

Use classifications similar to:

HTML
→ Markup Language

CSS
→ Stylesheet

JavaScript
→ Programming Language

TypeScript
→ Programming Language

Python
→ Programming Language

React
→ Library

Next.js
→ Framework

FastAPI
→ Framework

REST API
→ API / Backend

PostgreSQL
→ Database

SQL
→ Programming Language or Database Language

Git
→ Version Control

GitHub
→ Tool

Docker
→ DevOps

Kubernetes
→ Infrastructure

Terraform
→ Infrastructure

AWS
→ Cloud Platform

Linux
→ Tool / Platform

Pandas
→ Data

NumPy
→ Data

Scikit-learn
→ AI / Machine Learning

PyTorch
→ AI / Machine Learning

Machine Learning
→ AI / Machine Learning

Deep Learning
→ AI / Machine Learning

Large Language Models
→ AI / Machine Learning

Algorithms
→ Concept

Data Structures
→ Concept

Object-Oriented Programming
→ Concept

System Design
→ Concept

Statistics
→ Concept

---

# DATA MODEL

Inspect the current Skill model first.

If necessary, extend it safely with metadata such as:

skill_type

icon_key

icon_kind

Do NOT store React components in the database.

Recommended conceptual fields:

skill_type:
"Framework"

icon_key:
"react"

icon_kind:
"simple-icons"

For generic concepts:

icon_key:
"network"

icon_kind:
"lucide"

Optional:

brand_color:
"61DAFB"

However, if Simple Icons already provides the brand color in the frontend registry, do not duplicate it in the database unnecessarily.

Prefer keeping visual implementation details in the frontend registry while keeping semantic metadata such as `skill_type` in the database.

---

# CENTRAL ICON REGISTRY

Create one centralized frontend registry.

Example location:

lib/skills/skill-icons.ts

or

lib/skills/skillIdentity.ts

Do NOT spread large switch statements across multiple components.

Conceptually:

const skillIconRegistry = {
html: ...,
css: ...,
javascript: ...,
typescript: ...,
react: ...,
nextjs: ...,
python: ...,
fastapi: ...,
postgresql: ...,
docker: ...,
kubernetes: ...,
terraform: ...,
aws: ...,
}

The registry should contain enough metadata to render:

* SVG path/component
* official brand color when appropriate
* fallback icon
* skill type where useful

Normalize matching so differences such as:

Next.js
NextJS
nextjs

do not break the icon lookup.

Prefer using an explicit `icon_key` from the API instead of guessing from display names when possible.

---

# REUSABLE COMPONENT

Create a reusable component such as:

SkillIcon

and a higher-level component such as:

SkillBadge

or:

SkillIdentity

Example API:

<SkillIcon
iconKey="react"
size="md"
/>

and:

<SkillBadge
name="React"
iconKey="react"
type="Library"
/>

Do not manually duplicate icon markup in each page.

---

# COMPONENT BEHAVIOR

SkillIcon should support:

sizes:

sm
md
lg

Suggested approximate sizing:

sm = 18–20px
md = 24–28px
lg = 32–40px

It must work correctly on both dark and light backgrounds.

Handle monochrome logos carefully.

Example:

Next.js logo is normally monochrome.

On dark backgrounds, render an accessible light version where needed.

Do not place a black logo on a nearly black background.

---

# BRAND COLORS

Where appropriate, render technology icons using their recognizable brand colors.

Examples conceptually:

JavaScript → yellow

TypeScript → blue

React → cyan

Python → blue/yellow identity

HTML → orange

CSS → blue

Docker → blue

Kubernetes → blue

Terraform → purple

PostgreSQL → blue

However:

* use the color supplied by the icon package when available
* do not manually approximate official brand colors unless necessary
* preserve accessibility
* avoid making entire cards brightly colored

The icon can use brand color while the surrounding UI remains consistent.

---

# FALLBACK SYSTEM

If an icon cannot be found:

DO NOT display a broken image.

Fallback order:

1. branded icon
2. generic icon based on skill type
3. default `Code2` or equivalent icon

Example:

Framework
→ Boxes / Layers

Database
→ Database

Cloud
→ Cloud

Testing
→ TestTube

Data
→ Chart / Database

AI
→ BrainCircuit

Concept
→ Lightbulb or Network

Programming Language
→ Code2

---

# TOOLTIP

When useful, allow hovering/focusing on an icon to show:

React
Library

or:

Docker
DevOps

Do not make tooltip interaction mandatory for understanding the UI.

The text label must remain visible.

---

# SKILL CARD DESIGN

Update existing skill cards without redesigning the whole application.

Recommended structure:

┌─────────────────────────────┐
│ [React Logo] React          │
│              Library        │
│                             │
│ Current     2 / 5           │
│ Required    4 / 5           │
│ █████░░░░░                  │
└─────────────────────────────┘

The technology icon should be visually prominent but not oversized.

---

# CAREER DETAIL PAGE

For required skills, display:

[icon] Skill Name
Skill Type

Required Level
Importance

Example:

[React logo]
React
Library

Required
4 / 5

Importance
Core

This should make long skill lists easier to scan.

---

# SKILL ASSESSMENT PAGE

Add icons beside each skill being assessed.

Example:

[JS] JavaScript
Programming Language

Current Skill Level

0 1 2 3 4 5

Icons must not interfere with sliders or accessibility.

---

# GAP ANALYSIS PAGE

Show icons in Critical Gaps.

Example:

[React] React
Framework / Library
Current 1
Required 4
Gap 3

[JS] JavaScript
Programming Language
Current 2
Required 5
Gap 3

This should allow users to visually recognize the technology before reading the details.

---

# ROADMAP PAGE

This is especially important.

A roadmap step should visually look similar to:

[JS icon]
JavaScript

Programming Language
Current 2 → Target 4

12 Estimated Hours

```
    ↓
```

[React icon]
React

Library
Current 1 → Target 3

16 Estimated Hours

```
    ↓
```

[Next.js icon]
Next.js

Framework

The icon should make the learning path visually understandable.

---

# CAREER EXPLORER

Do NOT place every technology logo inside the career card.

Instead show approximately the top 3–5 important technologies.

Example:

Full Stack Developer

[JS] [React] [Next] [Python] [PostgreSQL]

14 Required Skills

This gives users a quick visual hint about the technology stack of the career.

Select these based on highest importance / core requirements rather than hardcoding them per card when possible.

---

# DASHBOARD

For sections such as:

Priority Skills

Critical Skill Gaps

Recently Improved

display the relevant logos.

Example:

Priority Skills

01 [React] React
02 [JS] JavaScript
03 [Git] Git

---

# SEARCH / FILTERING

If SkillPath already supports skill filtering, allow users to visually identify categories.

Optional simple filter:

All
Languages
Frameworks
Data
AI
Cloud
DevOps
Databases
Tools

Do not build a large new feature if filtering does not naturally fit the current UI.

---

# TECH ICONS TO SUPPORT FIRST

At minimum support these branded technologies if they exist in the dataset:

HTML5
CSS
JavaScript
TypeScript
Python
React
Next.js
FastAPI
Git
GitHub
PostgreSQL
Docker
Kubernetes
Terraform
AWS
NumPy
Pandas
Scikit-learn
PyTorch

Also inspect the actual SkillPath database and add icons for other recognizable technologies currently present.

---

# GENERIC ICON MAPPING

Create sensible generic mappings for non-brand skills.

Examples:

Algorithms
→ GitBranch / Workflow

Data Structures
→ Network

Object-Oriented Programming
→ Boxes

System Design
→ Network / PanelsTopLeft

Database Design
→ Database

REST API
→ Braces / Server

Testing
→ TestTube

Debugging
→ Bug

Statistics
→ ChartNoAxesCombined

Probability
→ Percent / Chart

Communication
→ MessagesSquare

Security
→ Shield

Networking
→ Network

Cloud Fundamentals
→ Cloud

Monitoring
→ Activity

Data Visualization
→ ChartColumn

Do not obsess over exact icons. Consistency matters more.

---

# ACCESSIBILITY

Icons must not be the only way information is communicated.

Always keep the skill name visible.

Use:

aria-hidden="true"

for decorative icons where appropriate.

If an icon itself needs accessible meaning, provide an accessible label.

Ensure sufficient contrast.

---

# PERFORMANCE

Do not load dozens of remote image URLs for every skill card.

Prefer bundled SVG icons.

Avoid rendering the full Simple Icons package client-side.

Import only icons that are actually used where technically feasible.

Keep SkillIcon lightweight.

---

# DATABASE / SEED UPDATE

If `skill_type` and `icon_key` become database fields:

update the existing seed data.

Populate all current skills.

Examples:

JavaScript
skill_type = Programming Language
icon_key = javascript

React
skill_type = Library
icon_key = react

Next.js
skill_type = Framework
icon_key = nextdotjs

Python
skill_type = Programming Language
icon_key = python

Docker
skill_type = DevOps
icon_key = docker

PostgreSQL
skill_type = Database
icon_key = postgresql

For generic skills:

Algorithms
skill_type = Concept
icon_key = workflow
icon_kind = lucide

Ensure seeding remains idempotent.

Do not recreate existing skills.

---

# API

If new semantic fields are added:

ensure API responses include:

skill_type
icon_key
icon_kind

Do not send actual SVG markup from FastAPI.

Rendering should remain a frontend responsibility.

---

# FRONTEND TYPES

Update TypeScript interfaces/types accordingly.

Example:

Skill {
id: number
name: string
description?: string
category?: string
skill_type: string
icon_key?: string
icon_kind?: "simple-icons" | "lucide"
}

Keep types synchronized with API responses.

---

# TESTS

Add relevant tests.

Backend:

* new metadata persists correctly
* API serializes skill_type/icon_key correctly
* seed does not create duplicate skills

Frontend where testing infrastructure exists:

* known technology renders branded icon
* unknown icon uses fallback
* generic Concept renders generic icon
* skill name remains visible

Do not introduce a completely new testing framework just for this small change.

---

# FALLBACK SAFETY

The application must continue working even when:

icon_key is null

icon key is invalid

Simple Icons does not contain the requested technology

skill_type is unknown

In all cases:

show the Skill name
show a safe generic icon
never throw a rendering error

---

# FINAL VERIFICATION

After implementation:

1. Seed/update the database.
2. Start FastAPI.
3. Verify skill API metadata.
4. Start Next.js.
5. Check Career Explorer.
6. Check Career Detail.
7. Check Skill Assessment.
8. Check Gap Analysis.
9. Check Dashboard.
10. Check Roadmap.
11. Test dark backgrounds.
12. Test responsive layout.
13. Test an unknown/fallback skill.
14. Run backend tests.
15. Run frontend typecheck/lint.
16. Run production build.
17. Fix all errors found.

Manually verify at least:

HTML
CSS
JavaScript
TypeScript
Python
React
Next.js
FastAPI
PostgreSQL
Git
Docker
AWS
Kubernetes
Terraform
PyTorch

At the end report:

* packages added
* files created
* files changed
* Skill model changes
* API changes
* number of branded icons mapped
* number of generic icon mappings
* pages updated
* fallback behavior
* tests run
* build result

Do NOT redesign the entire application.

The objective is:

MAKE TECHNOLOGIES AND SKILLS IMMEDIATELY RECOGNIZABLE THROUGH A CONSISTENT LOGO / ICON / SKILL-TYPE SYSTEM ACROSS SKILLPATH.
