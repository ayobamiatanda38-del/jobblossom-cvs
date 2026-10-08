export type Layout = "classic" | "sidebar" | "banner" | "minimal" | "split" | "timeline" | "ats" | "chronicle";

export type ExperienceItem = { role: string; company: string; period: string; details: string };
export type EducationItem = { degree: string; school: string; period: string };

export type ResumeData = {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  summary: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: string;
  strengths: string;
  projects: string;
  languages: string;
  courses: string;
  awards: string;
  references: string;
};

export type Template = {
  id: string;
  name: string;
  industry: string;
  role: string;
  layout: Layout;
  accent: string;
  font: "sans" | "serif";
  pro?: boolean;
  score: number;
  sample: ResumeData;
};

export const USD_TO_NGN = 1550;
export const PLANS = [
  { id: "week", name: "7-day Pass", usd: 4.99, note: "Perfect for one urgent application" },
  { id: "month", name: "Pro Monthly", usd: 9.99, note: "Most popular · cancel anytime", featured: true },
  { id: "year", name: "Pro Yearly", usd: 59.99, note: "Save 50% vs monthly" },
] as const;
export const formatUSD = (v: number) => `$${v.toFixed(2)}`;
export const formatNGN = (usd: number) => `₦${Math.round(usd * USD_TO_NGN).toLocaleString("en-NG")}`;

const p = (
  name: string, title: string, location: string, summary: string,
  experience: ExperienceItem[], education: EducationItem[], skills: string,
  extra: Partial<ResumeData> = {},
): ResumeData => ({
  name, title, location, summary, experience, education, skills,
  email: `${(name.split(" ")[0] ?? "sample").toLowerCase()}@email.com`,
  phone: "+1 555 010 2040",
  website: `linkedin.com/in/${name.toLowerCase().replace(/[^a-z]/g, "")}`,
  strengths: "Clear communication · Ownership · Calm under pressure",
  projects: "",
  languages: "English — Native",
  courses: "",
  awards: "",
  references: "Available on request",
  ...extra,
});

