-- Connect to database "postgres" as a superuser (often postgres).
-- Then create role root if needed, and these three databases.

-- CREATE ROLE root WITH LOGIN SUPERUSER PASSWORD 'Amit@8707';

CREATE DATABASE skillsync_auth;
CREATE DATABASE skillsync_matching;
CREATE DATABASE skillsync_ai;

GRANT ALL PRIVILEGES ON DATABASE skillsync_auth TO root;
GRANT ALL PRIVILEGES ON DATABASE skillsync_matching TO root;
GRANT ALL PRIVILEGES ON DATABASE skillsync_ai TO root;
