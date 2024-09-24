# src/repositories/event_repository.py

from uuid import uuid4
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.sql import text
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
from typing import List, Optional, Dict, Any


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
            event_check_query = text("""
                SELECT event_id FROM events WHERE event_id = :event_id
            """)
            event = self.session.execute(event_check_query, {'event_id': event_id}).fetchone()
            if not event:
                raise ValueError(f"Evento com ID {event_id} não encontrado.")

            # 1. Processar Categorias e Subcategorias
            for cat in category_and_values.get('categories', []):
                # Verifica se a categoria já existe pelo 'id' e 'event_id'
                category_check_query = text("""
                    SELECT id FROM categories WHERE id = :id AND event_id = :event_id
                """)
                category_exists = self.session.execute(category_check_query, {'id': cat['id'], 'event_id': event_id}).fetchone()

                if category_exists:
                    # Atualiza os detalhes da categoria existente
                    update_category_query = text("""
                        UPDATE categories SET name = :name, description = :description WHERE id = :id AND event_id = :event_id
                    """)
                    self.session.execute(update_category_query, {
                        'name': cat['name'],
                        'description': cat.get('description', ''),
                        'id': cat['id'],
                        'event_id': event_id
                    })
                else:
                    # Insere uma nova categoria
                    insert_category_query = text("""
                        INSERT INTO categories (id, event_id, name, description) 
                        VALUES (:id, :event_id, :name, :description)
                    """)
                    self.session.execute(insert_category_query, {
                        'id': cat['id'],
                        'event_id': event_id,
                        'name': cat['name'],
                        'description': cat.get('description', '')
                    })

                # Processa Subcategorias
                for subcat in cat.get('subcategories', []):
                    # Verifica se a subcategoria já existe pelo 'id' e 'category_id'
                    subcategory_check_query = text("""
                        SELECT id FROM subcategories WHERE id = :id AND category_id = :category_id
                    """)
                    subcategory_exists = self.session.execute(subcategory_check_query, {'id': subcat['id'], 'category_id': cat['id']}).fetchone()

                    if subcategory_exists:
                        # Atualiza os detalhes da subcategoria existente
                        update_subcategory_query = text("""
                            UPDATE subcategories SET name = :name, description = :description WHERE id = :id AND category_id = :category_id
                        """)
                        self.session.execute(update_subcategory_query, {
                            'name': subcat['name'],
                            'description': subcat.get('description', ''),
                            'id': subcat['id'],
                            'category_id': cat['id']
                        })
                    else:
                        # Insere uma nova subcategoria
                        insert_subcategory_query = text("""
                            INSERT INTO subcategories (id, name, description, category_id) 
                            VALUES (:id, :name, :description, :category_id)
                        """)
                        self.session.execute(insert_subcategory_query, {
                            'id': subcat['id'],
                            'name': subcat['name'],
                            'description': subcat.get('description', ''),
                            'category_id': cat['id']
                        })

            # 2. Processar Configurações de Preço
            for price_config in category_and_values.get('price_configurations', []):
                # Verifica se a configuração de preço já existe pelo 'id' e 'event_id'
                price_config_check_query = text("""
                    SELECT id FROM price_configurations WHERE id = :id AND event_id = :event_id
                """)
                price_config_exists = self.session.execute(price_config_check_query, {'id': price_config['id'], 'event_id': event_id}).fetchone()

                if price_config_exists:
                    # Atualiza os detalhes da configuração existente
                    update_price_config_query = text("""
                        UPDATE price_configurations 
                        SET name = :name, type = :type, applies_to = :applies_to, price = :price 
                        WHERE id = :id AND event_id = :event_id
                    """)
                    self.session.execute(update_price_config_query, {
                        'name': price_config['name'],
                        'type': price_config['type'],
                        'applies_to': price_config['applies_to'],
                        'price': price_config.get('price'),
                        'id': price_config['id'],
                        'event_id': event_id
                    })
                else:
                    # Insere uma nova configuração de preço
                    insert_price_config_query = text("""
                        INSERT INTO price_configurations (id, event_id, name, type, applies_to, price) 
                        VALUES (:id, :event_id, :name, :type, :applies_to, :price)
                    """)
                    self.session.execute(insert_price_config_query, {
                        'id': price_config['id'],
                        'event_id': event_id,
                        'name': price_config['name'],
                        'type': price_config['type'],
                        'applies_to': price_config['applies_to'],
                        'price': price_config.get('price')
                    })

                # Limpar associações anteriores e inserir novas associações
                if price_config['applies_to'] == 'categoria':
                    # Remove associações antigas
                    self.session.execute(text("""
                        DELETE FROM price_configuration_categories WHERE price_configuration_id = :price_configuration_id
                    """), {'price_configuration_id': price_config['id']})

                    # Inserir novas associações
                    for cat_id in price_config.get('categories', []):
                        insert_category_assoc_query = text("""
                            INSERT INTO price_configuration_categories (price_configuration_id, category_id) 
                            VALUES (:price_configuration_id, :category_id)
                        """)
                        self.session.execute(insert_category_assoc_query, {
                            'price_configuration_id': price_config['id'],
                            'category_id': cat_id
                        })
                elif price_config['applies_to'] == 'subcategoria':
                    # Remove associações antigas
                    self.session.execute(text("""
                        DELETE FROM price_configuration_subcategories WHERE price_configuration_id = :price_configuration_id
                    """), {'price_configuration_id': price_config['id']})

                    # Inserir novas associações
                    for subcat_id in price_config.get('subcategories', []):
                        insert_subcategory_assoc_query = text("""
                            INSERT INTO price_configuration_subcategories (price_configuration_id, subcategory_id) 
                            VALUES (:price_configuration_id, :subcategory_id)
                        """)
                        self.session.execute(insert_subcategory_assoc_query, {
                            'price_configuration_id': price_config['id'],
                            'subcategory_id': subcat_id
                        })

                # 3. Processar Configurações de Lote (Batch Configs)
                if price_config['type'] == 'batch':
                    # Remove configurações de lote existentes para esta configuração de preço
                    self.session.execute(text("""
                        DELETE FROM batch_configs WHERE price_configuration_id = :price_configuration_id
                    """), {'price_configuration_id': price_config['id']})

                    # Adiciona novas configurações de lote
                    for batch in price_config.get('batch_configs', []):
                        insert_batch_config_query = text("""
                            INSERT INTO batch_configs (id, name, type, start_date, end_date, start_quantity, end_quantity, price, price_configuration_id) 
                            VALUES (:id, :name, :type, :start_date, :end_date, :start_quantity, :end_quantity, :price, :price_configuration_id)
                        """)
                        self.session.execute(insert_batch_config_query, {
                            'id': batch['id'],
                            'name': batch['name'],
                            'type': batch['type'],
                            'start_date': batch.get('start_date'),
                            'end_date': batch.get('end_date'),
                            'start_quantity': batch.get('start_quantity'),
                            'end_quantity': batch.get('end_quantity'),
                            'price': batch['price'],
                            'price_configuration_id': price_config['id']
                        })

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
            # Primeira query: categorias e subcategorias
            category_query = text("""
                SELECT
                    c.id as category_id,
                    c.name as category_name,
                    c.description as category_description,
                    s.id as subcategory_id,
                    s.name as subcategory_name,
                    s.description as subcategory_description
                FROM categories c
                LEFT JOIN subcategories s ON s.category_id = c.id
                WHERE c.event_id = :event_id
            """)

            category_result = self.session.execute(category_query, {'event_id': event_id}).mappings().fetchall()

            if not category_result:
                return {"categories": [], "price_configurations": []}

            categories = {}

            for row in category_result:
                # Processar categorias
                category_id = row['category_id']
                if category_id not in categories:
                    categories[category_id] = {
                        "id": category_id,
                        "name": row['category_name'],
                        "description": row['category_description'],
                        "subcategories": []
                    }

                # Processar subcategorias
                if row['subcategory_id']:
                    categories[category_id]["subcategories"].append({
                        "id": row['subcategory_id'],
                        "name": row['subcategory_name'],
                        "description": row['subcategory_description'],
                        "category_id": category_id
                    })

            # Segunda query: configurações de preço e suas associações
            price_config_query = text("""
                SELECT
                    pc.id as price_config_id,
                    pc.name as price_config_name,
                    pc.type as price_config_type,
                    pc.applies_to as price_config_applies_to,
                    pc.price as price_config_price
                FROM price_configurations pc
                WHERE pc.event_id = :event_id
            """)

            price_config_result = self.session.execute(price_config_query, {'event_id': event_id}).mappings().fetchall()

            price_configurations = {}

            for row in price_config_result:
                price_config_id = row['price_config_id']
                if price_config_id not in price_configurations:
                    price_configurations[price_config_id] = {
                        "id": price_config_id,
                        "name": row['price_config_name'],
                        "type": row['price_config_type'].lower(),
                        "applies_to": row['price_config_applies_to'].lower(),
                        "price": row['price_config_price'],
                        "categories": [],  # Inicializa a lista de categorias
                        "subcategories": [],  # Inicializa a lista de subcategorias
                        "batch_configs": []  # Inicializa a lista de batch_configs para tipo "batch"
                    }

            # Terceira query: categorias associadas às configurações de preço
            category_assoc_query = text("""
                SELECT
                    pcc.price_configuration_id,
                    c.id as category_id
                FROM price_configuration_categories pcc
                JOIN categories c ON c.id = pcc.category_id
                WHERE c.event_id = :event_id
            """)

            category_assoc_result = self.session.execute(category_assoc_query, {'event_id': event_id}).mappings().fetchall()

            for row in category_assoc_result:
                price_config_id = row['price_configuration_id']
                if price_config_id in price_configurations:
                    price_configurations[price_config_id]["categories"].append(row['category_id'])

            # Quarta query: subcategorias associadas às configurações de preço
            subcategory_assoc_query = text("""
                SELECT
                    pcs.price_configuration_id,
                    s.id as subcategory_id
                FROM price_configuration_subcategories pcs
                JOIN subcategories s ON s.id = pcs.subcategory_id
                WHERE s.category_id IN (
                    SELECT id FROM categories WHERE event_id = :event_id
                )
            """)

            subcategory_assoc_result = self.session.execute(subcategory_assoc_query, {'event_id': event_id}).mappings().fetchall()

            for row in subcategory_assoc_result:
                price_config_id = row['price_configuration_id']
                if price_config_id in price_configurations:
                    price_configurations[price_config_id]["subcategories"].append(row['subcategory_id'])

            # Quinta query: configurações de lote (batch_configs) associadas às configurações de preço
            batch_config_query = text("""
                SELECT
                    b.id as batch_id,
                    b.name as batch_name,
                    b.type as batch_type,
                    b.start_date as batch_start_date,
                    b.end_date as batch_end_date,
                    b.start_quantity as batch_start_quantity,
                    b.end_quantity as batch_end_quantity,
                    b.price as batch_price,
                    b.price_configuration_id
                FROM batch_configs b
                WHERE b.price_configuration_id IN (
                    SELECT id FROM price_configurations WHERE event_id = :event_id
                )
            """)

            batch_config_result = self.session.execute(batch_config_query, {'event_id': event_id}).mappings().fetchall()

            for row in batch_config_result:
                price_config_id = row['price_configuration_id']
                if price_config_id in price_configurations and price_configurations[price_config_id]['type'] == 'batch':
                    price_configurations[price_config_id]["batch_configs"].append({
                        "id": row['batch_id'],
                        "name": row['batch_name'],
                        "type": row['batch_type'].lower(),
                        "start_date": row['batch_start_date'].isoformat() if row['batch_start_date'] else None,
                        "end_date": row['batch_end_date'].isoformat() if row['batch_end_date'] else None,
                        "start_quantity": row['batch_start_quantity'],
                        "end_quantity": row['batch_end_quantity'],
                        "price": row['batch_price']
                    })

            return {
                "categories": list(categories.values()),
                "price_configurations": list(price_configurations.values())
            }

        except SQLAlchemyError as e:
            # Log do erro, se necessário
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
