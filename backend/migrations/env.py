from __future__ import with_statement
from alembic import context
from logging.config import fileConfig
from flask import current_app

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
	fileConfig(config.config_file_name)

# add your model's MetaData object here
# for 'autogenerate' support
target_metadata = current_app.extensions['migrate'].db.metadata

def run_migrations_online() -> None:
	connectable = current_app.extensions['migrate'].db.engine
	with connectable.connect() as connection:
		context.configure(
			connection=connection,
			target_metadata=target_metadata,
			compare_type=True,
		)
		with context.begin_transaction():
			context.run_migrations()

run_migrations_online()