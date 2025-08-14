from flask import Flask
from .extensions import db
from .models import Problem, TestCase


def init_cli(app: Flask):
	@app.cli.command("seed")
	def seed():
		if db.session.query(Problem).count() > 0:
			print("Already seeded")
			return
		p = Problem(slug="two-sum", title="Two Sum", difficulty="easy", description="<p>Given ...</p>")
		db.session.add(p)
		db.session.flush()
		db.session.add_all([
			TestCase(problem_id=p.id, input="3\n1 2 3\n3\n", expected_output="0 2\n", is_public=True),
		])
		db.session.commit()
		print("Seeded")