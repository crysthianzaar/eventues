from chalice import Chalice
from src.api.v1.users import user_bp

app = Chalice(app_name='backend')

app.register_blueprint(user_bp)


@app.route('/')
def index():
    return {'message': 'Hello from Eventues!'}
