from chalice import Chalice, CORSConfig
from chalicelib.src.api.user_api import user_api
from chalicelib.src.api.event_api import event_api
from chalicelib.src.api.public_api import public_api
from chalicelib.src.api.payment_api import payment_api
from chalicelib.src.api.coupon_api import coupon_api
from chalicelib.src.config.environment import env_config

# Configure CORS based on environment
cors_config = CORSConfig(
    allow_origin=','.join(env_config.get_cors_origins()),
    allow_headers=['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key', 'X-Amz-Security-Token'],
    max_age=600,
    expose_headers=['X-Custom-Header'],
    allow_credentials=True
)

app = Chalice(app_name='eventues-backend')
app.api.cors = cors_config

app.register_blueprint(user_api)
app.register_blueprint(event_api)
app.register_blueprint(public_api)
app.register_blueprint(payment_api)
app.register_blueprint(coupon_api)
