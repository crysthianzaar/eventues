import os
import json
from typing import Dict, Any
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class EnvironmentConfig:
    """Environment-specific configuration management"""
    
    def __init__(self):
        self.environment = os.getenv('ENVIRONMENT', 'sandbox').lower()
        self._validate_environment()
    
    def _validate_environment(self):
        """Validate that environment is either sandbox or production"""
        if self.environment not in ['sandbox', 'production']:
            raise ValueError(f"Invalid environment: {self.environment}. Must be 'sandbox' or 'production'")
    
    @property
    def is_production(self) -> bool:
        """Check if current environment is production"""
        return self.environment == 'production'
    
    @property
    def is_sandbox(self) -> bool:
        """Check if current environment is sandbox"""
        return self.environment == 'sandbox'
    
    def get_firebase_config(self) -> Dict[str, Any]:
        """Get Firebase configuration for current environment"""
        firebase_credentials_json = os.getenv("FIREBASE_CREDENTIALS_JSON")
        
        if not firebase_credentials_json:
            raise ValueError(f"FIREBASE_CREDENTIALS_JSON not defined for {self.environment} environment")
        
        # Parse and fix private_key formatting
        firebase_credentials_dict = json.loads(firebase_credentials_json)
        firebase_credentials_dict["private_key"] = firebase_credentials_dict["private_key"].replace("\\n", "\n")
        
        # Set storage bucket based on environment
        if self.is_production:
            storage_bucket = firebase_credentials_dict.get('project_id', 'eventues-auth') + '.appspot.com'
        else:
            storage_bucket = firebase_credentials_dict.get('project_id', 'eventues-auth-sandbox') + '.appspot.com'
        
        return {
            'credentials': firebase_credentials_dict,
            'storage_bucket': storage_bucket
        }
    
    def get_asaas_config(self) -> Dict[str, str]:
        """Get Asaas configuration for current environment"""
        api_key = os.getenv("ASAAS_API_KEY")
        
        if not api_key:
            raise ValueError(f"ASAAS_API_KEY not defined for {self.environment} environment")
        
        # Set API URL based on environment
        if self.is_production:
            api_url = "https://www.asaas.com/api/v3"
        else:
            api_url = "https://sandbox.asaas.com/api/v3"
        
        return {
            'api_key': api_key,
            'api_url': api_url
        }
    
    def get_cors_origins(self) -> list:
        """Get allowed CORS origins for current environment"""
        if self.is_production:
            return [
                'https://www.eventues.com',
                'https://eventues.com'
            ]
        else:
            return [
                'http://localhost:3000',
                'https://eventues-frontend-sandbox.vercel.app',
                'https://eventues-frontend-git-develop.vercel.app'
            ]

# Global environment instance
env_config = EnvironmentConfig()
