from __future__ import annotations

from collections import defaultdict
from sqlalchemy import select

from app.core.database import Base, SessionLocal, engine
from app.models import Career, CareerSkillRequirement, LearningResource, Skill, SkillPrerequisite


# name: (category, difficulty, estimated project-learning hours per level)
SKILLS = {
    name: (category, difficulty, hours)
    for category, rows in {
        "Software Engineering": [
            ("Programming Fundamentals", 2, 10), ("Object-Oriented Programming", 3, 12),
            ("Data Structures", 3, 14), ("Algorithms", 4, 18), ("Software Design Principles", 3, 14),
            ("System Design", 4, 18), ("Debugging", 2, 8), ("Software Testing Fundamentals", 2, 8),
            ("Test Case Design", 3, 10), ("Testing", 3, 10), ("API Testing", 3, 10),
            ("Performance Testing", 4, 14), ("HTML", 1, 6), ("CSS", 2, 8), ("JavaScript", 3, 12),
            ("TypeScript", 3, 10), ("React", 3, 14), ("Next.js", 4, 14), ("Python", 2, 10),
            ("FastAPI", 3, 10), ("REST API", 2, 8), ("Git", 2, 6), ("Playwright", 3, 10),
            ("Selenium", 3, 10),
        ],
        "AI & Machine Learning": [
            ("NumPy", 2, 8), ("Probability", 3, 12), ("Linear Algebra", 4, 16),
            ("Machine Learning", 4, 18), ("Scikit-learn", 3, 12), ("Deep Learning", 5, 20),
            ("PyTorch", 4, 16), ("Feature Engineering", 4, 14), ("Model Evaluation", 3, 12),
            ("Model Deployment", 4, 14), ("MLOps Fundamentals", 4, 16),
            ("Natural Language Processing", 4, 16), ("Transformers", 5, 18),
            ("Large Language Models", 5, 18), ("Prompt Engineering", 2, 5), ("Embeddings", 4, 14),
            ("Vector Databases", 3, 12), ("Retrieval-Augmented Generation", 4, 16),
            ("LLM Evaluation", 4, 14),
        ],
        "Data": [
            ("SQL", 2, 10), ("PostgreSQL", 3, 10), ("Database Design", 3, 12), ("Pandas", 2, 10),
            ("Statistics", 3, 12), ("Data Preprocessing", 3, 12), ("Data Cleaning", 2, 10),
            ("Exploratory Data Analysis", 3, 12), ("Data Visualization", 3, 10),
            ("Experimentation", 3, 12), ("Data Modeling", 3, 12), ("ETL", 3, 12),
            ("Data Warehouse", 4, 16), ("Apache Spark", 4, 18), ("Apache Airflow", 4, 16),
            ("Data Quality", 3, 12), ("Pipeline Monitoring", 3, 12), ("Communication", 2, 8),
            ("Excel", 2, 8), ("Power BI", 3, 12),
        ],
        "Cloud & DevOps": [
            ("Linux", 3, 10), ("Networking Fundamentals", 3, 12), ("Shell Scripting", 3, 10),
            ("Docker", 3, 10), ("CI/CD", 3, 12), ("Cloud Fundamentals", 3, 12), ("AWS", 4, 16),
            ("Kubernetes", 5, 20), ("Infrastructure as Code", 4, 14), ("Terraform", 4, 14),
            ("Monitoring & Observability", 4, 14), ("Security Fundamentals", 3, 10),
            ("Cloud Networking", 4, 14), ("Identity and Access Management", 4, 14),
            ("Cloud Security", 4, 16),
        ],
        "Design": [("Figma", 2, 8), ("User Research", 3, 10), ("Wireframing", 2, 8),
                   ("Prototyping", 3, 10), ("Usability Testing", 3, 10)],
        "Marketing": [("SEO", 3, 10), ("Content Marketing", 3, 10), ("Web Analytics", 3, 10),
                      ("Social Media Marketing", 2, 8)],
    }.items()
    for name, difficulty, hours in rows
}


def C(description, category, requirements):
    return description, category, requirements


