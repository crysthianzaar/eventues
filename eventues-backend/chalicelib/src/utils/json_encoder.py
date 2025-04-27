import json
from datetime import datetime
from google.cloud.firestore_v1 import DocumentSnapshot
from google.api_core.datetime_helpers import DatetimeWithNanoseconds

class FirestoreJSONEncoder(json.JSONEncoder):
    """
    Encoder JSON personalizado para lidar com tipos específicos do Firestore
    como DatetimeWithNanoseconds e DocumentSnapshot.
    """
    def default(self, obj):
        if isinstance(obj, datetime) or isinstance(obj, DatetimeWithNanoseconds):
            return obj.isoformat()
        elif isinstance(obj, DocumentSnapshot):
            return obj.to_dict()
        return super().default(obj)

def firestore_json_dumps(obj):
    """Função de conveniência para serializar objetos que contêm dados do Firestore."""
    return json.dumps(obj, cls=FirestoreJSONEncoder)
