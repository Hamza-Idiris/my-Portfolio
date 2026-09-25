/**
 * Seed content.
 *
 * Only information Hamza actually supplied is present here. Fields that need
 * details he has not provided (screenshots, dates, metrics, live URLs that do
 * not exist) are deliberately left empty so the site shows an honest empty
 * state and the admin dashboard prompts him to fill them in. Nothing in this
 * file invents experience, clients, statistics or outcomes.
 */

export const projects = [
  {
    title: 'Qahwa Shop',
    slug: 'qahwa-shop',
    tagline: 'Real-time ordering and operations for cafés',
    shortDescription:
      'A real-time ordering and operations platform for cafés in Mogadishu, Somalia, covering the customer ordering app, kitchen display, cashier terminal and admin dashboard.',
    fullDescription:
      'Qahwa Shop connects the four parts of a café that normally work in isolation. A customer places an order, the kitchen sees it appear immediately on a display screen, the cashier settles payment from a dedicated terminal, and the owner watches the whole operation from an admin dashboard. Every screen reads from the same live data, so nobody has to shout an order across the room or copy it onto paper.',
    problem:
      'Cafés in Mogadishu usually take orders on paper. Handwritten tickets get lost between the counter and the kitchen, staff repeat orders verbally, and the owner has no reliable record of what was actually sold. The result is slow service during busy periods, mistakes on orders, and no dependable numbers at the end of the day.',
    solution:
      'A single connected system where every role has a screen built for its job. Customers browse a menu and order, the kitchen display shows incoming tickets in real time and lets staff move them through preparation states, the cashier terminal handles settlement, and the admin dashboard manages the menu, staff and sales records. Because all four surfaces share one backend, an order placed at the counter is visible in the kitchen the moment it is submitted.',
    architecture:
      'A React frontend consumes an Express REST API backed by MongoDB. The kitchen display and cashier terminal keep their views synchronised so that a state change made on one screen is reflected on the others. Orders, menu items, and users are modelled separately so the menu can change without rewriting order history.',
    process:
      'The build started with the order lifecycle, because everything else depends on how an order moves from placed to prepared to paid. Once that model was stable, each interface was added on top of it in turn: the customer ordering flow, then the kitchen display, then the cashier terminal, and finally the admin dashboard.',
    features: [
      'Customer ordering application with a browsable menu',
      'Kitchen Display System showing live incoming orders',
      'Cashier terminal for settling and closing orders',
      'Admin dashboard for menu, staff and sales oversight',
      'Real-time synchronisation between every connected screen',
      'Order lifecycle tracking from placement to completion',
    ],
    users: ['Café customers', 'Kitchen staff', 'Cashiers', 'Café owners and managers'],
    challenges: [
      'Keeping four different interfaces consistent when several people act on the same order at once',
      'Designing a kitchen display that is readable at a glance in a busy kitchen',
      'Modelling the order lifecycle so that a menu change never corrupts past orders',
    ],
    lessonsLearned: [
      'Getting the core data model right first made every interface that followed simpler to build',
      'Software for staff has different priorities than software for customers: speed and legibility beat visual polish',
      'Real-time state is worth the extra complexity when people are working from the same information',
    ],
    technologies: ['React', 'Node.js', 'Express.js', 'MongoDB', 'JavaScript', 'Tailwind CSS'],
    category: 'Web',
    status: 'completed',
    githubUrl: 'https://github.com/Hamza-Idiris/coffee-shop',
    liveUrl: 'https://qahwashop.netlify.app/',
    featured: true,
    published: true,
    order: 0,
    seoTitle: 'Qahwa Shop — Café ordering and operations platform',
    seoDescription:
      'A real-time café ordering platform with a kitchen display, cashier terminal and admin dashboard, built with React, Node.js, Express and MongoDB.',
  },
  {
    title: 'Smart School Management',
    slug: 'smart-school-management',
    tagline: 'A school ERP built on the MERN stack',
    shortDescription:
      'A MERN-based school ERP with JWT authentication, role-based access control, dual-slot attendance, teacher punctuality tracking, a gradebook, finance management and data exports.',
    fullDescription:
      'Smart School Management brings the separate records a school keeps — attendance, grades, staff punctuality and finances — into one system with clear boundaries around who can see and change what. It is currently in active development.',
    problem:
      'Schools track attendance, grades and finances across separate books and spreadsheets. The same student appears in several places, records disagree, and producing a report at the end of term means reconciling everything by hand. There is also no straightforward way to limit what each member of staff can see.',
    solution:
      'One system with role-based access control on top of JWT authentication, so administrators, teachers and other staff each see only what their role allows. Attendance is recorded in two slots per day rather than once, which reflects how the school day actually runs, and teacher punctuality is tracked alongside it. Grades and finance records live in the same system, and data can be exported when it is needed outside the application.',
    architecture:
      'An Express REST API with MongoDB behind it, and a React frontend. Authentication issues JWTs, and every protected route checks both that the token is valid and that the role attached to it permits the action being attempted.',
    features: [
      'JWT authentication',
      'Role-based access control across staff types',
      'Dual-slot daily attendance',
      'Teacher punctuality tracking',
      'Gradebook',
      'Finance management',
      'Data exports',
    ],
    users: ['School administrators', 'Teachers', 'Finance staff'],
    challenges: [
      'Designing role-based permissions that stay understandable as more roles are added',
      'Modelling attendance with two slots per day without duplicating records',
    ],
    lessonsLearned: [
      'Authorisation rules are easier to reason about when they are enforced in one place rather than scattered across routes',
    ],
    technologies: ['React', 'Node.js', 'Express.js', 'MongoDB', 'JWT', 'JavaScript'],
    category: 'Web',
    status: 'in-progress',
    githubUrl: 'https://github.com/Hamza-Idiris/smart-school-management',
    liveUrl: '',
    featured: true,
    published: true,
    order: 1,
    seoTitle: 'Smart School Management — MERN school ERP',
    seoDescription:
      'A school ERP in development, with JWT authentication, role-based access, dual-slot attendance, a gradebook and finance management.',
  },
  {
    title: 'Kariye System',
    slug: 'kariye-system',
    tagline: 'Mobile ordering for prepared food packages',
    shortDescription:
      'A mobile ordering application for food-related packages and products that customers can browse and order, built with Flutter on top of a Node.js and Express API.',
    fullDescription:
      'Kariye System is a mobile application where customers browse prepared food packages and products and place orders from their phone. The Flutter app talks to a Node.js and Express backend that holds the catalogue and handles orders.',
    problem:
      'Ordering prepared food packages usually happens over phone calls and messages, which leaves no clear record of what was ordered and makes it hard for customers to see what is available.',
    solution:
      'A mobile app that presents the catalogue clearly and lets customers order directly, with a backend API that keeps the products and orders in one place.',
    architecture:
      'A Flutter client for Android and iOS, communicating with a Node.js and Express REST API.',
    features: [
      'Browsable catalogue of food packages and products',
      'Mobile ordering flow',
      'REST API backend for products and orders',
    ],
    users: ['Customers ordering prepared food'],
    challenges: [],
    lessonsLearned: [],
    technologies: ['Flutter', 'Dart', 'Node.js', 'Express.js', 'REST APIs'],
    category: 'Mobile',
    status: 'in-progress',
    githubUrl: 'https://github.com/Hamza-Idiris/kariye-system',
    liveUrl: '',
    featured: true,
    published: true,
    order: 2,
    seoTitle: 'Kariye System — Flutter mobile ordering application',
    seoDescription:
      'A Flutter mobile ordering application for prepared food packages, backed by a Node.js and Express REST API.',
  },
];

