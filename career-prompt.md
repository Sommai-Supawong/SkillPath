You are working on the existing SkillPath project.

Before modifying anything, read:

SkillPath/docs/Document.md

Then inspect the existing project, database models, seed files, migrations, and current career/skill data.

The project may already contain these careers:

* Frontend Developer
* Backend Developer
* Data Analyst
* UI/UX Designer
* Digital Marketer

DO NOT duplicate existing careers or skills.

Your task is to expand the SkillPath career dataset with additional careers related to:

* Software Engineering
* AI & Machine Learning
* Data
* Cloud & DevOps

The priority is DATA QUALITY, CONSISTENCY, and CORRECT RELATIONSHIPS.

Do not redesign the UI in this task.

---

# GOAL

Add the following 10 careers:

1. Full Stack Developer
2. Software Engineer
3. DevOps Engineer
4. QA Automation Engineer
5. AI Engineer
6. Machine Learning Engineer
7. Generative AI Engineer
8. Data Scientist
9. Data Engineer
10. Cloud Engineer

After completion, SkillPath should contain approximately 15 career options including the existing careers.

---

# IMPORTANT IMPLEMENTATION RULES

Before adding data:

1. Inspect the current database schema.
2. Inspect current skills.
3. Reuse existing skills whenever the same skill already exists.
4. Do not create duplicate skills with slightly different names.
5. Normalize skill naming.
6. Preserve existing IDs and relationships.
7. Make seed scripts safe to run more than once if possible.
8. If a skill exists, update/reuse it rather than creating another copy.
9. Preserve all existing user/profile data.
10. Do not delete existing careers.

Use the current database architecture rather than replacing it unnecessarily.

---

# CAREER CATEGORIES

Standardize career categories into:

Software Engineering

AI & Machine Learning

Data

Cloud & DevOps

Design

Marketing

Update existing career categories only if doing so is safe and compatible with the current application.

Recommended mapping:

Frontend Developer
→ Software Engineering

Backend Developer
→ Software Engineering

Full Stack Developer
→ Software Engineering

Software Engineer
→ Software Engineering

QA Automation Engineer
→ Software Engineering

AI Engineer
→ AI & Machine Learning

Machine Learning Engineer
→ AI & Machine Learning

Generative AI Engineer
→ AI & Machine Learning

Data Analyst
→ Data

Data Scientist
→ Data

Data Engineer
→ Data

DevOps Engineer
→ Cloud & DevOps

Cloud Engineer
→ Cloud & DevOps

UI/UX Designer
→ Design

Digital Marketer
→ Marketing

---

# SKILL LEVEL SCALE

Use:

0 = No experience
1 = Basic Awareness
2 = Beginner
3 = Intermediate
4 = Proficient
5 = Advanced

Career requirements should generally use levels 2–5.

Avoid requiring level 5 for every skill.

---

# IMPORTANCE SCALE

Use:

1 = Nice to have
2 = Useful
3 = Important
4 = Very Important
5 = Core / Critical

---

# SKILL DIFFICULTY SCALE

If the current Skill model has a difficulty field:

1 = Easy
2 = Basic
3 = Intermediate
4 = Advanced
5 = Complex

---

# CAREER 1 — FULL STACK DEVELOPER

Category:

Software Engineering

Description:

A Full Stack Developer builds both client-side and server-side web applications. They work with frontend interfaces, backend APIs, databases, version control, deployment workflows, and application architecture.

Recommended requirements:

HTML
required_level: 4
importance: 4

CSS
required_level: 4
importance: 4

JavaScript
required_level: 4
importance: 5

TypeScript
required_level: 3
importance: 4

React
required_level: 4
importance: 5

Next.js
required_level: 3
importance: 4

Python
required_level: 3
importance: 4

FastAPI
required_level: 3
importance: 4

REST API
required_level: 4
importance: 5

SQL
required_level: 3
importance: 4

PostgreSQL
required_level: 3
importance: 3

Git
required_level: 4
importance: 4

Testing
required_level: 3
importance: 3

Docker
required_level: 2
importance: 2

---

# CAREER 2 — SOFTWARE ENGINEER

Category:

Software Engineering

Description:

A Software Engineer designs, develops, tests, and maintains software systems using programming principles, algorithms, object-oriented design, testing practices, version control, and software architecture.