const BASE_TEMPLATES: Template[] = [
  { id: "prime", name: "Prime", industry: "Marketing", role: "Product Marketing Manager", layout: "classic", accent: "oklch(0.62 0.2 31)", font: "sans", score: 95,
    sample: p("Amara Okafor", "Product Marketing Manager", "Lagos, Nigeria", "Strategic product marketer with 7+ years turning customer insight into campaigns that drive adoption and sustainable growth.",
      [{ role: "Senior Product Marketing Manager", company: "CloudNine Africa", period: "2021 — Present", details: "Led go-to-market across three markets, lifting qualified pipeline by 38%.\nBuilt a customer research programme that shaped two product launches." },
       { role: "Marketing Associate", company: "Paystream", period: "2018 — 2021", details: "Grew email revenue 2.4× through lifecycle segmentation." }],
      [{ degree: "B.Sc. Business Administration", school: "University of Lagos", period: "2014 — 2018" }],
      "Go-to-market, Customer research, Analytics, Positioning, HubSpot", { languages: "English — Native · French — Conversational", courses: "Google Analytics Certification" }) },
  { id: "axis", name: "Axis", industry: "Technology", role: "Software Engineer", layout: "sidebar", accent: "oklch(0.45 0.12 250)", font: "sans", score: 97,
    sample: p("Daniel Reyes", "Senior Software Engineer", "Austin, TX", "Backend engineer who ships reliable, well-tested services at scale. Passionate about developer experience and mentoring.",
      [{ role: "Senior Software Engineer", company: "Streamline", period: "2020 — Present", details: "Re-architected billing service handling $40M/yr with zero downtime.\nCut p95 API latency from 480ms to 120ms." },
       { role: "Software Engineer", company: "Brightwave", period: "2017 — 2020", details: "Built event pipeline processing 2B events/day on Kafka." }],
      [{ degree: "B.S. Computer Science", school: "UT Austin", period: "2013 — 2017" }],
      "TypeScript, Go, PostgreSQL, Kubernetes, AWS, System design", { projects: "Open-source rate limiter — 3k GitHub stars" }) },
  { id: "carewell", name: "Carewell", industry: "Healthcare", role: "Registered Nurse", layout: "banner", accent: "oklch(0.55 0.12 190)", font: "sans", score: 94,
    sample: p("Grace Mensah", "Registered Nurse, ICU", "Accra, Ghana", "Compassionate ICU nurse with 6 years of critical-care experience and a record of improving patient outcomes through protocol discipline.",
      [{ role: "ICU Staff Nurse", company: "Korle Bu Teaching Hospital", period: "2019 — Present", details: "Care for 4–6 critical patients per shift in a 24-bed ICU.\nLed sepsis-screening rollout reducing time-to-antibiotics by 35%." },
       { role: "Ward Nurse", company: "Ridge Hospital", period: "2017 — 2019", details: "Trained 12 new graduate nurses on medication safety." }],
      [{ degree: "B.Sc. Nursing", school: "University of Ghana", period: "2013 — 2017" }],
      "Critical care, Ventilator management, Triage, Patient education, EHR", { courses: "BLS & ACLS Certified" }) },
  { id: "ledger", name: "Ledger", industry: "Finance", role: "Financial Analyst", layout: "minimal", accent: "oklch(0.35 0.06 160)", font: "serif", score: 96,
    sample: p("Tobi Adebayo", "Financial Analyst", "London, UK", "CFA Level II candidate delivering sharp financial models and investment memos that drive board-level decisions.",
      [{ role: "Financial Analyst", company: "Harbor Capital", period: "2021 — Present", details: "Built 3-statement models for 15+ deals totalling £600M.\nAutomated monthly reporting, saving 30 hours per cycle." }],
      [{ degree: "M.Sc. Finance", school: "London School of Economics", period: "2019 — 2020" }, { degree: "B.Sc. Economics", school: "Obafemi Awolowo University", period: "2014 — 2018" }],
      "Financial modelling, Valuation, Excel/VBA, Power BI, SQL", { courses: "CFA Level II Candidate" }) },
  { id: "canvas", name: "Canvas", industry: "Design", role: "Product Designer", layout: "split", accent: "oklch(0.6 0.18 330)", font: "sans", pro: true, score: 91,
    sample: p("Maya Chen", "Product Designer", "Toronto, Canada", "Product designer crafting accessible, joyful interfaces for fintech and health. I pair research rigour with visual polish.",
      [{ role: "Senior Product Designer", company: "Wealthly", period: "2020 — Present", details: "Redesigned onboarding, lifting activation 22%.\nBuilt the design system used by 40 engineers." },
       { role: "UI Designer", company: "Studio North", period: "2017 — 2020", details: "Shipped 20+ client apps across mobile and web." }],
      [{ degree: "BDes Interaction Design", school: "OCAD University", period: "2013 — 2017" }],
      "Figma, Prototyping, User research, Design systems, Accessibility", { projects: "Healthmate app — Apple Design Award finalist" }) },
  { id: "chalk", name: "Chalk", industry: "Education", role: "Secondary School Teacher", layout: "classic", accent: "oklch(0.55 0.14 145)", font: "serif", score: 93,
    sample: p("Samuel Otieno", "Mathematics Teacher", "Nairobi, Kenya", "Dedicated mathematics teacher who makes abstract ideas concrete. My classes consistently outperform national averages.",
      [{ role: "Head of Mathematics", company: "Brookhouse School", period: "2019 — Present", details: "Raised A-level pass rate from 78% to 94%.\nIntroduced project-based learning across four year groups." }],
      [{ degree: "B.Ed. Mathematics", school: "Kenyatta University", period: "2011 — 2015" }],
      "Curriculum design, Classroom management, Google Classroom, Mentoring") },
  { id: "forge", name: "Forge", industry: "Engineering", role: "Civil Engineer", layout: "timeline", accent: "oklch(0.6 0.15 60)", font: "sans", pro: true, score: 92,
    sample: p("Ibrahim Musa", "Civil / Structural Engineer", "Abuja, Nigeria", "COREN-registered engineer delivering infrastructure projects on time and under budget across roads, bridges and housing.",
      [{ role: "Project Engineer", company: "Julius Berger", period: "2018 — Present", details: "Supervised a ₦12B dual-carriageway project, finishing 6 weeks early.\nManaged 80-person site team with zero lost-time incidents." }],
      [{ degree: "B.Eng. Civil Engineering", school: "Ahmadu Bello University", period: "2011 — 2016" }],
      "AutoCAD, SAP2000, Project planning, HSE, Cost control", { courses: "COREN Registered · PMP" }) },
  { id: "counter", name: "Counter", industry: "Sales & Retail", role: "Sales Manager", layout: "banner", accent: "oklch(0.58 0.2 25)", font: "sans", score: 90,
    sample: p("Chloe Martin", "Regional Sales Manager", "Manchester, UK", "Quota-crushing sales leader who builds teams that sell with integrity and keeps customers for life.",
      [{ role: "Regional Sales Manager", company: "Novo Retail", period: "2020 — Present", details: "Grew region revenue from £4M to £7.1M in two years.\nCoached 14 reps; 5 promoted to team lead." }],
      [{ degree: "BA Business", school: "University of Leeds", period: "2012 — 2015" }],
      "Pipeline management, Negotiation, Salesforce, Coaching, Forecasting") },
  { id: "brief", name: "Brief", industry: "Legal", role: "Corporate Lawyer", layout: "minimal", accent: "oklch(0.3 0.05 270)", font: "serif", pro: true, score: 95,
    sample: p("Adaeze Nwosu", "Corporate Associate", "Lagos, Nigeria", "Called to the Nigerian Bar with 5 years advising on M&A, capital markets and regulatory compliance for multinational clients.",
      [{ role: "Associate", company: "Aluko & Oyebode", period: "2020 — Present", details: "Advised on 9 cross-border M&A deals worth $1.2B.\nDrafted SEC filings for two IPOs." }],
      [{ degree: "LL.B (Hons)", school: "University of Nigeria", period: "2012 — 2017" }, { degree: "B.L.", school: "Nigerian Law School", period: "2018" }],
      "M&A, Due diligence, Contract drafting, Regulatory compliance") },
  { id: "plate", name: "Plate", industry: "Hospitality", role: "Head Chef", layout: "split", accent: "oklch(0.55 0.16 45)", font: "serif", score: 89,
    sample: p("Marco Bianchi", "Head Chef", "Cape Town, SA", "Creative head chef blending Italian technique with local produce. Runs efficient, happy kitchens with low waste.",
      [{ role: "Head Chef", company: "Olea Restaurant", period: "2019 — Present", details: "Earned 2-star rating in Eat Out guide.\nCut food cost from 34% to 27%." }],
      [{ degree: "Diploma in Culinary Arts", school: "Silwood School", period: "2012 — 2014" }],
      "Menu development, Kitchen leadership, Food costing, HACCP") },
  { id: "fresh", name: "Fresh Start", industry: "Students", role: "Graduate / Intern", layout: "classic", accent: "oklch(0.6 0.15 200)", font: "sans", score: 92,
    sample: p("Zainab Bello", "Economics Graduate", "Kano, Nigeria", "First-class economics graduate eager to apply data skills and fresh thinking in a fast-paced analyst role.",
      [{ role: "Research Intern", company: "Central Bank of Nigeria", period: "Summer 2024", details: "Cleaned and analysed 10 years of inflation data in Stata.\nPresented findings to the monetary policy research team." }],
      [{ degree: "B.Sc. Economics (First Class)", school: "Bayero University", period: "2020 — 2024" }],
      "Stata, Excel, Python basics, Report writing, Public speaking", { awards: "Best Graduating Student, Faculty of Social Sciences" }) },
  { id: "route", name: "Route", industry: "Logistics", role: "Operations Manager", layout: "sidebar", accent: "oklch(0.5 0.1 230)", font: "sans", score: 91,
    sample: p("Chidinma Eze", "Operations Manager", "Port Harcourt, Nigeria", "Operations leader who turns messy supply chains into predictable, measurable systems.",
      [{ role: "Operations Manager", company: "GIG Logistics", period: "2019 — Present", details: "Improved on-time delivery from 81% to 96%.\nLaunched 3 new hubs serving 200k parcels/month." }],
      [{ degree: "B.Sc. Industrial Engineering", school: "University of Port Harcourt", period: "2011 — 2015" }],
      "Supply chain, Lean Six Sigma, Fleet management, Excel, SAP") },
  { id: "pulse", name: "Pulse", industry: "Creative", role: "Content Creator", layout: "banner", accent: "oklch(0.6 0.22 300)", font: "sans", pro: true, score: 88,
    sample: p("Kemi Alade", "Content Creator & Social Strategist", "Los Angeles, CA", "Storyteller with 400k followers who helps brands show up authentically on TikTok, YouTube and Instagram.",
      [{ role: "Social Lead", company: "Wavelength Media", period: "2021 — Present", details: "Grew client TikTok from 0 to 1.2M followers in 10 months.\nProduced campaigns with 50M+ organic views." }],
      [{ degree: "BA Media Studies", school: "UCLA", period: "2015 — 2019" }],
      "Short-form video, Premiere Pro, Copywriting, Analytics, Community") },
  { id: "civic", name: "Civic", industry: "Public Sector", role: "Policy Analyst", layout: "timeline", accent: "oklch(0.4 0.08 150)", font: "serif", score: 93,
    sample: p("Olumide Johnson", "Policy Analyst", "Washington, DC", "Evidence-driven policy analyst focused on economic inclusion and digital public infrastructure in emerging markets.",
      [{ role: "Policy Analyst", company: "World Bank Group", period: "2020 — Present", details: "Co-authored 4 flagship reports on digital ID adoption.\nAdvised 3 governments on fintech regulation." }],
      [{ degree: "MPP Public Policy", school: "Georgetown University", period: "2018 — 2020" }],
      "Policy research, Stata, Stakeholder engagement, Writing", { languages: "English — Native · Yoruba — Native · French — Working" }) },
  { id: "trade", name: "Trade", industry: "Skilled Trades", role: "Electrician", layout: "classic", accent: "oklch(0.7 0.16 85)", font: "sans", score: 90,
    sample: p("James O'Connor", "Licensed Electrician", "Dublin, Ireland", "Safety-first electrician with 10 years across residential, commercial and solar installations.",
      [{ role: "Lead Electrician", company: "BrightSpark Electrical", period: "2016 — Present", details: "Installed 150+ residential solar systems.\nMaintained perfect safety inspection record." }],
      [{ degree: "Electrical Apprenticeship (Level 6)", school: "SOLAS", period: "2010 — 2014" }],
      "Wiring, Solar PV, Fault finding, Blueprint reading, Safety compliance") },
  { id: "noir", name: "Noir Executive", industry: "Executive", role: "Chief Operating Officer", layout: "split", accent: "oklch(0.25 0.02 270)", font: "serif", pro: true, score: 97,
    sample: p("Victoria Hale", "Chief Operating Officer", "New York, NY", "Operator who scales companies from Series B to IPO. 15 years leading global teams across fintech and SaaS.",
      [{ role: "Chief Operating Officer", company: "Finlytic", period: "2019 — Present", details: "Scaled headcount from 120 to 900 across 6 countries.\nLed operations through a $2.1B IPO." },
       { role: "VP Operations", company: "Cloudline", period: "2014 — 2019", details: "Built customer success org that cut churn by 40%." }],
      [{ degree: "MBA", school: "Wharton School", period: "2012 — 2014" }],
      "Scaling operations, P&L ownership, M&A integration, Board relations") },
  { id: "ats-classic", name: "ATS Classic", industry: "All Industries", role: "Any Role", layout: "ats", accent: "oklch(0.3 0.01 270)", font: "sans", score: 99,
    sample: p("Ngozi Ekwueme", "Customer Success Manager", "Enugu, Nigeria", "Customer success manager with 5 years of experience reducing churn and growing accounts for SaaS businesses. Skilled at onboarding, renewal management and turning feedback into product improvements.",
      [{ role: "Customer Success Manager", company: "BrightDesk Software", period: "2021 — Present", details: "Manage a portfolio of 60+ business accounts with a 94% renewal rate.\nCut average onboarding time from 3 weeks to 9 days.\nBuilt a health-score system that flags at-risk accounts 60 days early." },
       { role: "Support Specialist", company: "QuickReply", period: "2018 — 2021", details: "Resolved 40+ customer tickets daily with a 97% satisfaction score.\nWrote 25 help-centre articles that cut repeat tickets by 18%." }],
      [{ degree: "B.Sc. Mass Communication", school: "University of Nigeria, Nsukka", period: "2014 — 2018" }],
      "Account management, Onboarding, Renewals, CRM (HubSpot), Churn analysis, Customer training, Escalation handling, Reporting",
      { strengths: "Relationship building, Problem solving, Clear written communication", courses: "Certified Customer Success Manager (CCSM)" }) },
  { id: "chronicle", name: "Chronicle", industry: "International", role: "Europass Style", layout: "chronicle", accent: "oklch(0.42 0.09 230)", font: "sans", score: 96,
    sample: p("Emeka Obiora", "Logistics Coordinator", "Onitsha, Nigeria", "Logistics coordinator with 7 years of experience moving goods across West Africa. Reliable, detail-focused and calm under pressure.",
      [{ role: "Logistics Coordinator", company: "TransGate Haulage, Onitsha", period: "02/2023 — Present", details: "Coordinate 25+ weekly deliveries across 6 states.\nReduced fuel costs by 12% through route planning.\nTrack a fleet of 18 vehicles using GPS software." },
       { role: "Dispatch Officer", company: "SafeMove Express, Awka", period: "06/2019 — 01/2023", details: "Scheduled daily dispatches for 30 riders.\nMaintained 98% on-time delivery record." }],
      [{ degree: "HND Business Administration", school: "Federal Polytechnic, Oko", period: "09/2014 — 07/2016" }, { degree: "SSCE", school: "Community Secondary School, Nnewi", period: "2008 — 2014" }],
      "Route planning, Fleet tracking, Inventory, Excel, Negotiation, Reporting",
      { strengths: "Time management, Team coordination, Accuracy", awards: "Employee of the Year 2022 — SafeMove Express", courses: "Diploma in Supply Chain Management — Alison (alison.com)", languages: "English — Fluent · Igbo — Native · Hausa — Basic", projects: "Weekend volunteer driver for community food bank" }) },
];

