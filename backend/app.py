from chalice import Chalice
from backend.src.api.v1.api_users import user_bp

app = Chalice(app_name='backend')

app.register_blueprint(user_bp)


@app.route('/')
def index():
    return {'message': 'Hello from Eventues!'}
