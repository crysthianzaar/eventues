from chalice import Chalice
from chalicelib.src.api.user_api import user_api
from chalicelib.src.api.event_api import event_api
from chalicelib.src.api.public_api import public_api
from chalicelib.src.api.payment_api import payment_api
from chalicelib.src.api.coupon_api import coupon_api

app = Chalice(app_name='eventues-backend')

app.register_blueprint(user_api)
app.register_blueprint(event_api)
app.register_blueprint(public_api)
app.register_blueprint(payment_api)
app.register_blueprint(coupon_api)
