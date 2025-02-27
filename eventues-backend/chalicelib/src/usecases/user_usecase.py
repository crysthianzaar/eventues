from chalicelib.src.repositories.user_repository import UserRepository
from chalicelib.src.models.user_model import UserModel

class UserUseCase:
    def __init__(self):
        self.user_repository = UserRepository()

    def create_user(self, user_data):
        user = UserModel(**user_data)
        return self.user_repository.add_user(user)

    def update_user(self, user_data):
        user = UserModel(**user_data)
        return self.user_repository.update_user(user)

    def get_user(self, user_id: str):
        return self.user_repository.find_user_by_id(user_id)
    
    def authenticate_or_create_user(self, user_data: dict) -> dict:
        try:
            existing_user = self.user_repository.find_user_by_id(user_data['id'])
            if existing_user:
                return {"message": "Usuário autenticado", "status": "OK"}
            
            self.create_user(user_data)
            return {"message": "Usuário cadastrado", "status": "OK"}
        except Exception as e:
            return {"error": f"An error occurred during authentication or creation of the user: {str(e)}"}