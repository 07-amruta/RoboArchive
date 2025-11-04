-- Create database
CREATE DATABASE roboarchive;

-- Connect to database
\c roboarchive;

-- Members table
CREATE TABLE members (
    member_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) CHECK (role IN ('mechanical', 'electrical', 'coding', 'design', 'strategy')),
    join_year INTEGER NOT NULL,
    graduation_year INTEGER,
    is_active BOOLEAN DEFAULT true,
    privilege_level VARCHAR(20) CHECK (privilege_level IN ('admin', 'leader', 'member')) DEFAULT 'member',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table
CREATE TABLE tasks (
    task_id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(20) CHECK (status IN ('pending', 'in_progress', 'completed')) DEFAULT 'pending',
    assigned_to INTEGER REFERENCES members(member_id) ON DELETE SET NULL,
    created_by INTEGER REFERENCES members(member_id) ON DELETE SET NULL,
    deadline DATE,
    completed_at TIMESTAMP,
    priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Articles table
CREATE TABLE articles (
    article_id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    author_id INTEGER REFERENCES members(member_id) ON DELETE SET NULL,
    type VARCHAR(50) CHECK (type IN ('tutorial', 'strategy', 'documentation')),
    category VARCHAR(100),
    competition_year INTEGER,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Robots table
CREATE TABLE robots (
    robot_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    competition_year INTEGER NOT NULL,
    team_lead_id INTEGER REFERENCES members(member_id) ON DELETE SET NULL,
    specifications TEXT,
    performance_notes TEXT,
    final_rank INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Media table
CREATE TABLE media (
    media_id SERIAL PRIMARY KEY,
    robot_id INTEGER REFERENCES robots(robot_id) ON DELETE CASCADE,
    article_id INTEGER REFERENCES articles(article_id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(20) CHECK (file_type IN ('image', 'video', 'cad', 'pdf')),
    uploaded_by INTEGER REFERENCES members(member_id) ON DELETE SET NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contributions table
CREATE TABLE contributions (
    contribution_id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES members(member_id) ON DELETE CASCADE,
    contribution_type VARCHAR(50) CHECK (contribution_type IN ('article', 'task_completed', 'robot_project')),
    reference_id INTEGER NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX idx_articles_author ON articles(author_id);
CREATE INDEX idx_robots_year ON robots(competition_year);
CREATE INDEX idx_contributions_member ON contributions(member_id);
