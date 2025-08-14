from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from ..extensions import db
from ..models import User
from ..utils.passwords import hash_password, verify_password

bp = Blueprint("auth", __name__)


@bp.post("/register")
def register():
	data = request.get_json() or {}
	email = (data.get("email") or "").strip().lower()
	username = (data.get("username") or "").strip()
	password = data.get("password") or ""
	if not email or not username or not password:
		return jsonify({"error": {"message": "email, username, password required"}}), 400
	if db.session.query(User).filter_by(email=email).first() is not None:
		return jsonify({"error": {"message": "email already registered"}}), 400
	if db.session.query(User).filter_by(username=username).first() is not None:
		return jsonify({"error": {"message": "username taken"}}), 400
	user = User(email=email, username=username, password_hash=hash_password(password))
	db.session.add(user)
	db.session.commit()
	access = create_access_token(identity=str(user.id))
	return jsonify({"access_token": access, "user": {"id": user.id, "email": user.email, "username": user.username}})


@bp.post("/login")
def login():
	data = request.get_json() or {}
	email = (data.get("email") or "").strip().lower()
	password = data.get("password") or ""
	user = db.session.query(User).filter_by(email=email).first()
	if user is None or not verify_password(password, user.password_hash):
		return jsonify({"error": {"message": "invalid credentials"}}), 401
	access = create_access_token(identity=str(user.id))
	return jsonify({"access_token": access, "user": {"id": user.id, "email": user.email, "username": user.username}})


@bp.get("/me")
@jwt_required()
def me():
	user_id = int(get_jwt_identity())
	user = db.session.get(User, user_id)
	return jsonify({"id": user.id, "email": user.email, "username": user.username, "rating": user.rating})