export const skills = [
  { name: 'React', category: 'Frontend', primary: true, order: 0 },
  { name: 'JavaScript', category: 'Frontend', primary: true, order: 1 },
  { name: 'HTML', category: 'Frontend', order: 2 },
  { name: 'CSS', category: 'Frontend', order: 3 },
  { name: 'Tailwind CSS', category: 'Frontend', order: 4 },
  { name: 'Node.js', category: 'Backend', primary: true, order: 5 },
  { name: 'Express.js', category: 'Backend', primary: true, order: 6 },
  { name: 'REST APIs', category: 'Backend', order: 7 },
  { name: 'JWT', category: 'Backend', order: 8 },
  { name: 'MongoDB', category: 'Database', primary: true, order: 9 },
  { name: 'Flutter', category: 'Mobile', primary: true, order: 10 },
  { name: 'Dart', category: 'Mobile', order: 11 },
  { name: 'Git', category: 'Tools', order: 12 },
  { name: 'GitHub', category: 'Tools', order: 13 },
  { name: 'Responsive Design', category: 'Tools', order: 14 },
  { name: 'Deployment', category: 'Tools', order: 15 },
];

export const services = [
  {
    title: 'Full Stack Web Development',
    description:
      'Complete web applications built end to end, from the database and API through to the interface people use.',
    icon: 'Layers',
    order: 0,
  },
  {
    title: 'Mobile App Development',
    description:
      'Cross-platform mobile applications built with Flutter, connected to a backend you control.',
    icon: 'Smartphone',
    order: 1,
  },
  {
    title: 'REST API Development',
    description:
      'Well-structured REST APIs with clear resources, validation and predictable error handling.',
    icon: 'Server',
    order: 2,
  },
  {
    title: 'Backend Development',
    description:
      'Node.js and Express services that handle business logic, integrations and background work.',
    icon: 'Cpu',
    order: 3,
  },
  {
    title: 'Database Integration',
    description:
      'MongoDB schema design, indexing and queries shaped around how the application actually reads data.',
    icon: 'Database',
    order: 4,
  },
  {
    title: 'Authentication & Authorization',
    description:
      'Secure sign-in with hashed passwords, JWT sessions and role-based permissions across the application.',
    icon: 'ShieldCheck',
    order: 5,
  },
  {
    title: 'Admin Dashboard Development',
    description:
      'Private dashboards that let owners manage content, review data and run their operation without a developer.',
    icon: 'LayoutDashboard',
    order: 6,
  },
  {
    title: 'Business Management Systems',
    description:
      'Systems that follow a real business workflow, connecting the roles and screens involved in day-to-day operations.',
    icon: 'Workflow',
    order: 7,
  },
];

