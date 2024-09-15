from src.repositories.event_repository import EventRepository
from src.services.aws.s3_service import S3Service


class EventService:
    def __init__(self, event_repository: EventRepository):
        self.event_repository = event_repository

    def create_event(self, event_data):
        return self.event_repository.create_event(event_data)
    
    def get_events_by_user(self, user_id: str):
        return self.event_repository.get_events_by_user(user_id)

    def get_event_by_id(self, event_id):
            return self.event_repository.get_event_by_id(event_id)

    def upload_event_file(self, event_id, payload):
        s3 = S3Service('dev-event-files')
        try:
            upload_file = s3.upload_file_from_payload(payload, event_id)
            self.create_event_document(event_id, upload_file[-1])
            return upload_file
        except Exception as e:
            raise Exception(f"Error uploading file: {str(e)}")

    def get_event_documents(self, event_id: str) -> list:
        documents = self.event_repository.get_event_documents(event_id)
        return [doc.to_dict() for doc in documents]
    
    def delete_event_file(self, event_id: str, s3_key: str):
        s3 = S3Service('dev-event-files')
        try:
            s3.delete_file(s3_key)
            self.delete_event_document(event_id, s3_key)
        except Exception as e:
            raise Exception(f"Erro ao deletar o arquivo: {str(e)}")

    def create_event_document(self, event_id: str, document_data: dict):
        return self.event_repository.create_event_document(event_id, document_data)

    def delete_event_document(self, event_id: str, s3_key: str):
        return self.event_repository.delete_event_document(event_id, s3_key)

    def update_event_details(self, event_id, event_data):
        return self.event_repository.update_event_details(event_id, event_data)

    def create_or_update_policy(self, event_id: str, policy_data: dict):
        existing_policy = self.event_repository.get_event_policy(event_id)

        if existing_policy:
            for key, value in policy_data.items():
                setattr(existing_policy, key, value)
            return self.event_repository.update_policy(existing_policy)
        else:
            new_policy = self.event_repository.create_policy(event_id, policy_data)
            return new_policy

    def get_event_policy(self, event_id: str):
        return self.event_repository.get_event_policy(event_id)
