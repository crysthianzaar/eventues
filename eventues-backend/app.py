from chalice import Chalice
from src.api.user_api import user_api
from src.api.event_api import event_api

app = Chalice(app_name='eventues-backend')
app.register_blueprint(user_api)
app.register_blueprint(event_api)