Requirements:

Programming Fundamentals
required_level: 4
importance: 5

Object-Oriented Programming
required_level: 4
importance: 5

Data Structures
required_level: 4
importance: 5

Algorithms
required_level: 4
importance: 5

Python
required_level: 3
importance: 3

Git
required_level: 4
importance: 4

SQL
required_level: 3
importance: 3

Database Design
required_level: 3
importance: 3

REST API
required_level: 3
importance: 3

Testing
required_level: 4
importance: 4

Software Design Principles
required_level: 4
importance: 4

System Design
required_level: 3
importance: 4

Debugging
required_level: 4
importance: 4

---

# CAREER 3 — DEVOPS ENGINEER

Category:

Cloud & DevOps

Description:

A DevOps Engineer improves the software delivery process by automating builds, testing, deployment, infrastructure provisioning, monitoring, and operational workflows.

Requirements:

Linux
required_level: 4
importance: 5

Networking Fundamentals
required_level: 3
importance: 4

Git
required_level: 4
importance: 4

Shell Scripting
required_level: 3
importance: 4

Python
required_level: 3
importance: 3

Docker
required_level: 4
importance: 5

CI/CD
required_level: 4
importance: 5

Cloud Fundamentals
required_level: 4
importance: 5

AWS
required_level: 3
importance: 4

Kubernetes
required_level: 3
importance: 4

Infrastructure as Code
required_level: 3
importance: 4

Terraform
required_level: 3
importance: 4

Monitoring & Observability
required_level: 3
importance: 4

Security Fundamentals
required_level: 2
importance: 3

---

# CAREER 4 — QA AUTOMATION ENGINEER

Category:

Software Engineering

Description:

A QA Automation Engineer designs automated tests to verify software quality. They create test plans, write automated UI and API tests, integrate testing into CI/CD pipelines, and identify software defects.

Requirements:

Software Testing Fundamentals
required_level: 4
importance: 5

Test Case Design
required_level: 4
importance: 5

Python
required_level: 3
importance: 4

JavaScript
required_level: 2
importance: 2

API Testing
required_level: 4
importance: 5

REST API
required_level: 3
importance: 4

Playwright
required_level: 3
importance: 4

Selenium
required_level: 2
importance: 3

Git
required_level: 3
importance: 4

CI/CD
required_level: 2
importance: 3

SQL
required_level: 2
importance: 3

Debugging
required_level: 3
importance: 4

Performance Testing
required_level: 2
importance: 2

---

# CAREER 5 — AI ENGINEER

Category:

AI & Machine Learning

Description:

An AI Engineer builds intelligent software systems that integrate machine learning models, AI services, APIs, data pipelines, model deployment, and production infrastructure.

Requirements:

Python
required_level: 4
importance: 5

NumPy
required_level: 3
importance: 3

Pandas
required_level: 3
importance: 4

Statistics
required_level: 3
importance: 4

Machine Learning
required_level: 4
importance: 5

Deep Learning
required_level: 3
importance: 4

PyTorch
required_level: 3
importance: 4

Model Evaluation
required_level: 3
importance: 4

REST API
required_level: 3
importance: 3

FastAPI
required_level: 3
importance: 3

Docker
required_level: 3
importance: 4

Cloud Fundamentals
required_level: 3
importance: 3

MLOps Fundamentals
required_level: 3
importance: 4

Git
required_level: 3
importance: 3

---

# CAREER 6 — MACHINE LEARNING ENGINEER

Category:

AI & Machine Learning

Description:

A Machine Learning Engineer develops, evaluates, deploys, and maintains machine learning systems. They bridge data science and software engineering to operate models reliably in production.

Requirements:

Python
required_level: 4
importance: 5

NumPy
required_level: 4
importance: 4

Pandas
required_level: 4
importance: 4

Statistics
required_level: 4
importance: 5

Probability
required_level: 3
importance: 4

Linear Algebra
required_level: 3
importance: 4

Data Preprocessing
required_level: 4
importance: 5

Machine Learning
required_level: 5
importance: 5

Scikit-learn
required_level: 4
importance: 5

Deep Learning
required_level: 3
importance: 4

PyTorch
required_level: 3
importance: 4

