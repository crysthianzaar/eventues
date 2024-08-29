from datetime import datetime
from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String


class PaymentModel(Base):
    __tablename__ = 'payments'
    id = Column(Integer, primary_key=True)
    event_id = Column(Integer, ForeignKey('events.id'), nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    mercado_pago_payment_id = Column(String, nullable=False)
    status = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.now())
