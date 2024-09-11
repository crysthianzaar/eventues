import boto3
from botocore.exceptions import NoCredentialsError


class S3Service:
    def __init__(self, bucket_name: str):
        self.bucket_name = bucket_name
        self.s3 = boto3.client('s3')

    def upload_file_bytes(self, file_data: bytes, key: str, content_type: str) -> str:
        """Faz o upload de um arquivo para o S3 a partir de bytes e retorna a URL."""
        try:
            self.s3.put_object(
                Bucket=self.bucket_name,
                Key=key,
                Body=file_data,
                ContentType=content_type
            )
            return self.generate_file_url(key)
        except NoCredentialsError:
            raise Exception("Credenciais AWS inválidas ou ausentes.")

    def generate_file_url(self, key: str) -> str:
        """Gera a URL pública de um arquivo armazenado no S3."""
        return f"https://{self.bucket_name}.s3.amazonaws.com/{key}"
