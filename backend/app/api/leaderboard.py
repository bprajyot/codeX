from flask import Blueprint, jsonify
from ..extensions import db, redis_client
from ..models import User, LeaderboardSnapshot
from datetime import date

bp = Blueprint("leaderboard", __name__)


@bp.get("/top")
def top_users():
	cache_key = "leaderboard:top"
	cached = redis_client.client.get(cache_key)
	if cached:
		from json import loads
		return jsonify(loads(cached))
	users = db.session.query(User).order_by(User.rating.desc()).limit(50).all()
	payload = [{"id": u.id, "username": u.username, "rating": u.rating} for u in users]
	from json import dumps
	redis_client.client.setex(cache_key, 30, dumps(payload))
	return jsonify(payload)


@bp.get("/snapshot/today")
def today_snapshot():
	snap = db.session.query(LeaderboardSnapshot).filter_by(snapshot_date=date.today()).first()
	if snap:
		return jsonify(snap.json_blob)
	return jsonify({"message": "no snapshot"}), 404