Model Evaluation
required_level: 4
importance: 5

Feature Engineering
required_level: 4
importance: 4

Docker
required_level: 3
importance: 3

Model Deployment
required_level: 3
importance: 4

MLOps Fundamentals
required_level: 3
importance: 4

Git
required_level: 3
importance: 3

---

# CAREER 7 — GENERATIVE AI ENGINEER

Category:

AI & Machine Learning

Description:

A Generative AI Engineer builds applications using large language models and generative AI systems. They work with prompting, embeddings, vector search, retrieval-augmented generation, model APIs, evaluation, backend services, and deployment.

Requirements:

Python
required_level: 4
importance: 5

Machine Learning
required_level: 3
importance: 4

Deep Learning
required_level: 3
importance: 4

Natural Language Processing
required_level: 3
importance: 4

Transformers
required_level: 4
importance: 5

Large Language Models
required_level: 4
importance: 5

Prompt Engineering
required_level: 4
importance: 4

Embeddings
required_level: 4
importance: 5

Vector Databases
required_level: 3
importance: 4

Retrieval-Augmented Generation
required_level: 4
importance: 5

LLM Evaluation
required_level: 3
importance: 4

FastAPI
required_level: 3
importance: 3

REST API
required_level: 3
importance: 3

Docker
required_level: 3
importance: 3

Cloud Fundamentals
required_level: 3
importance: 3

Git
required_level: 3
importance: 3

---

# CAREER 8 — DATA SCIENTIST

Category:

Data

Description:

A Data Scientist analyzes data, performs statistical analysis, builds predictive models, conducts experiments, and communicates findings to support data-driven decisions.

Requirements:

Python
required_level: 4
importance: 5

SQL
required_level: 4
importance: 5

NumPy
required_level: 4
importance: 4

Pandas
required_level: 4
importance: 5

Statistics
required_level: 4
importance: 5

Probability
required_level: 3
importance: 4

Data Cleaning
required_level: 4
importance: 4

Exploratory Data Analysis
required_level: 4
importance: 5

Data Visualization
required_level: 4
importance: 4

Machine Learning
required_level: 4
importance: 5

Scikit-learn
required_level: 4
importance: 4

Feature Engineering
required_level: 3
importance: 4

Model Evaluation
required_level: 4
importance: 4

Experimentation
required_level: 3
importance: 3

Communication
required_level: 3
importance: 4

---

# CAREER 9 — DATA ENGINEER

Category:

Data

Description:

A Data Engineer designs and maintains systems that collect, transform, store, and deliver reliable data for analytics, business intelligence, and machine learning workloads.

Requirements:

Python
required_level: 4
importance: 5

SQL
required_level: 5
importance: 5

Database Design
required_level: 4
importance: 4

Data Modeling
required_level: 4
importance: 5

ETL
required_level: 4
importance: 5

Data Warehouse
required_level: 4
importance: 5

PostgreSQL
required_level: 3
importance: 3

Apache Spark
required_level: 3
importance: 4

Apache Airflow
required_level: 3
importance: 4

Cloud Fundamentals
required_level: 3
importance: 4

Docker
required_level: 3
importance: 3

Linux
required_level: 3
importance: 3

Git
required_level: 3
importance: 3

Data Quality
required_level: 4
importance: 4

Pipeline Monitoring
required_level: 3
importance: 4

---

# CAREER 10 — CLOUD ENGINEER

Category:

Cloud & DevOps

Description:

A Cloud Engineer designs, deploys, manages, and secures cloud infrastructure. They work with compute, storage, networking, identity management, containers, automation, monitoring, and infrastructure as code.

Requirements:

Linux
required_level: 4
importance: 5

Networking Fundamentals
required_level: 4
importance: 5

Cloud Fundamentals
required_level: 5
importance: 5

AWS
required_level: 4
importance: 5

Cloud Networking
required_level: 4
importance: 5

Identity and Access Management
required_level: 4
importance: 5

Docker
required_level: 3
importance: 4

Kubernetes
required_level: 3
importance: 3

Infrastructure as Code
required_level: 4
importance: 5

Terraform
required_level: 4
importance: 5

CI/CD
required_level: 3
importance: 3

Monitoring & Observability
required_level: 4
importance: 4

Cloud Security
required_level: 3
importance: 4

