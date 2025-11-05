-- Create database
CREATE DATABASE IF NOT EXISTS roboarchive;
USE roboarchive;

-- Members table
CREATE TABLE members (
    member_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('mechanical', 'electrical', 'coding', 'design', 'strategy'),
    join_year INT NOT NULL,
    graduation_year INT,
    is_active BOOLEAN DEFAULT TRUE,
    privilege_level ENUM('admin', 'leader', 'member') DEFAULT 'member',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tasks table
CREATE TABLE tasks (
    task_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
    assigned_to INT,
    created_by INT,
    deadline DATE,
    completed_at TIMESTAMP NULL,
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_to) REFERENCES members(member_id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES members(member_id) ON DELETE SET NULL
);

-- Articles table
CREATE TABLE articles (
    article_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    author_id INT,
    type ENUM('tutorial', 'strategy', 'documentation'),
    category VARCHAR(100),
    competition_year INT,
    view_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES members(member_id) ON DELETE SET NULL
);

-- Robots table
CREATE TABLE robots (
    robot_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    competition_year INT NOT NULL,
    team_lead_id INT,
    specifications TEXT,
    performance_notes TEXT,
    final_rank INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_lead_id) REFERENCES members(member_id) ON DELETE SET NULL
);

-- Media table
CREATE TABLE media (
    media_id INT AUTO_INCREMENT PRIMARY KEY,
    robot_id INT,
    article_id INT,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type ENUM('image', 'video', 'cad', 'pdf'),
    uploaded_by INT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (robot_id) REFERENCES robots(robot_id) ON DELETE CASCADE,
    FOREIGN KEY (article_id) REFERENCES articles(article_id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES members(member_id) ON DELETE SET NULL
);

-- Contributions table
CREATE TABLE contributions (
    contribution_id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT,
    contribution_type ENUM('article', 'task_completed', 'robot_project'),
    reference_id INT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(member_id) ON DELETE CASCADE
);

-- Create indexes for faster queries
CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX idx_articles_author ON articles(author_id);
CREATE INDEX idx_robots_year ON robots(competition_year);
CREATE INDEX idx_contributions_member ON contributions(member_id);
