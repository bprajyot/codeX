from flask import jsonify
from werkzeug.exceptions import HTTPException


def register_error_handlers(app):
	@app.errorhandler(HTTPException)
	def handle_http_exception(e: HTTPException):
		response = jsonify({
			"error": {
				"type": e.__class__.__name__,
				"message": e.description,
				"status": e.code,
			}
		})
		return response, e.code

	@app.errorhandler(Exception)
	def handle_exception(e: Exception):
		response = jsonify({
			"error": {
				"type": e.__class__.__name__,
				"message": str(e),
				"status": 500,
			}
		})
		return response, 500