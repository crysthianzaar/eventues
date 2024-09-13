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

    def upload_event_files(self, event_id, payload):
        s3 = S3Service('dev-event-files')
        try:
            upload_files = s3.upload_file_from_payload(payload, event_id)
            return upload_files
        except Exception as e:
            raise Exception(f"Error uploading file: {str(e)}")

    def get_event_files(self, event_id: str) -> list:
        s3 = S3Service('dev-event-files')
        try:
            files = s3.list_files_for_event(event_id)
            if not files:
                return []  # Retorna uma lista vazia se nenhum arquivo for encontrado
            return files
        except Exception as e:
            raise Exception(f"Error retrieving files: {str(e)}")
    
    def delete_event_file(self, event_id: str, s3_key: str):
        s3 = S3Service('dev-event-files')
        try:
            s3.delete_file(s3_key)
        except Exception as e:
            raise Exception(f"Erro ao deletar o arquivo: {str(e)}")