CAREERS = {
    "Frontend Developer": C("Build accessible, responsive web interfaces and modern client applications.", "Software Engineering",
        {"HTML": (4,4), "CSS": (4,4), "JavaScript": (5,5), "TypeScript": (3,4), "React": (4,5), "Next.js": (3,3), "Git": (3,3), "Testing": (3,3)}),
    "Backend Developer": C("Design reliable APIs, services, and data-driven server applications.", "Software Engineering",
        {"Python": (4,5), "FastAPI": (4,4), "SQL": (4,5), "REST API": (4,5), "PostgreSQL": (3,4), "Git": (3,3), "Testing": (4,4), "Docker": (3,3)}),
    "Data Analyst": C("Turn raw data into clear analysis, dashboards, and decisions.", "Data",
        {"Excel": (4,4), "SQL": (4,5), "Python": (3,3), "Statistics": (4,5), "Data Visualization": (4,5), "Power BI": (4,4)}),
    "UI/UX Designer": C("Research user needs and create intuitive digital product experiences.", "Design",
        {"Figma": (4,5), "User Research": (4,5), "Wireframing": (4,4), "Prototyping": (4,5), "Usability Testing": (4,4), "HTML": (2,2), "CSS": (2,2)}),
    "Digital Marketer": C("Plan, measure, and improve digital campaigns across channels.", "Marketing",
        {"SEO": (4,5), "Content Marketing": (4,5), "Web Analytics": (4,5), "Social Media Marketing": (4,4), "Excel": (3,3), "Data Visualization": (3,3)}),
    "Full Stack Developer": C("Build both client-side and server-side web applications using interfaces, APIs, databases, version control, deployment workflows, and application architecture.", "Software Engineering",
        {"HTML": (4,4), "CSS": (4,4), "JavaScript": (4,5), "TypeScript": (3,4), "React": (4,5), "Next.js": (3,4), "Python": (3,4), "FastAPI": (3,4), "REST API": (4,5), "SQL": (3,4), "PostgreSQL": (3,3), "Git": (4,4), "Testing": (3,3), "Docker": (2,2)}),
    "Software Engineer": C("Design, develop, test, and maintain software systems using programming principles, algorithms, object-oriented design, testing, version control, and architecture.", "Software Engineering",
        {"Programming Fundamentals": (4,5), "Object-Oriented Programming": (4,5), "Data Structures": (4,5), "Algorithms": (4,5), "Python": (3,3), "Git": (4,4), "SQL": (3,3), "Database Design": (3,3), "REST API": (3,3), "Testing": (4,4), "Software Design Principles": (4,4), "System Design": (3,4), "Debugging": (4,4)}),
    "DevOps Engineer": C("Improve software delivery by automating builds, testing, deployment, infrastructure provisioning, monitoring, and operational workflows.", "Cloud & DevOps",
        {"Linux": (4,5), "Networking Fundamentals": (3,4), "Git": (4,4), "Shell Scripting": (3,4), "Python": (3,3), "Docker": (4,5), "CI/CD": (4,5), "Cloud Fundamentals": (4,5), "AWS": (3,4), "Kubernetes": (3,4), "Infrastructure as Code": (3,4), "Terraform": (3,4), "Monitoring & Observability": (3,4), "Security Fundamentals": (2,3)}),
    "QA Automation Engineer": C("Design automated UI and API tests, integrate them into delivery pipelines, and identify software defects.", "Software Engineering",
        {"Software Testing Fundamentals": (4,5), "Test Case Design": (4,5), "Python": (3,4), "JavaScript": (2,2), "API Testing": (4,5), "REST API": (3,4), "Playwright": (3,4), "Selenium": (2,3), "Git": (3,4), "CI/CD": (2,3), "SQL": (2,3), "Debugging": (3,4), "Performance Testing": (2,2)}),
    "AI Engineer": C("Build intelligent software systems integrating models, AI services, APIs, data pipelines, model operations, and production infrastructure.", "AI & Machine Learning",
        {"Python": (4,5), "NumPy": (3,3), "Pandas": (3,4), "Statistics": (3,4), "Machine Learning": (4,5), "Deep Learning": (3,4), "PyTorch": (3,4), "Model Evaluation": (3,4), "REST API": (3,3), "FastAPI": (3,3), "Docker": (3,4), "Cloud Fundamentals": (3,3), "MLOps Fundamentals": (3,4), "Git": (3,3)}),
    "Machine Learning Engineer": C("Develop, evaluate, deploy, and maintain reliable machine learning systems in production.", "AI & Machine Learning",
        {"Python": (4,5), "NumPy": (4,4), "Pandas": (4,4), "Statistics": (4,5), "Probability": (3,4), "Linear Algebra": (3,4), "Data Preprocessing": (4,5), "Machine Learning": (5,5), "Scikit-learn": (4,5), "Deep Learning": (3,4), "PyTorch": (3,4), "Model Evaluation": (4,5), "Feature Engineering": (4,4), "Docker": (3,3), "Model Deployment": (3,4), "MLOps Fundamentals": (3,4), "Git": (3,3)}),
    "Generative AI Engineer": C("Build applications using large language models, prompting, embeddings, vector search, retrieval-augmented generation, evaluation, backend services, and deployment.", "AI & Machine Learning",
        {"Python": (4,5), "Machine Learning": (3,4), "Deep Learning": (3,4), "Natural Language Processing": (3,4), "Transformers": (4,5), "Large Language Models": (4,5), "Prompt Engineering": (4,4), "Embeddings": (4,5), "Vector Databases": (3,4), "Retrieval-Augmented Generation": (4,5), "LLM Evaluation": (3,4), "FastAPI": (3,3), "REST API": (3,3), "Docker": (3,3), "Cloud Fundamentals": (3,3), "Git": (3,3)}),
    "Data Scientist": C("Analyze data, perform statistical analysis, build predictive models, run experiments, and communicate findings.", "Data",
        {"Python": (4,5), "SQL": (4,5), "NumPy": (4,4), "Pandas": (4,5), "Statistics": (4,5), "Probability": (3,4), "Data Cleaning": (4,4), "Exploratory Data Analysis": (4,5), "Data Visualization": (4,4), "Machine Learning": (4,5), "Scikit-learn": (4,4), "Feature Engineering": (3,4), "Model Evaluation": (4,4), "Experimentation": (3,3), "Communication": (3,4)}),
    "Data Engineer": C("Design and maintain systems that collect, transform, store, and deliver reliable data for analytics and machine learning.", "Data",
        {"Python": (4,5), "SQL": (5,5), "Database Design": (4,4), "Data Modeling": (4,5), "ETL": (4,5), "Data Warehouse": (4,5), "PostgreSQL": (3,3), "Apache Spark": (3,4), "Apache Airflow": (3,4), "Cloud Fundamentals": (3,4), "Docker": (3,3), "Linux": (3,3), "Git": (3,3), "Data Quality": (4,4), "Pipeline Monitoring": (3,4)}),
    "Cloud Engineer": C("Design, deploy, manage, and secure cloud infrastructure across compute, storage, networking, identity, containers, automation, and monitoring.", "Cloud & DevOps",
        {"Linux": (4,5), "Networking Fundamentals": (4,5), "Cloud Fundamentals": (5,5), "AWS": (4,5), "Cloud Networking": (4,5), "Identity and Access Management": (4,5), "Docker": (3,4), "Kubernetes": (3,3), "Infrastructure as Code": (4,5), "Terraform": (4,5), "CI/CD": (3,3), "Monitoring & Observability": (4,4), "Cloud Security": (3,4), "Python": (2,2), "Git": (3,3)}),
}


