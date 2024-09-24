from src.repositories.event_repository import EventRepository
from src.services.aws.s3_service import S3Service


class EventService:
    def __init__(self, event_repository: EventRepository):
        self.event_repository = event_repository

    def create_event(self, event_data):
        return self.event_repository.create_event(event_data)

    def get_category_and_values_by_event_id(self, event_id: str):
        return self.event_repository.get_category_and_values_by_event_id(event_id)

    def create_category_and_values(self, event_id: str, category_and_values: dict):
        return self.event_repository.create_category_and_values(event_id, category_and_values)

    def get_category_and_values(self, event_id: str):
        return self.event_repository.get_category_and_values(event_id)

    def get_events_by_user(self, user_id: str):
        return self.event_repository.get_events_by_user(user_id)

    def get_event_by_id(self, event_id):
        event = self.event_repository.get_event_by_id(event_id)
        if not event:
            return None
        
        details_filled = all([
            event["name"], event["category"], event["start_date"], event["start_time"], 
            event["end_date"], event["end_time"], event["event_type"], event["event_category"], 
            event["state"], event["city"], event["address"], event["organization_name"], event["organization_contact"]
        ])
        
        documents_exist = self.event_repository.has_event_documents(event_id)
        policies_exist = self.event_repository.has_event_policies(event_id)
        has_category_and_values = self.event_repository.has_category_and_values(event_id)
        form = self.event_repository.has_event_form(event_id)
        event_ready = all([details_filled, documents_exist, policies_exist, has_category_and_values, form])

        stepper = {
            "inf_basic": True,
            "event_details": details_filled,
            "documents": documents_exist,
            "policies": policies_exist,
            "category_and_values": has_category_and_values,
            "form": form,
            "event_ready": event_ready
        }

        # Incluir o stepper no dicionário de retorno do evento
        event["stepper"] = stepper
        return event

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
