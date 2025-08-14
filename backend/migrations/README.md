Use Alembic via Flask-Migrate:

- Initialize: `flask db init`
- Generate migration: `flask db migrate -m "init"`
- Apply: `flask db upgrade`