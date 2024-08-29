from src.repositories.event_repository import EventRepository


class EventService:
    def __init__(self, event_repository: EventRepository):
        self.event_repository = event_repository

    def create_event(self, event_data):
        return self.event_repository.create_event(event_data)