Python
required_level: 2
importance: 2

Git
required_level: 3
importance: 3

---

# SHARED SKILL CATALOG

Create or reuse the following skills where needed.

Do NOT duplicate skills already in the database.

Software Engineering:

Programming Fundamentals

Object-Oriented Programming

Data Structures

Algorithms

Software Design Principles

System Design

Debugging

Software Testing Fundamentals

Test Case Design

Testing

API Testing

Performance Testing

HTML

CSS

JavaScript

TypeScript

React

Next.js

Python

FastAPI

REST API

Git

SQL

PostgreSQL

Database Design

Playwright

Selenium

---

AI & Machine Learning:

NumPy

Pandas

Statistics

Probability

Linear Algebra

Data Preprocessing

Machine Learning

Scikit-learn

Deep Learning

PyTorch

Feature Engineering

Model Evaluation

Model Deployment

MLOps Fundamentals

Natural Language Processing

Transformers

Large Language Models

Prompt Engineering

Embeddings

Vector Databases

Retrieval-Augmented Generation

LLM Evaluation

---

Data:

Data Cleaning

Exploratory Data Analysis

Data Visualization

Experimentation

Data Modeling

ETL

Data Warehouse

Apache Spark

Apache Airflow

Data Quality

Pipeline Monitoring

Communication

---

Cloud & DevOps:

Linux

Networking Fundamentals

Shell Scripting

Docker

CI/CD

Cloud Fundamentals

AWS

Kubernetes

Infrastructure as Code

Terraform

Monitoring & Observability

Security Fundamentals

Cloud Networking

Identity and Access Management

Cloud Security

---

# RECOMMENDED SKILL DIFFICULTIES

If supported by the schema, use approximately:

Programming Fundamentals = 2

Object-Oriented Programming = 3

Data Structures = 3

Algorithms = 4

System Design = 4

HTML = 1

CSS = 2

JavaScript = 3

TypeScript = 3

React = 3

Next.js = 4

Python = 2

FastAPI = 3

REST API = 2

Git = 2

SQL = 2

Database Design = 3

Linux = 3

Networking Fundamentals = 3

Docker = 3

CI/CD = 3

Cloud Fundamentals = 3

AWS = 4

Kubernetes = 5

Terraform = 4

Monitoring & Observability = 4

Statistics = 3

Probability = 3

Linear Algebra = 4

NumPy = 2

Pandas = 2

Machine Learning = 4

Scikit-learn = 3

Deep Learning = 5

PyTorch = 4

Natural Language Processing = 4

Transformers = 5

Large Language Models = 5

Prompt Engineering = 2

Embeddings = 4

Vector Databases = 3

Retrieval-Augmented Generation = 4

MLOps Fundamentals = 4

Apache Spark = 4

Apache Airflow = 4

ETL = 3

Data Warehouse = 4

---

# ESTIMATED HOURS PER LEVEL

If `hours_per_level` exists, use realistic project estimates rather than claiming industry-standard learning times.

Suggested approximate values:

Basic tools:
HTML = 6
Git = 6
Prompt Engineering = 5

Beginner/intermediate:
CSS = 8
Python = 10
SQL = 10
JavaScript = 12
REST API = 8
Pandas = 10
NumPy = 8

Intermediate:
TypeScript = 10
React = 14
FastAPI = 10
Docker = 10
Linux = 10
Statistics = 12
Scikit-learn = 12
Data Modeling = 12
ETL = 12

Advanced:
Next.js = 14
Machine Learning = 18
System Design = 18
AWS = 16
Terraform = 14
Deep Learning = 20
PyTorch = 16
Transformers = 18
RAG = 16
Kubernetes = 20
Apache Spark = 18
Apache Airflow = 16

For unspecified skills, assign sensible values between approximately 6 and 20 hours per level.

These are internal application estimates only.

---

# PREREQUISITE GRAPH

Create meaningful prerequisite relationships.

Do not create cycles.

---

## SOFTWARE WEB PATH

Programming Fundamentals
→ JavaScript

HTML
→ React

CSS
→ React

JavaScript
→ TypeScript

JavaScript
→ React

React
→ Next.js

Programming Fundamentals
→ Python

Python
→ FastAPI

REST API knowledge should require basic Programming Fundamentals.