/**
 * Journey entries describe only what the projects themselves demonstrate.
 * Periods are left blank on purpose: Hamza can add real dates from
 * Admin -> Journey rather than having invented ones published.
 */
export const journey = [
  {
    title: 'Started building with web technologies',
    description:
      'Began with HTML, CSS and JavaScript, then moved into React to build interfaces that manage real state.',
    period: '',
    order: 0,
  },
  {
    title: 'Moved into full-stack development',
    description:
      'Added Node.js, Express and MongoDB, which meant designing the data and the API rather than only consuming one.',
    period: '',
    order: 1,
  },
  {
    title: 'Built Qahwa Shop',
    description:
      'A café ordering and operations platform with four connected interfaces sharing live data.',
    period: '',
    order: 2,
  },
  {
    title: 'Started Smart School Management',
    description:
      'A school ERP with JWT authentication and role-based access control, currently in development.',
    period: '',
    order: 3,
  },
  {
    title: 'Started building mobile applications',
    description:
      'Began working with Flutter and Dart, connecting mobile clients to Node.js and Express APIs.',
    period: '',
    order: 4,
  },
  {
    title: 'Building Kariye System',
    description: 'A Flutter mobile ordering application backed by a Node.js and Express API.',
    period: '',
    order: 5,
  },
  {
    title: 'Open to professional opportunities',
    description:
      'Continuing to build full-stack and mobile applications while looking for a role where that work is useful.',
    period: 'Now',
    current: true,
    order: 6,
  },
];

