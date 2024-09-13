import base64
import boto3
from botocore.exceptions import NoCredentialsError
import uuid  # Para gerar IDs únicos para os arquivos

class S3Service:
    def __init__(self, bucket_name: str):
        self.bucket_name = bucket_name
        self.s3 = boto3.client('s3')

    def list_files_for_event(self, event_id: str) -> list:
        try:
            response = self.s3.list_objects_v2(
                Bucket=self.bucket_name,
                Prefix=f"{event_id}/"
            )

            if 'Contents' not in response:
                return []

            files = []
            for obj in response['Contents']:
                file_url = self.generate_file_url(obj['Key'])
                file_name = obj['Key'].split('/')[-1]
                file_name = file_name.split('-')[-1]
                files.append({
                    "file_name": file_name,
                    "s3_key": obj['Key'],
                    "url": file_url,
                    "size": obj['Size']
                })

            return files

        except NoCredentialsError:
            raise Exception("Credenciais AWS inválidas ou ausentes.")
        except Exception as e:
            raise Exception(f"Erro ao listar arquivos do evento {event_id}: {str(e)}")

    def upload_file_from_payload(self, file: dict, event_id: str) -> list:
        uploaded_files = []
        try:
            content_type, base64_data = file['file'].split(';base64,')
            file_data = base64.b64decode(base64_data)
            key = f"{event_id}/{uuid.uuid4()}-{file['title'].replace(' ', '_')}"

            self.s3.put_object(
                Bucket=self.bucket_name,
                Key=key,
                Body=file_data,
                ContentType=content_type.split(':')[1]
            )

            # Gera a URL pública do arquivo
            file_url = self.generate_file_url(key)

            # Adiciona as informações do arquivo ao resultado
            uploaded_files.append({
                "file_name": file['title'],
                "s3_key": key,
                "url": file_url,
                "content_type": content_type.split(':')[1]
            })

        except NoCredentialsError:
            raise Exception("Credenciais AWS inválidas ou ausentes.")

        return uploaded_files

    def generate_file_url(self, key: str) -> str:
        return f"https://{self.bucket_name}.s3.amazonaws.com/{key}"

    def delete_file(self, s3_key: str):
        try:
            self.s3.delete_object(Bucket=self.bucket_name, Key=s3_key)
        except NoCredentialsError:
            raise Exception("Credenciais AWS inválidas ou ausentes.")
        except Exception as e:
            raise Exception(f"Erro ao deletar arquivo do S3: {str(e)}")
