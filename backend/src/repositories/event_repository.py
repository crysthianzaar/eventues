# src/repositories/event_repository.py

from uuid import uuid4
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import joinedload
from src.models.event_model import (
    AppliesTo,
    BatchConfig,
    BatchType,
    Category,
    EventDocuments,
    EventModel,
    EventPolicy,
    PriceConfiguration,
    PriceType,
    Subcategory
)
from typing import Optional, Dict, Any


class EventRepository:
    def __init__(self, session):
        self.session = session

    def create_event(self, event_data):
        event_data['event_id'] = uuid4()
        event_data['event_status'] = 'rascunho'
        new_event = EventModel(**event_data)
        self.session.add(new_event)
        self.session.commit()
        return new_event

    def create_category_and_values(self, event_id: str, category_and_values: Dict[str, Any]) -> Dict[str, str]:
        """
        Cria ou atualiza categorias, subcategorias e configurações de preço associadas a um evento específico.

        Args:
            event_id (str): ID do evento ao qual as categorias e configurações serão associadas.
            category_and_values (dict): Dados contendo categorias, subcategorias e configurações de preço.

        Returns:
            dict: Mensagem de sucesso.
        """
        try:
            # Verifica se o evento existe
            event = self.session.query(EventModel).filter_by(event_id=event_id).first()
            if not event:
                raise ValueError(f"Evento com ID {event_id} não encontrado.")

            # 1. Processar Categorias e Subcategorias
            for cat in category_and_values.get('categories', []):
                # Verifica se a categoria já existe pelo 'id' e 'event_id'
                category = self.session.query(Category).filter_by(id=cat['id'], event_id=event_id).first()
                if category:
                    # Atualiza os detalhes da categoria existente
                    category.name = cat['name']
                    category.description = cat.get('description', category.description)
                else:
                    # Cria uma nova categoria vinculada ao evento
                    category = Category(
                        id=cat['id'],
                        event_id=event_id,  # Vincula ao evento
                        name=cat['name'],
                        description=cat.get('description', '')
                    )
                    self.session.add(category)

                # Processa Subcategorias
                for subcat in cat.get('subcategories', []):
                    # Verifica se a subcategoria já existe pelo 'id' e 'category_id'
                    subcategory = self.session.query(Subcategory).filter_by(id=subcat['id'], category_id=cat['id']).first()
                    if subcategory:
                        # Atualiza os detalhes da subcategoria existente
                        subcategory.name = subcat['name']
                        subcategory.description = subcat.get('description', subcategory.description)
                        subcategory.category_id = cat['id']
                    else:
                        # Cria uma nova subcategoria vinculada à categoria
                        subcategory = Subcategory(
                            id=subcat['id'],
                            name=subcat['name'],
                            description=subcat.get('description', ''),
                            category_id=cat['id']
                        )
                        self.session.add(subcategory)

            # 2. Processar Configurações de Preço
            for price_config in category_and_values.get('price_configurations', []):
                # Verifica se a configuração de preço já existe pelo 'id' e 'event_id'
                config = self.session.query(PriceConfiguration).filter_by(id=price_config['id'], event_id=event_id).first()
                if config:
                    # Atualiza os detalhes da configuração existente
                    config.name = price_config['name']
                    config.type = PriceType(price_config['type'])
                    config.applies_to = AppliesTo(price_config['applies_to'])
                    config.price = price_config.get('price')

                    # Atualiza as associações com categorias ou subcategorias
                    if price_config['applies_to'] == 'categoria':
                        # Limpa associações existentes
                        config.categories = []
                        for cat_id in price_config.get('categories', []):
                            category = self.session.query(Category).filter_by(id=cat_id, event_id=event_id).first()
                            if category:
                                config.categories.append(category)
                    elif price_config['applies_to'] == 'subcategoria':
                        # Limpa associações existentes
                        config.subcategories = []
                        for subcat_id in price_config.get('subcategories', []):
                            subcategory = self.session.query(Subcategory).filter_by(id=subcat_id).first()
                            if subcategory and subcategory.category.event_id == event_id:
                                config.subcategories.append(subcategory)
                else:
                    # Cria uma nova configuração de preço vinculada ao evento
                    config = PriceConfiguration(
                        id=price_config['id'],
                        event_id=event_id,  # Vincula ao evento
                        name=price_config['name'],
                        type=PriceType(price_config['type']),
                        applies_to=AppliesTo(price_config['applies_to']),
                        price=price_config.get('price')
                    )
                    self.session.add(config)

                    # Associa categorias ou subcategorias
                    if price_config['applies_to'] == 'categoria':
                        for cat_id in price_config.get('categories', []):
                            category = self.session.query(Category).filter_by(id=cat_id, event_id=event_id).first()
                            if category:
                                config.categories.append(category)
                    elif price_config['applies_to'] == 'subcategoria':
                        for subcat_id in price_config.get('subcategories', []):
                            subcategory = self.session.query(Subcategory).filter_by(id=subcat_id).first()
                            if subcategory and subcategory.category.event_id == event_id:
                                config.subcategories.append(subcategory)

                # 3. Processar Configurações de Lote (Batch Configs)
                if price_config['type'] == 'batch':
                    # Remove configurações de lote existentes para esta configuração de preço
                    self.session.query(BatchConfig).filter_by(price_configuration_id=price_config['id']).delete()

                    # Adiciona novas configurações de lote
                    for batch in price_config.get('batch_configs', []):
                        batch_config = BatchConfig(
                            id=batch['id'],
                            name=batch['name'],
                            type=BatchType(batch['type']),
                            start_date=batch.get('start_date'),
                            end_date=batch.get('end_date'),
                            start_quantity=batch.get('start_quantity'),
                            end_quantity=batch.get('end_quantity'),
                            price=batch['price'],
                            price_configuration_id=price_config['id']
                        )
                        self.session.add(batch_config)

            # 4. Commit da Transação
            self.session.commit()
            return {"message": "Categorias e Configurações de Preço salvas com sucesso."}
        except SQLAlchemyError as e:
            self.session.rollback()
            raise e
        except ValueError as ve:
            self.session.rollback()
            raise ve

    def get_category_and_values_by_event_id(self, event_id: str) -> Optional[Dict[str, Any]]:
        """
        Recupera categorias, subcategorias e configurações de preço associadas a um evento específico.

        Args:
            event_id (str): ID do evento.

        Returns:
            dict ou None: Estrutura contendo categorias, subcategorias e configurações de preço, ou None se o evento não existir.
        """
        try:
            # Carrega o evento com relacionamentos
            event = self.session.query(EventModel).options(
                joinedload(EventModel.categories)
                .joinedload(Category.subcategories),
                joinedload(EventModel.price_configurations)
                .joinedload(PriceConfiguration.batch_configs)
            ).filter_by(event_id=event_id).first()

            if not event:
                return None

            # Estrutura para armazenar os dados
            result = {
                "categories": [],
                "price_configurations": []
            }

            # Processa Categorias e Subcategorias
            for category in event.categories:
                cat_dict = {
                    "id": category.id,
                    "name": category.name,
                    "description": category.description,
                    "subcategories": []
                }
                for subcat in category.subcategories:
                    subcat_dict = {
                        "id": subcat.id,
                        "name": subcat.name,
                        "description": subcat.description,
                        "category_id": subcat.category_id
                    }
                    cat_dict["subcategories"].append(subcat_dict)
                result["categories"].append(cat_dict)

            # Processa Configurações de Preço
            for price_config in event.price_configurations:
                pc_dict = {
                    "id": price_config.id,
                    "name": price_config.name,
                    "type": price_config.type.value,
                    "applies_to": price_config.applies_to.value,
                    "price": price_config.price,
                    "categories": [cat.id for cat in price_config.categories],
                    "subcategories": [subcat.id for subcat in price_config.subcategories],
                    "batch_configs": []
                }
                for batch in price_config.batch_configs:
                    batch_dict = {
                        "id": batch.id,
                        "name": batch.name,
                        "type": batch.type.value,
                        "start_date": batch.start_date.isoformat() if batch.start_date else None,
                        "end_date": batch.end_date.isoformat() if batch.end_date else None,
                        "start_quantity": batch.start_quantity,
                        "end_quantity": batch.end_quantity,
                        "price": batch.price
                    }
                    pc_dict["batch_configs"].append(batch_dict)
                result["price_configurations"].append(pc_dict)

            return result
        except SQLAlchemyError as e:
            raise e

    def get_events_by_user(self, user_id: str):
        return self.session.query(EventModel).filter_by(user_id=user_id).all()

    def get_event_by_id(self, event_id):
        event = self.session.query(EventModel).filter_by(event_id=event_id).first()
        return event.to_dict() if event else None

    def has_event_documents(self, event_id):
        return self.session.query(EventDocuments).filter_by(event_id=event_id).count() > 0
    def has_event_policies(self, event_id):
        return self.session.query(EventPolicy).filter_by(event_id=event_id).count() > 0

    def has_category_and_values(self, event_id):
        return False

    def has_event_form(self, event_id):
        return False

    def get_event_documents(self, event_id):
        return self.session.query(EventDocuments).filter_by(event_id=event_id).all()

    def create_event_document(self, event_id, document_data):
        document = {}
        document['document_id'] = uuid4()
        document['event_id'] = event_id
        document['s3_key'] = document_data['s3_key'].split('/')[-1]
        document['file_name'] = document_data['file_name'].split('/')[-1]
        document['url'] = document_data['url']
        new_document = EventDocuments(**document)
        self.session.add(new_document)
        self.session.commit()
        return new_document

    def delete_event_document(self, event_id, s3_key):
        document = self.session.query(EventDocuments).filter_by(event_id=event_id, s3_key=s3_key).first()
        self.session.delete(document)
        self.session.commit()
        return document

    def update_event_details(self, event_id, event_data):
        event = self.session.query(EventModel).filter_by(event_id=event_id).first()
        for key, value in event_data.items():
            setattr(event, key, value)
        self.session.commit()
        return event

    def get_event_policy(self, event_id: str):
        return self.session.query(EventPolicy).filter_by(event_id=event_id).first()

    def create_policy(self, event_id: str, policy_data: dict):
        policy_data['event_id'] = event_id
        new_policy = EventPolicy(**policy_data)
        self.session.add(new_policy)
        self.session.commit()
        return new_policy

    def update_policy(self, policy: EventPolicy):
        self.session.commit()
        return policy
