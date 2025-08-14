from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..extensions import db
from ..models import Submission, Problem
from ..services.executor_client import submit_execution
from ..services.firebase_service import firebase_service

bp = Blueprint("submissions", __name__)


@bp.post("")
@jwt_required()
def create_submission():
	data = request.get_json() or {}
	problem_id = data.get("problem_id")
	language = data.get("language")
	code = data.get("code")
	stdin = data.get("stdin", "")
	if not problem_id or not language or not code:
		return jsonify({"error": {"message": "problem_id, language, code required"}}), 400
	# ensure problem exists
	_ = db.session.get(Problem, problem_id) or (
		None if True else None
	)
	if _ is None:
		return jsonify({"error": {"message": "invalid problem"}}), 400
	user_id = int(get_jwt_identity())
	sub = Submission(user_id=user_id, problem_id=problem_id, language=language, status="queued")
	db.session.add(sub)
	db.session.commit()

	firebase_key = f"{sub.id}"
	firebase_service.write_submission(firebase_key, {
		"user_id": user_id,
		"problem_id": problem_id,
		"language": language,
		"code": code,
		"status": "queued",
	})
	sub.firebase_key = firebase_key
	db.session.commit()

	# Trigger execution (synchronously for MVP)
	result = submit_execution(language=language, code=code, stdin=stdin)
	status = "passed" if result.get("passed", False) else "failed"
	sub.status = status
	sub.exec_time_ms = int(result.get("time_ms") or 0)
	sub.memory_kb = int(result.get("memory_kb") or 0)
	db.session.commit()

	firebase_service.write_submission(firebase_key, {
		"status": status,
		"result": result,
	})

	return jsonify({
		"id": sub.id,
		"status": sub.status,
		"exec_time_ms": sub.exec_time_ms,
		"memory_kb": sub.memory_kb,
	})


@bp.get("/<int:submission_id>")
@jwt_required()
def get_submission(submission_id: int):
	sub = db.session.get(Submission, submission_id)
	if sub is None:
		return jsonify({"error": {"message": "not found"}}), 404
	return jsonify({
		"id": sub.id,
		"status": sub.status,
		"exec_time_ms": sub.exec_time_ms,
		"memory_kb": sub.memory_kb,
	})