export interface CourseUnit {
    number: number;
    title: string;
    topics: string[];
}

export interface CourseSyllabus {
    code: string;
    title: string;
    credits: number;
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    units: CourseUnit[];
}

export const COURSE_SYLLABI: { [key: string]: CourseSyllabus } = {
    'CS402': {
        code: 'CS402',
        title: 'Artificial Intelligence',
        credits: 4,
        level: 'Advanced',
        units: [
            {
                number: 1,
                title: 'Introduction to AI',
                topics: ['History', 'goals', 'applications', 'Turing Test', 'intelligent systems']
            },
            {
                number: 2,
                title: 'Intelligent Agents',
                topics: ['Agent types', 'environments', 'PEAS descriptions']
            },
            {
                number: 3,
                title: 'Problem Solving & Search',
                topics: ['Problem formulation', 'state space', 'uninformed search']
            },
            {
                number: 4,
                title: 'Heuristic Search Techniques',
                topics: ['A*', 'greedy search', 'local search', 'hill climbing', 'simulated annealing']
            },
            {
                number: 5,
                title: 'Adversarial Search',
                topics: ['Games', 'minimax', 'alpha–beta pruning']
            },
            {
                number: 6,
                title: 'Knowledge Representation',
                topics: ['Propositional logic', 'predicate logic', 'semantic networks']
            },
            {
                number: 7,
                title: 'Knowledge-Based Systems',
                topics: ['Rule-based systems', 'inference engines', 'expert systems']
            },
            {
                number: 8,
                title: 'Reasoning Under Uncertainty',
                topics: ['Bayesian networks', 'probabilistic reasoning']
            },
            {
                number: 9,
                title: 'Constraint Satisfaction Problems (CSP)',
                topics: ['Backtracking', 'constraint propagation', 'heuristics']
            },
            {
                number: 10,
                title: 'Planning & Decision Making',
                topics: ['STRIPS', 'partial-order planning', 'MDPs']
            },
            {
                number: 11,
                title: 'Introduction to Machine Learning',
                topics: ['Supervised & unsupervised learning basics']
            },
            {
                number: 12,
                title: 'Natural Language Processing Basics',
                topics: ['Text processing', 'tokenization', 'language models']
            }
        ]
    },
    'CS201': {
        code: 'CS201',
        title: 'Data Structures & Algorithms',
        credits: 4,
        level: 'Intermediate',
        units: [
            {
                number: 1,
                title: 'Introduction & Complexity Analysis',
                topics: ['Big-O', 'Big-Ω', 'Big-Θ', 'time/space complexity']
            },
            {
                number: 2,
                title: 'Arrays & Linked Lists',
                topics: ['Static/dynamic arrays', 'single/double-linked lists']
            },
            {
                number: 3,
                title: 'Stacks & Queues',
                topics: ['Implementation and applications']
            },
            {
                number: 4,
                title: 'Recursion & Divide-and-Conquer',
                topics: ['Recurrence relations', 'Master Theorem']
            },
            {
                number: 5,
                title: 'Trees',
                topics: ['Binary trees', 'traversal', 'expression trees']
            },
            {
                number: 6,
                title: 'Binary Search Trees (BST)',
                topics: ['Operations', 'balanced/unbalanced trees']
            },
            {
                number: 7,
                title: 'Heaps & Priority Queues',
                topics: ['Min/max heaps', 'heap sort']
            },
            {
                number: 8,
                title: 'AVL & Red–Black Trees',
                topics: ['Rotations', 'balancing techniques']
            },
            {
                number: 9,
                title: 'Graphs',
                topics: ['Representation', 'BFS', 'DFS', 'shortest path basics']
            },
            {
                number: 10,
                title: 'Advanced Graph Algorithms',
                topics: ['Dijkstra', 'Bellman–Ford', 'Floyd-Warshall', 'MST (Kruskal/Prim)']
            },
            {
                number: 11,
                title: 'Hashing & Hash Tables',
                topics: ['Collision resolution', 'open addressing']
            },
            {
                number: 12,
                title: 'Algorithm Design Paradigms',
                topics: ['Greedy algorithms', 'dynamic programming']
            }
        ]
    },
    'CS301': {
        code: 'CS301',
        title: 'Database Management Systems',
        credits: 3,
        level: 'Intermediate',
        units: [
            {
                number: 1,
                title: 'Introduction to Databases',
                topics: ['Types', 'DBMS architecture', 'data models']
            },
            {
                number: 2,
                title: 'Entity–Relationship (ER) Modeling',
                topics: ['ER diagrams', 'relationships', 'attributes']
            },
            {
                number: 3,
                title: 'Relational Model',
                topics: ['Keys', 'integrity constraints', 'relational algebra']
            },
            {
                number: 4,
                title: 'SQL Basics',
                topics: ['SELECT', 'INSERT', 'UPDATE', 'DELETE']
            },
            {
                number: 5,
                title: 'Advanced SQL',
                topics: ['JOINs', 'subqueries', 'views', 'triggers', 'stored procedures']
            },
            {
                number: 6,
                title: 'Database Design & Normalization',
                topics: ['1NF to BCNF', 'functional dependencies']
            },
            {
                number: 7,
                title: 'Transaction Management',
                topics: ['ACID properties', 'concurrency control']
            },
            {
                number: 8,
                title: 'Locking & Deadlocks',
                topics: ['Lock types', 'detection', 'prevention']
            },
            {
                number: 9,
                title: 'Indexing & Query Optimization',
                topics: ['B-trees', 'hashing', 'cost-based optimization']
            },
            {
                number: 10,
                title: 'Database Recovery',
                topics: ['Logging', 'checkpoints', 'recovery methods']
            },
            {
                number: 11,
                title: 'NoSQL Databases',
                topics: ['Document', 'key-value', 'column', 'graph databases']
            },
            {
                number: 12,
                title: 'Database Security',
                topics: ['Authentication', 'authorization', 'SQL injection prevention']
            }
        ]
    },
    'CS101': {
        code: 'CS101',
        title: 'Introduction to Programming',
        credits: 3,
        level: 'Beginner',
        units: [
            {
                number: 1,
                title: 'Introduction to Programming Concepts',
                topics: ['Algorithms', 'flowcharts', 'pseudocode']
            },
            {
                number: 2,
                title: 'Python Basics',
                topics: ['Variables', 'data types', 'input/output']
            },
            {
                number: 3,
                title: 'Operators & Expressions',
                topics: ['Arithmetic', 'logical', 'comparison operators']
            },
            {
                number: 4,
                title: 'Conditional Statements',
                topics: ['if', 'elif', 'else']
            },
            {
                number: 5,
                title: 'Loops',
                topics: ['for', 'while', 'nested loops']
            },
            {
                number: 6,
                title: 'Functions & Modular Programming',
                topics: ['Parameters', 'return values', 'scope']
            },
            {
                number: 7,
                title: 'Data Structures in Python',
                topics: ['Lists', 'tuples', 'sets', 'dictionaries']
            },
            {
                number: 8,
                title: 'String Manipulation',
                topics: ['Slicing', 'methods', 'formatting']
            },
            {
                number: 9,
                title: 'File Handling',
                topics: ['Read/write text files']
            },
            {
                number: 10,
                title: 'Exception Handling',
                topics: ['try-except-else-finally']
            },
            {
                number: 11,
                title: 'Introduction to OOP',
                topics: ['Classes', 'objects', 'methods']
            },
            {
                number: 12,
                title: 'Mini Projects',
                topics: ['Simple real-world applications']
            }
        ]
    },
    'CS401': {
        code: 'CS401',
        title: 'Machine Learning Basics',
        credits: 4,
        level: 'Advanced',
        units: [
            {
                number: 1,
                title: 'Introduction to Machine Learning',
                topics: ['Types of learning', 'ML workflow']
            },
            {
                number: 2,
                title: 'Data Preprocessing',
                topics: ['Handling missing values', 'scaling', 'encoding']
            },
            {
                number: 3,
                title: 'Feature Engineering',
                topics: ['Feature selection', 'extraction', 'PCA basics']
            },
            {
                number: 4,
                title: 'Linear Regression',
                topics: ['Model building', 'cost functions', 'gradient descent']
            },
            {
                number: 5,
                title: 'Logistic Regression',
                topics: ['Classification basics', 'decision boundaries']
            },
            {
                number: 6,
                title: 'Decision Trees & Random Forests',
                topics: ['Entropy', 'Gini index', 'ensemble learning']
            },
            {
                number: 7,
                title: 'KNN & Naïve Bayes',
                topics: ['Distance metrics', 'Bayes theorem']
            },
            {
                number: 8,
                title: 'Support Vector Machines (SVM)',
                topics: ['Linear and non-linear classification']
            },
            {
                number: 9,
                title: 'Clustering Techniques',
                topics: ['K-Means', 'hierarchical clustering']
            },
            {
                number: 10,
                title: 'Dimensionality Reduction',
                topics: ['PCA', 't-SNE basics']
            },
            {
                number: 11,
                title: 'Model Evaluation',
                topics: ['Confusion matrix', 'accuracy', 'precision', 'recall', 'ROC']
            },
            {
                number: 12,
                title: 'ML Applications',
                topics: ['Real-world case studies']
            }
        ]
    },
    'CS202': {
        code: 'CS202',
        title: 'Object-Oriented Programming',
        credits: 3,
        level: 'Intermediate',
        units: [
            {
                number: 1,
                title: 'Introduction to OOP',
                topics: ['Principles', 'benefits']
            },
            {
                number: 2,
                title: 'Classes & Objects',
                topics: ['Constructors', 'attributes', 'methods']
            },
            {
                number: 3,
                title: 'Encapsulation',
                topics: ['Access modifiers', 'getters/setters']
            },
            {
                number: 4,
                title: 'Inheritance',
                topics: ['Types of inheritance', 'method overriding']
            },
            {
                number: 5,
                title: 'Polymorphism',
                topics: ['Compile-time & runtime polymorphism']
            },
            {
                number: 6,
                title: 'Abstraction',
                topics: ['Abstract classes', 'interfaces']
            },
            {
                number: 7,
                title: 'Static Members',
                topics: ['Static variables & methods']
            },
            {
                number: 8,
                title: 'Exception Handling',
                topics: ['Try/catch', 'custom exceptions']
            },
            {
                number: 9,
                title: 'File Input/Output',
                topics: ['Streams', 'serialization']
            },
            {
                number: 10,
                title: 'Collections Framework',
                topics: ['Lists', 'sets', 'maps']
            },
            {
                number: 11,
                title: 'Design Patterns',
                topics: ['Singleton', 'Factory', 'Observer']
            },
            {
                number: 12,
                title: 'Project Development',
                topics: ['Building an OOP-based application']
            }
        ]
    },
    'CS302': {
        code: 'CS302',
        title: 'Software Engineering',
        credits: 3,
        level: 'Intermediate',
        units: [
            {
                number: 1,
                title: 'Introduction to Software Engineering',
                topics: ['Software crisis', 'principles']
            },
            {
                number: 2,
                title: 'Software Development Life Cycle (SDLC)',
                topics: ['Waterfall', 'iterative', 'spiral']
            },
            {
                number: 3,
                title: 'Agile Methodologies',
                topics: ['Scrum roles', 'events', 'artifacts']
            },
            {
                number: 4,
                title: 'Requirements Engineering',
                topics: ['Elicitation', 'analysis', 'documentation']
            },
            {
                number: 5,
                title: 'System Modeling with UML',
                topics: ['Use case', 'class diagram', 'sequence diagram']
            },
            {
                number: 6,
                title: 'Software Design Principles',
                topics: ['Cohesion', 'coupling', 'modularity']
            },
            {
                number: 7,
                title: 'Software Architecture',
                topics: ['Layered', 'client-server', 'microservices']
            },
            {
                number: 8,
                title: 'Coding Standards & Best Practices',
                topics: ['Clean code', 'documentation']
            },
            {
                number: 9,
                title: 'Version Control (Git)',
                topics: ['Branching', 'merging', 'pull requests']
            },
            {
                number: 10,
                title: 'Software Testing',
                topics: ['Unit', 'integration', 'system', 'acceptance tests']
            },
            {
                number: 11,
                title: 'Software Maintenance',
                topics: ['Corrective', 'adaptive', 'preventive']
            },
            {
                number: 12,
                title: 'Project Management',
                topics: ['Scheduling', 'risk management', 'cost estimation']
            }
        ]
    },
    'CS202W': {
        code: 'CS202W',
        title: 'Web Development Fundamentals',
        credits: 4,
        level: 'Beginner',
        units: [
            {
                number: 1,
                title: 'Introduction to Web Technologies',
                topics: ['Front-end', 'back-end', 'browsers', 'servers']
            },
            {
                number: 2,
                title: 'HTML Basics',
                topics: ['Elements', 'attributes', 'forms']
            },
            {
                number: 3,
                title: 'CSS Styling',
                topics: ['Colors', 'fonts', 'layouts']
            },
            {
                number: 4,
                title: 'Responsive Web Design',
                topics: ['Flexbox', 'Grid', 'media queries']
            },
            {
                number: 5,
                title: 'JavaScript Basics',
                topics: ['Variables', 'functions', 'DOM']
            },
            {
                number: 6,
                title: 'DOM Manipulation',
                topics: ['Events', 'selectors', 'dynamic content']
            },
            {
                number: 7,
                title: 'Advanced JavaScript Concepts',
                topics: ['ES6+', 'promises', 'fetch API']
            },
            {
                number: 8,
                title: 'Front-End Frameworks (React Basics)',
                topics: ['Components', 'props', 'state']
            },
            {
                number: 9,
                title: 'Node.js Fundamentals',
                topics: ['Server-side basics', 'modules']
            },
            {
                number: 10,
                title: 'Express.js',
                topics: ['Routing', 'middleware', 'API development']
            },
            {
                number: 11,
                title: 'Database Integration for Web Apps',
                topics: ['MongoDB / SQL basics']
            },
            {
                number: 12,
                title: 'Deployment',
                topics: ['Hosting', 'GitHub Pages', 'Netlify', 'Vercel']
            }
        ]
    }
};

export const getCourseByCode = (code: string): CourseSyllabus | undefined => {
    return COURSE_SYLLABI[code];
};

export const getUnitsByCode = (code: string): CourseUnit[] => {
    const course = COURSE_SYLLABI[code];
    return course ? course.units : [];
};

export const getAllCourseCodes = (): string[] => {
    return Object.keys(COURSE_SYLLABI);
};

export const getCourseUnitTitles = (code: string): string[] => {
    const units = getUnitsByCode(code);
    return units.map(unit => unit.title);
};