# Each tuple is (skill, prerequisite, minimum prerequisite level).
PREREQUISITES = [
    ("CSS","HTML",2), ("JavaScript","Programming Fundamentals",2), ("TypeScript","JavaScript",3),
    ("React","HTML",2), ("React","CSS",2), ("React","JavaScript",3), ("Next.js","React",3),
    ("Python","Programming Fundamentals",2), ("FastAPI","Python",3), ("REST API","Programming Fundamentals",2),
    ("Database Design","SQL",3), ("PostgreSQL","Database Design",3),
    ("Object-Oriented Programming","Programming Fundamentals",2), ("Data Structures","Programming Fundamentals",2),
    ("Algorithms","Data Structures",3), ("Software Design Principles","Object-Oriented Programming",3),
    ("System Design","Software Design Principles",3), ("Testing","Programming Fundamentals",2),
    ("Test Case Design","Software Testing Fundamentals",3), ("API Testing","Python",2),
    ("API Testing","REST API",2), ("Playwright","JavaScript",2),
    ("Playwright","Software Testing Fundamentals",2), ("Selenium","Software Testing Fundamentals",2),
    ("CI/CD","Git",2), ("CI/CD","Docker",2), ("NumPy","Python",2), ("Pandas","Python",2),
    ("Machine Learning","Statistics",3), ("Machine Learning","Probability",2),
    ("Machine Learning","Linear Algebra",2), ("Machine Learning","NumPy",2),
    ("Data Preprocessing","Pandas",2), ("Machine Learning","Data Preprocessing",3),
    ("Scikit-learn","Machine Learning",3), ("Model Evaluation","Machine Learning",3),
    ("Feature Engineering","Machine Learning",3), ("Deep Learning","Machine Learning",3),
    ("PyTorch","Deep Learning",3), ("Model Deployment","Machine Learning",3),
    ("Model Deployment","Docker",2), ("MLOps Fundamentals","Model Deployment",3),
    ("Natural Language Processing","Python",3), ("Natural Language Processing","Machine Learning",3),
    ("Transformers","Deep Learning",3), ("Transformers","Natural Language Processing",3),
    ("Large Language Models","Transformers",3), ("Prompt Engineering","Large Language Models",2),
    ("Embeddings","Large Language Models",3), ("Vector Databases","Embeddings",3),
    ("Retrieval-Augmented Generation","Embeddings",3), ("Retrieval-Augmented Generation","Vector Databases",3),
    ("Retrieval-Augmented Generation","Large Language Models",3), ("LLM Evaluation","Large Language Models",3),
    ("Data Cleaning","Pandas",2), ("Exploratory Data Analysis","Data Cleaning",3),
    ("Exploratory Data Analysis","Statistics",3), ("Data Visualization","Exploratory Data Analysis",2),
    ("Data Modeling","SQL",3), ("Data Modeling","Database Design",3), ("ETL","Python",3),
    ("ETL","SQL",3), ("Data Warehouse","Data Modeling",3), ("Data Warehouse","ETL",3),
    ("Apache Airflow","Python",3), ("Apache Airflow","ETL",3), ("Apache Spark","Python",3),
    ("Data Quality","Data Modeling",3), ("Pipeline Monitoring","ETL",3), ("Docker","Linux",2),
    ("Cloud Fundamentals","Networking Fundamentals",2), ("Cloud Fundamentals","Linux",2),
    ("AWS","Cloud Fundamentals",3), ("Kubernetes","Docker",3),
    ("Infrastructure as Code","Cloud Fundamentals",3), ("Terraform","Infrastructure as Code",3),
    ("Cloud Networking","Cloud Fundamentals",3), ("Cloud Networking","Networking Fundamentals",3),
    ("Identity and Access Management","Cloud Fundamentals",3),
    ("Cloud Security","Identity and Access Management",3), ("Cloud Security","Cloud Networking",3),
    ("Monitoring & Observability","Cloud Fundamentals",3),
    ("Power BI","Data Visualization",3), ("Power BI","Excel",2), ("Prototyping","Wireframing",3),
    ("Usability Testing","User Research",3), ("Web Analytics","Excel",2),
    ("Content Marketing","User Research",2),
]