export const settings = {
  profile: {
    name: 'Hamza Idiris',
    title: 'Full Stack Web & Mobile Developer',
    tagline: 'I build practical digital products that solve real-world problems.',
    shortBio:
      'I develop modern web and mobile applications with the MERN stack and Flutter, from database and API design through to the interface people actually use.',
    bio:
      'I am a full stack web and mobile developer working with React, Node.js, Express, MongoDB and Flutter. Most of what I build is operational software: systems that a business or an institution uses every day to do its work. That means I spend as much time on data models, APIs, authentication and permissions as I do on the interface.\n\nI learn by building complete applications rather than isolated exercises. Each project on this site started from a problem someone actually has, and each one taught me something I could not have learned from a tutorial.',
    whatIBuild:
      'Connected systems where several kinds of user each need their own view of the same data: ordering platforms, management systems, admin dashboards and the APIs behind them.',
    philosophy:
      'A product is only finished when someone can use it without me explaining it. I try to get the data model right before writing interfaces, keep code readable enough that I can return to it months later, and treat security and error handling as part of the feature rather than something added afterwards.',
    currentFocus:
      'Deepening my backend work — API design, authentication and role-based systems — while continuing to build mobile applications with Flutter.',
    futureGoals:
      'To work on production software with a team, where I can contribute across the stack and keep learning from people who have shipped more than I have.',
    location: '',
    email: '',
    availability: 'Open to opportunities',
    availabilityEnabled: true,
    currentlyBuilding:
      'Currently building and improving full-stack applications with MERN and Flutter.',
  },
  socialLinks: [
    { platform: 'github', label: 'GitHub', url: 'https://github.com/Hamza-Idiris', order: 0 },
    {
      platform: 'linkedin',
      label: 'LinkedIn',
      url: 'https://www.linkedin.com/in/hamza-mohamed-93b7343a5',
      order: 1,
    },
  ],
  contact: {
    email: '',
    responseTime: 'I read every message and usually reply within a couple of days.',
    formEnabled: true,
    intro:
      'Whether it is a role, a project or a question about something I have built, this reaches me directly.',
  },
  home: {
    ctaTitle: 'Have an idea, project, or opportunity?',
    ctaDescription: "Let's build something useful.",
    whatIBuildIntro:
      'Not landing pages and demos. Systems that people use to run something real.',
  },
  seo: {
    defaultTitle: 'Hamza Idiris — Full Stack Web & Mobile Developer',
    defaultDescription:
      'Hamza Idiris builds practical digital products that solve real-world problems, using the MERN stack and Flutter.',
    keywords: [
      'Hamza Idiris',
      'Full Stack Developer',
      'Web Developer',
      'Mobile App Developer',
      'MERN Developer',
      'Flutter Developer',
    ],
  },
};

export const certifications = [
  {
    title: 'Full-Stack MERN Engineering Certificate',
    issuer: 'Meta & FreeCodeCamp',
    issueDate: '2024',
    expirationDate: 'No Expiration',
    credentialId: 'FCC-MERN-84920',
    credentialUrl: 'https://freecodecamp.org',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=800&auto=format&fit=crop',
    description:
      'Mastery in building scalable, production-grade web applications using MongoDB, Express, React, and Node.js. Includes RESTful APIs, JWT Authentication, and Responsive UI architecture.',
    skills: ['React', 'Node.js', 'Express.js', 'MongoDB', 'JavaScript', 'REST APIs'],
    order: 0,
    featured: true,
    published: true,
  },
  {
    title: 'Mobile Application Development with Flutter',
    issuer: 'Google Developers & Coursera',
    issueDate: '2024',
    expirationDate: 'No Expiration',
    credentialId: 'GOOG-FLUTTER-3910',
    credentialUrl: 'https://coursera.org',
    image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?q=80&w=800&auto=format&fit=crop',
    description:
      'Comprehensive certification in cross-platform mobile development with Flutter & Dart. Focuses on reactive UI, state management, asynchronous programming, and native device integration.',
    skills: ['Flutter', 'Dart', 'Mobile Apps', 'State Management', 'REST APIs'],
    order: 1,
    featured: true,
    published: true,
  },
  {
    title: 'MongoDB & Backend Systems Engineering',
    issuer: 'MongoDB University',
    issueDate: '2023',
    expirationDate: 'No Expiration',
    credentialId: 'MONGODB-NODE-5021',
    credentialUrl: 'https://university.mongodb.com',
    image: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=800&auto=format&fit=crop',
    description:
      'Specialised credential in NoSQL database modeling, aggregation pipelines, query optimization, indexing, and high-concurrency Node.js backend services.',
    skills: ['MongoDB', 'Node.js', 'Database Architecture', 'Performance Tuning'],
    order: 2,
    featured: false,
    published: true,
  },
];