SQL
→ Database Design

Database Design
→ PostgreSQL where appropriate

---

## SOFTWARE ENGINEERING PATH

Programming Fundamentals
→ Object-Oriented Programming

Programming Fundamentals
→ Data Structures

Data Structures
→ Algorithms

Object-Oriented Programming
→ Software Design Principles

Software Design Principles
→ System Design

Programming Fundamentals
→ Testing

---

## QA PATH

Software Testing Fundamentals
→ Test Case Design

Programming Fundamentals
→ Python

Python
→ API Testing where automation is involved

JavaScript
→ Playwright

Software Testing Fundamentals
→ Selenium

Software Testing Fundamentals
→ Playwright

REST API
→ API Testing

Git
→ CI/CD

---

# AI / MACHINE LEARNING PATH

Python
→ NumPy

Python
→ Pandas

Statistics
→ Machine Learning

Probability
→ Machine Learning

Linear Algebra
→ Machine Learning

NumPy
→ Machine Learning

Pandas
→ Data Preprocessing

Data Preprocessing
→ Machine Learning

Machine Learning
→ Scikit-learn

Machine Learning
→ Model Evaluation

Machine Learning
→ Feature Engineering

Machine Learning
→ Deep Learning

Deep Learning
→ PyTorch

Machine Learning
→ Model Deployment

Docker
→ Model Deployment

Model Deployment
→ MLOps Fundamentals

---

# GENERATIVE AI PATH

Python
→ Natural Language Processing

Machine Learning
→ Natural Language Processing

Deep Learning
→ Transformers

Natural Language Processing
→ Transformers

Transformers
→ Large Language Models

Large Language Models
→ Prompt Engineering

Large Language Models
→ Embeddings

Embeddings
→ Vector Databases

Embeddings
→ Retrieval-Augmented Generation

Vector Databases
→ Retrieval-Augmented Generation

Large Language Models
→ Retrieval-Augmented Generation

Large Language Models
→ LLM Evaluation

FastAPI
→ production LLM application development conceptually, but avoid unnecessary hard prerequisite relationships if the current graph model requires strict sequencing.

---

# DATA SCIENCE PATH

Python
→ Pandas

Python
→ NumPy

Pandas
→ Data Cleaning

Data Cleaning
→ Exploratory Data Analysis

Statistics
→ Exploratory Data Analysis

Exploratory Data Analysis
→ Data Visualization

Statistics
→ Machine Learning

Data Preprocessing
→ Machine Learning

Machine Learning
→ Feature Engineering

Machine Learning
→ Model Evaluation

---

# DATA ENGINEERING PATH

SQL
→ Data Modeling

Database Design
→ Data Modeling

Data Modeling
→ Data Warehouse

Python
→ ETL

SQL
→ ETL

ETL
→ Data Warehouse

Python
→ Apache Airflow

ETL
→ Apache Airflow

Python
→ Apache Spark

Data Modeling
→ Data Quality

ETL
→ Pipeline Monitoring

Linux
→ Docker

---

# CLOUD / DEVOPS PATH

Linux
→ Docker

Networking Fundamentals
→ Cloud Fundamentals

Linux
→ Cloud Fundamentals

Cloud Fundamentals
→ AWS

Docker
→ Kubernetes

Cloud Fundamentals
→ Infrastructure as Code

Infrastructure as Code
→ Terraform

Git
→ CI/CD

Docker
→ CI/CD

Cloud Fundamentals
→ Cloud Networking

Networking Fundamentals
→ Cloud Networking

Cloud Fundamentals
→ Identity and Access Management

Identity and Access Management
→ Cloud Security

Cloud Networking
→ Cloud Security

Cloud Fundamentals
→ Monitoring & Observability

---

# IMPORTANT GRAPH RULES

Before inserting prerequisites:

* Check whether the relationship already exists.
* Never create duplicate edges.
* Detect cycles.
* Keep dependencies educationally reasonable.
* Do not create unnecessary prerequisites just because two skills are related.

SkillPath uses prerequisites to ORDER ROADMAPS, so every prerequisite must represent a meaningful learning dependency.

---

# SHARED SKILL BEHAVIOR

One important goal is to allow SkillPath to show that skills transfer between careers.

Examples:

Python should be shared by:

* Backend Developer
* Full Stack Developer
* Software Engineer
* AI Engineer
* Machine Learning Engineer
* Generative AI Engineer
* Data Scientist
* Data Engineer
* DevOps Engineer
* Cloud Engineer where applicable

SQL should be shared by:

* Backend Developer
* Full Stack Developer
* Data Analyst
* Data Scientist
* Data Engineer
* Software Engineer

Docker should be shared by:

* Backend Developer where applicable
* Full Stack Developer
* AI Engineer
* Machine Learning Engineer
* Data Engineer
* DevOps Engineer
* Cloud Engineer

Git should be shared across most technical careers.

Machine Learning should be shared by:

* AI Engineer
* Machine Learning Engineer
* Generative AI Engineer
* Data Scientist

Cloud Fundamentals should be shared by:

* AI Engineer
* Generative AI Engineer
* Data Engineer
* DevOps Engineer
* Cloud Engineer

Do NOT create career-specific duplicates such as:

AI Python

Data Science Python

Backend Python

All of these must reference the SAME Python skill.

---

# OPTIONAL CAREER METADATA

If the current Career schema supports these fields, populate them.

Do NOT create a major schema migration only for optional fields unless it makes sense.

Potential metadata:

short_description

category

difficulty

estimated_learning_months

career_icon

career_color

If category is supported, definitely populate it.

Avoid making unsupported salary or job market claims.

---

# LEARNING RESOURCES

If SkillPath currently supports LearningResource records, add several resources per important skill.

Prefer stable official documentation.

Examples:

Python
→ Python official documentation

React
→ React documentation

Next.js
→ Next.js documentation

FastAPI
→ FastAPI documentation

Docker
→ Docker documentation

Kubernetes
→ Kubernetes documentation

Terraform
→ HashiCorp Terraform documentation

AWS
→ AWS Skill Builder / AWS documentation

Pandas
→ pandas documentation

NumPy
→ NumPy documentation

Scikit-learn
→ scikit-learn documentation

PyTorch
→ PyTorch documentation

Apache Spark
→ Apache Spark documentation

Airflow
→ Apache Airflow documentation

Do not invent fake URLs.

If resource URLs are not already part of the project, skip this portion rather than making unnecessary scope changes.

---

# SEEDING REQUIREMENTS

Update the project's existing seed system.

Prefer an idempotent seed process.

For example:

find_or_create_skill()

find_or_create_career()

find_or_create_requirement()

find_or_create_prerequisite()

Do not blindly insert duplicated records every time the seed runs.

After seeding, verify:

* all 10 new careers exist
* existing careers still exist
* no duplicate career names
* no duplicate skill names
* requirements reference valid skills
* prerequisite relationships reference valid skills
* no prerequisite cycles exist

---

# DATA VALIDATION

Validate:

required_level between 1 and 5

importance between 1 and 5

difficulty between 1 and 5 if applicable

hours_per_level > 0

Career names unique

Skill names unique

No skill can directly depend on itself.

No circular prerequisite chains.

No duplicate career-skill requirement.

No duplicate prerequisite relationship.

---

# CAREER EXPLORER

Do not redesign the UI, but ensure the Career Explorer can display the expanded career dataset.

It should support all categories:

Software Engineering

AI & Machine Learning

Data

Cloud & DevOps

Design

Marketing

If category filtering already exists, update it.

If filtering does not exist and adding a simple category filter is easy and safe, add a basic functional filter.

Do not perform a visual redesign.

---

# CAREER DETAIL

Verify that every new career correctly displays:

Career name

Description

Category

Required skills

Required level

Importance

Skill information

Assessment action

There must be no hard-coded frontend list of only the original five careers.

Career data must come from the backend/database.

---

# SKILL ASSESSMENT

Verify the assessment page supports all new career requirements dynamically.

Do not create custom assessment code for individual careers.

The UI must render whatever skills are returned by the selected career API.

---

# GAP ANALYSIS

Verify the existing GapAnalyzer works with all newly added careers.

Test at minimum:

Full Stack Developer

AI Engineer

Machine Learning Engineer

Data Scientist

Data Engineer

Cloud Engineer

DevOps Engineer

Generative AI Engineer

The algorithms should remain generic.

Do not add career-specific `if career == ...` logic.