OFFICIAL_RESOURCES = {
    "Python": ("Python documentation", "https://docs.python.org/3/"),
    "React": ("React documentation", "https://react.dev/learn"),
    "Next.js": ("Next.js documentation", "https://nextjs.org/docs"),
    "FastAPI": ("FastAPI documentation", "https://fastapi.tiangolo.com/"),
    "Docker": ("Docker documentation", "https://docs.docker.com/"),
    "Kubernetes": ("Kubernetes documentation", "https://kubernetes.io/docs/"),
    "Terraform": ("Terraform documentation", "https://developer.hashicorp.com/terraform/docs"),
    "AWS": ("AWS Skill Builder", "https://skillbuilder.aws/"),
    "Pandas": ("pandas documentation", "https://pandas.pydata.org/docs/"),
    "NumPy": ("NumPy documentation", "https://numpy.org/doc/"),
    "Scikit-learn": ("scikit-learn documentation", "https://scikit-learn.org/stable/"),
    "PyTorch": ("PyTorch documentation", "https://pytorch.org/docs/stable/index.html"),
    "Apache Spark": ("Apache Spark documentation", "https://spark.apache.org/docs/latest/"),
    "Apache Airflow": ("Apache Airflow documentation", "https://airflow.apache.org/docs/"),
    "TypeScript": ("TypeScript handbook", "https://www.typescriptlang.org/docs/handbook/intro.html"),
    "PostgreSQL": ("PostgreSQL documentation", "https://www.postgresql.org/docs/"),
}


def validate_definitions():
    for name, (_, difficulty, hours) in SKILLS.items():
        if not 1 <= difficulty <= 5 or hours <= 0:
            raise ValueError(f"Invalid skill metadata: {name}")
    graph = defaultdict(set)
    seen_edges = set()
    for title, (_, _, requirements) in CAREERS.items():
        for name, (level, importance) in requirements.items():
            if name not in SKILLS or not 1 <= level <= 5 or not 1 <= importance <= 5:
                raise ValueError(f"Invalid requirement: {title} -> {name}")
    for skill, prerequisite, level in PREREQUISITES:
        edge = (skill, prerequisite)
        if edge in seen_edges or skill == prerequisite or skill not in SKILLS or prerequisite not in SKILLS or not 1 <= level <= 5:
            raise ValueError(f"Invalid prerequisite: {prerequisite} -> {skill}")
        seen_edges.add(edge); graph[skill].add(prerequisite)
    visiting, visited = set(), set()
    def visit(name):
        if name in visiting: raise ValueError("Skill prerequisite definitions contain a cycle.")
        if name in visited: return
        visiting.add(name)
        for prerequisite in graph[name]: visit(prerequisite)
        visiting.remove(name); visited.add(name)
    for name in SKILLS: visit(name)