// Sample-only editorial additions: never inserted into a user's own draft.
const SAMPLE_DETAILS: Record<string, { role: string; company: string; period: string; details: string; project: string; course: string }> = {
  prime: { role: "Marketing Analyst", company: "MarketBridge", period: "2016 — 2018", details: "Analysed campaign cohorts to improve conversion by 16%.\nPrepared weekly acquisition reports for sales and product teams.", project: "Market expansion: researched 120 customer interviews and created a launch playbook adopted across three regions.", course: "Product Marketing Certification — Product Marketing Alliance, 2023" },
  axis: { role: "Backend Developer", company: "Northstar Labs", period: "2015 — 2017", details: "Built audited REST endpoints supporting 40,000 customers.\nIntroduced integration tests and reduced release regressions by 28%.", project: "Open-source rate limiter: documented deployment patterns, reviewed community contributions and maintained automated benchmarks.", course: "AWS Certified Solutions Architect — Associate, 2023" },
  carewell: { role: "Graduate Nurse", company: "Accra Community Clinic", period: "2016 — 2017", details: "Supported assessments, discharge planning and patient education.\nMaintained accurate handover records across rotating clinical teams.", project: "Patient safety: designed a bedside handover checklist adopted by two wards and monitored compliance monthly.", course: "Critical Care Nursing CPD — Ghana Registered Nurses Association, 2023" },
  ledger: { role: "Junior Financial Analyst", company: "Meridian Advisory", period: "2018 — 2019", details: "Reviewed operating forecasts for eight mid-market clients.\nReconciled cash-flow assumptions and prepared investment committee briefs.\nStandardised valuation workbooks to reduce review time by 20%.", project: "Portfolio dashboard: combined financial and operating indicators into a monthly investment review used by five analysts.", course: "Financial Modelling & Valuation Analyst — CFI, 2022" },
  canvas: { role: "Design Intern", company: "Common Ground Studio", period: "2016 — 2017", details: "Conducted usability sessions and translated findings into wireframes.\nDocumented accessible components for two responsive websites.", project: "Accessible finance: tested a budgeting prototype with 18 users and improved task completion from 64% to 89%.", course: "Accessibility for Designers — Interaction Design Foundation, 2023" },
  chalk: { role: "Mathematics Teacher", company: "Greenhill Secondary School", period: "2015 — 2019", details: "Taught mathematics to 120 students across three year groups.\nCreated weekly intervention sessions for learners below target.\nRaised examination readiness through structured mock assessments.", project: "Numeracy club: organised a weekly problem-solving programme and mentored students for regional competitions.", course: "Inclusive Classroom Practice — Teacher CPD, 2023" },
  forge: { role: "Assistant Site Engineer", company: "BuildWorks Infrastructure", period: "2016 — 2018", details: "Prepared site measurements, quantity records and inspection reports.\nCoordinated subcontractors against a rolling two-week work plan.\nVerified reinforcement drawings before concrete pours.", project: "Drainage upgrade: coordinated surveying and work packages for a 4 km urban corridor while maintaining access for residents.", course: "Construction Health & Safety — HSE Level 3, 2023" },
  counter: { role: "Account Executive", company: "Westgate Distribution", period: "2015 — 2020", details: "Managed 45 retail accounts and exceeded annual quota by 18%.\nNegotiated renewals and expanded average order value by 14%.\nMaintained accurate pipeline forecasts and customer visit plans.", project: "Sales enablement: built a discovery and negotiation playbook used to onboard seven new representatives.", course: "Sales Management Certification — HubSpot Academy, 2023" },
  brief: { role: "Junior Associate", company: "Crest Legal Partners", period: "2018 — 2020", details: "Prepared due-diligence summaries and commercial agreements.\nResearched company-law changes for client advisory notes.\nCoordinated filing deadlines and maintained transaction checklists.", project: "Compliance toolkit: created a regulatory calendar and board-resolution library for growing businesses.", course: "Corporate Governance CPD — Nigerian Bar Association, 2023" },
  plate: { role: "Sous Chef", company: "Coastal Table", period: "2014 — 2019", details: "Managed prep and service for a 90-cover restaurant.\nTrained eight cooks on food safety and recipe consistency.\nReduced spoilage with daily inventory and supplier planning.", project: "Seasonal menu: developed a local-produce tasting menu, tested margins and created standardised recipe cards.", course: "Advanced Food Safety & HACCP — Hospitality CPD, 2023" },
  fresh: { role: "Student Research Assistant", company: "Bayero University", period: "2023 — 2024", details: "Surveyed 80 households for a study on transport costs.\nValidated data and prepared charts for a faculty presentation.\nCoordinated a four-person student research group.", project: "Final-year research: modelled the relationship between inflation and household expenditure using public economic data.", course: "Data Analysis with Python — introductory certificate, 2024" },
  route: { role: "Logistics Supervisor", company: "HarbourLink Services", period: "2015 — 2019", details: "Scheduled dispatches and supervised a team of 16 warehouse staff.\nReconciled shipment manifests and investigated delivery exceptions.\nImproved stock accuracy with weekly cycle counts.", project: "Hub performance: introduced daily dispatch scorecards and a weekly exception review to improve service reliability.", course: "Lean Six Sigma Green Belt — operations training, 2023" },
  pulse: { role: "Content Producer", company: "Culture House", period: "2019 — 2021", details: "Produced weekly video features and managed editorial calendars.\nTested titles and thumbnails to improve view-through rates by 19%.\nCoordinated shoots, brand approvals and publishing schedules.", project: "Creator series: produced 12 interviews with emerging founders and tracked audience retention across platforms.", course: "Digital Marketing & E-commerce — Google, 2023" },
  civic: { role: "Research Associate", company: "Policy Futures Institute", period: "2016 — 2018", details: "Analysed survey data for economic inclusion research.\nPrepared briefing notes and stakeholder consultation summaries.\nMaintained reproducible analysis files and evidence registers.", project: "Digital inclusion: developed a policy brief comparing access barriers and presented recommendations at a research roundtable.", course: "Impact Evaluation Methods — professional short course, 2023" },
  trade: { role: "Electrician", company: "Cityline Electrical", period: "2014 — 2016", details: "Completed wiring, testing and fault repairs for commercial clients.\nRecorded compliance certificates and coordinated materials ordering.\nSupported apprentices during supervised installation work.", project: "Energy efficiency: delivered LED retrofits for 12 small businesses and documented projected electricity savings.", course: "Solar PV Installation & Inspection — technical CPD, 2023" },
  noir: { role: "Director of Operations", company: "Northstar Payments", period: "2009 — 2012", details: "Established operating reviews across service, risk and finance teams.\nImproved service capacity without increasing cost per account.", project: "Operating model: integrated two acquisitions and established a unified KPI framework for executive and board reporting.", course: "Executive Leadership Programme — professional development, 2023" },
  "ats-classic": { role: "Customer Service Associate", company: "ConnectPoint", period: "2017 — 2018", details: "Maintained accurate case notes and met response-time targets.\nIdentified recurring issues and escalated product feedback.", project: "Customer onboarding: built a self-service welcome programme with role-based training and tracked adoption across 60 accounts.", course: "Customer Success Analytics — professional training, 2023" },
  chronicle: { role: "Warehouse Assistant", company: "RiverPort Distribution", period: "08/2016 — 05/2019", details: "Checked inbound goods against delivery notes and stock records.\nPrepared dispatch documentation and investigated picking errors.", project: "Community food bank: coordinate a monthly volunteer delivery rota and maintain collection and distribution records.", course: "Fleet Safety & Route Planning — professional training, 2023" },
};
export const TEMPLATES: Template[] = BASE_TEMPLATES.map((t) => {
  const extra = SAMPLE_DETAILS[t.id];
  if (!extra) return t;
  const experience = [...t.sample.experience, { role: extra.role, company: extra.company, period: extra.period, details: extra.details }];
  return { ...t, sample: { ...t.sample, experience,
    projects: extra.project,
    courses: [t.sample.courses, extra.course].filter(Boolean).join("\n"),
    summary: `${t.sample.summary} Brings a practical, collaborative approach to planning, delivery and continuous improvement, with clear reporting and a focus on measurable results.`,
    strengths: "Stakeholder communication\nAnalytical problem solving\nPlanning and prioritisation\nTeam collaboration",
  } };
});
export const INDUSTRIES = ["All", ...Array.from(new Set(TEMPLATES.map((t) => t.industry)))];
export const getTemplate = (id?: string) => TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0] as Template;