---

# ROADMAP ENGINE VERIFICATION

Generate sample roadmaps and verify prerequisite ordering.

Examples:

Frontend / Full Stack:

JavaScript
→ React
→ Next.js

Machine Learning:

Python
→ NumPy/Pandas
→ Data Preprocessing
→ Machine Learning
→ Deep Learning

Generative AI:

Python
→ Machine Learning
→ NLP / Deep Learning
→ Transformers
→ LLM
→ Embeddings
→ Vector Database
→ RAG

Cloud:

Linux + Networking
→ Cloud Fundamentals
→ AWS
→ Infrastructure as Code
→ Terraform

DevOps:

Linux
→ Docker
→ CI/CD
→ Cloud
→ Kubernetes

Data Engineering:

SQL
→ Data Modeling
→ ETL
→ Data Warehouse

and:

Python
→ ETL
→ Airflow

Roadmaps must respect valid prerequisites even when priority scores would otherwise rank skills differently.

---

# TESTS

Add or update tests for the expanded dataset.

Test that:

* 10 new careers are available.
* All career names are unique.
* Skill names are unique.
* Full Stack Developer has required skills.
* Software Engineer has OOP, Algorithms, Testing, System Design.
* DevOps Engineer has Docker, CI/CD, Cloud, Kubernetes, Terraform.
* QA Automation Engineer has Testing, API Testing, Playwright/Selenium.
* AI Engineer has ML, Deep Learning, Deployment/MLOps.
* ML Engineer has Statistics, ML, Model Evaluation.
* Generative AI Engineer has LLM, Embeddings, Vector DB, RAG.
* Data Scientist has Python, SQL, Statistics, ML.
* Data Engineer has SQL, ETL, Data Warehouse, Spark/Airflow.
* Cloud Engineer has Networking, Cloud, IAM, Terraform, Monitoring.

Also test prerequisite ordering.

---

# DATABASE MIGRATION / EXISTING DATABASE SAFETY

The project may already have an existing database.

Do NOT delete it unless absolutely necessary.

Do NOT reset user data unnecessarily.

If the schema must change:

* create an appropriate migration or safe initialization change
* preserve existing data
* document the migration

If only seed data is changing, do not introduce unnecessary schema changes.

---

# OPTIONAL IMPROVEMENT — CAREER TRANSFER FOUNDATION

Do not build the full Career Transition feature in this task.

However, make sure the dataset supports it naturally through shared Skill records.

For example:

Data Analyst
→ Data Scientist

should share:

SQL
Python
Statistics
Data Visualization
Pandas

Backend Developer
→ AI Engineer

should share:

Python
API
Git
Docker where applicable

DevOps Engineer
→ Cloud Engineer

should share:

Linux
Networking
Docker
Cloud
Terraform
Monitoring

This shared structure will allow a future Career Transition feature to calculate transferable skills.

---

# FINAL VERIFICATION

After implementation:

1. Run the database seed.
2. Verify all careers.
3. Check career categories.
4. Check skills for duplicates.
5. Check requirements.
6. Validate prerequisite graph.
7. Run backend tests.
8. Start FastAPI.
9. Call the career API.
10. Verify all new careers are returned.
11. Start Next.js.
12. Open Career Explorer.
13. Open several new career detail pages.
14. Run skill assessments.
15. Generate roadmaps.
16. Verify dependency order.
17. Run the production frontend build.
18. Fix errors discovered during testing.

Perform full manual flows for at least:

Full Stack Developer

AI Engineer

Generative AI Engineer

Data Scientist

Data Engineer

Cloud Engineer

---

# COMPLETION REPORT

When complete, summarize:

* careers added
* career categories
* total number of careers
* skills added
* reused existing skills
* total number of skills
* requirements added
* prerequisite relationships added
* seed files modified
* migrations made, if any
* tests added
* commands used
* test results
* frontend pages verified
* any remaining data limitations

Do not redesign the application.

The objective of this task is:

EXPAND SKILLPATH INTO A STRONG SOFTWARE + AI + DATA + CLOUD CAREER DATASET WHILE PRESERVING CLEAN OOP ARCHITECTURE, SHARED SKILLS, VALID DEPENDENCIES, AND GENERIC ROADMAP LOGIC.