def seed():
    validate_definitions()
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        # Normalize the legacy name in place so IDs and all user relationships survive.
        testing = db.scalar(select(Skill).where(Skill.name == "Testing"))
        legacy = db.scalar(select(Skill).where(Skill.name == "Software Testing"))
        if legacy and not testing:
            legacy.name = "Testing"; db.flush()

        skills = {item.name: item for item in db.scalars(select(Skill))}
        created_skills = 0
        for name, (category, difficulty, hours) in SKILLS.items():
            item = skills.get(name)
            if item is None:
                item = Skill(name=name); db.add(item); skills[name] = item; created_skills += 1
            item.description = f"Apply {name} concepts and tools in practical {category.lower()} projects."
            item.category, item.difficulty, item.hours_per_level = category, difficulty, hours
        db.flush()

        careers = {item.title: item for item in db.scalars(select(Career))}
        created_careers = requirement_count = 0
        for title, (description, category, requirements) in CAREERS.items():
            item = careers.get(title)
            if item is None:
                item = Career(title=title, description=description, category=category)
                db.add(item); db.flush(); careers[title] = item; created_careers += 1
            item.description, item.category = description, category
            current = {r.skill_id: r for r in db.scalars(select(CareerSkillRequirement).where(CareerSkillRequirement.career_id == item.id))}
            for name, (level, importance) in requirements.items():
                req = current.get(skills[name].id)
                if req is None:
                    req = CareerSkillRequirement(career_id=item.id, skill_id=skills[name].id); db.add(req)
                req.required_level, req.importance = level, importance; requirement_count += 1

        edges = {(e.skill_id, e.prerequisite_skill_id): e for e in db.scalars(select(SkillPrerequisite))}
        created_edges = 0
        for name, prerequisite, level in PREREQUISITES:
            key = skills[name].id, skills[prerequisite].id
            edge = edges.get(key)
            if edge is None:
                edge = SkillPrerequisite(skill_id=key[0], prerequisite_skill_id=key[1]); db.add(edge); edges[key] = edge; created_edges += 1
            edge.minimum_level = level

        # Validate the complete persisted graph too, including relationships that predate this seed.
        db.flush()
        persisted_graph = defaultdict(set)
        for edge in db.scalars(select(SkillPrerequisite)):
            if edge.skill_id == edge.prerequisite_skill_id:
                raise ValueError("A skill cannot depend on itself.")
            persisted_graph[edge.skill_id].add(edge.prerequisite_skill_id)
        visiting_ids, visited_ids = set(), set()
        def visit_id(skill_id):
            if skill_id in visiting_ids: raise ValueError("Persisted skill prerequisites contain a cycle.")
            if skill_id in visited_ids: return
            visiting_ids.add(skill_id)
            for prerequisite_id in persisted_graph[skill_id]: visit_id(prerequisite_id)
            visiting_ids.remove(skill_id); visited_ids.add(skill_id)
        for skill_id in list(persisted_graph): visit_id(skill_id)

        created_resources = 0
        for name, (title, url) in OFFICIAL_RESOURCES.items():
            resource = db.scalar(select(LearningResource).where(LearningResource.skill_id == skills[name].id, LearningResource.title == title))
            if resource is None:
                resource = LearningResource(skill_id=skills[name].id, title=title); db.add(resource); created_resources += 1
            resource.url, resource.resource_type, resource.difficulty, resource.estimated_hours = url, "documentation", max(1, skills[name].difficulty - 1), 3
        db.commit()
        counts = {label: len(list(db.scalars(select(model.id)))) for label, model in {
            "careers": Career, "skills": Skill, "requirements": CareerSkillRequirement,
            "prerequisites": SkillPrerequisite, "resources": LearningResource}.items()}
        print(f"Seed complete: created {created_careers} careers, {created_skills} skills, {created_edges} prerequisites, and {created_resources} resources; upserted {requirement_count} requirements. Totals: {counts}.")


if __name__ == "__main__":
    seed()
