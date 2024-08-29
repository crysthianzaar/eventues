from chalice import Chalice
from src.api.v1.api_users import user_bp
from src.api.v1.api_event import event_bp

app = Chalice(app_name='backend')

app.register_blueprint(user_bp)
app.register_blueprint(event_bp)


@app.route('/')
def index():
    return {'message': 'Hello from Eventues!'}
