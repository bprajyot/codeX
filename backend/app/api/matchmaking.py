from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..extensions import redis_client, db
from ..models import Match, Problem

bp = Blueprint("matchmaking", __name__)

QUEUE_KEY = "matchmaking:queue"


@bp.post("/enqueue")
@jwt_required()
def enqueue():
	user_id = int(get_jwt_identity())
	redis_client.client.lpush(QUEUE_KEY, user_id)
	return jsonify({"status": "enqueued"})


@bp.post("/dequeue")
@jwt_required()
def dequeue():
	user_id = int(get_jwt_identity())
	# naive: pop 2 users and create a match
	popped = []
	for _ in range(2):
		val = redis_client.client.rpop(QUEUE_KEY)
		if val is not None:
			popped.append(int(val))
	if len(popped) < 2:
		# push back if not enough players
		for v in popped:
			redis_client.client.rpush(QUEUE_KEY, v)
		return jsonify({"message": "waiting for opponent"}), 202

	problem = db.session.query(Problem).order_by(Problem.id.desc()).first()
	if problem is None:
		return jsonify({"error": {"message": "no problems available"}}), 400

	match = Match(problem_id=problem.id, player_one_id=popped[0], player_two_id=popped[1], status="active")
	db.session.add(match)
	db.session.commit()
	return jsonify({"match_id": match.id, "problem_id": problem.id})