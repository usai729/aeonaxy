CREATE TABLE "user" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(70),
  email VARCHAR(30),
  password TEXT,
  profile_picture BYTEA,
  role VARCHAR(20) DEFAULT 'customer'
);

CREATE TABLE "courses" (
  id SERIAL PRIMARY KEY,
  course_title VARCHAR(150),
  course_desc VARCHAR(700),
  category VARCHAR(30),
  skills VARCHAR(40)[], 
  level VARCHAR(15) DEFAULT 'intermediate',
  popularity INT DEFAULT 0
);

CREATE TABLE enrollments (
  id SERIAL PRIMARY KEY,
  "user" INT,
  course INT,
  FOREIGN KEY("user") REFERENCES "user"(id),
  FOREIGN KEY(course) REFERENCES courses(id)
);

CREATE TABLE expiring_tokens (
  id SERIAL PRIMARY KEY,
  token TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE resetTokens (
  id SERIAL PRIMARY KEY,
  token TEXT,
  expiresAt TIMESTAMP
);

ALTER TABLE "user" ADD COLUMN confirmed BOOLEAN DEFAULT false;