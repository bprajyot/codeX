from flask import Blueprint, request, jsonify
from ..extensions import db
from ..models import Problem, TestCase

bp = Blueprint("problems", __name__)


@bp.get("")
def list_problems():
	q = db.session.query(Problem).filter_by(is_active=True)
	difficulty = request.args.get("difficulty")
	if difficulty:
		q = q.filter_by(difficulty=difficulty)
	items = q.order_by(Problem.id.desc()).limit(100).all()
	return jsonify([
		{"id": p.id, "slug": p.slug, "title": p.title, "difficulty": p.difficulty}
		for p in items
	])


@bp.get("/<slug>")
def get_problem(slug: str):
	p = db.session.query(Problem).filter_by(slug=slug, is_active=True).first_or_404()
	public_cases = db.session.query(TestCase).filter_by(problem_id=p.id, is_public=True).all()
	return jsonify({
		"id": p.id,
		"slug": p.slug,
		"title": p.title,
		"difficulty": p.difficulty,
		"description": p.description,
		"public_test_cases": [{"input": c.input, "expected_output": c.expected_output} for c in public_cases],
	})