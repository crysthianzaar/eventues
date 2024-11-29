# src/models/ticket_model.py

from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum
from datetime import datetime, date

# Enums for various fields
class TipoIngresso(str, Enum):
    SIMPLES = 'Simples'
    LOTES = 'Lotes'
    GRATUITO = 'Gratuito'

class TaxaServico(str, Enum):
    ABSORVER = 'absorver'
    REPASSAR = 'repassar'

class Visibilidade(str, Enum):
    PUBLICO = 'publico'
    PRIVADO = 'privado'

# Model for ViradaProximoLote
class ViradaProximoLote(BaseModel):
    data: Optional[str] = None
    quantidade: Optional[int] = None

    @classmethod
    def from_dict(cls, data: dict):
        return cls(
            data=data.get('data') if data.get('data') else None,
            quantidade=data.get('quantidade')
        )

    def to_dict(self):
        return {
            'data': self.data,
            'quantidade': self.quantidade
        }

# Model for Lote
class Lote(BaseModel):
    valor: float
    quantidade: int
    viradaProximoLote: ViradaProximoLote

    @classmethod
    def from_dict(cls, data: dict):
        return cls(
            valor=data.get('valor'),
            quantidade=data.get('quantidade'),
            viradaProximoLote=ViradaProximoLote.from_dict(data.get('viradaProximoLote'))
        )

    def to_dict(self):
        return {
            'valor': self.valor,
            'quantidade': self.quantidade,
            'viradaProximoLote': self.viradaProximoLote.to_dict()
        }

class Ingresso(BaseModel):
    id: Optional[str] = None  # Assuming 'id' might not be provided when creating a new ticket
    nome: str
    tipo: TipoIngresso
    valor: float
    lotes: Optional[List[Lote]] = None
    taxaServico: TaxaServico
    visibilidade: Visibilidade

    @classmethod
    def from_dict(cls, data: dict):
        lotes_data = data.get('lotes')
        lotes = [Lote.from_dict(lote) for lote in lotes_data] if lotes_data else None
        return cls(
            id=data.get('id'),
            nome=data.get('nome'),
            tipo=TipoIngresso(data.get('tipo')),
            valor=data.get('valor'),
            lotes=lotes,
            taxaServico=TaxaServico(data.get('taxaServico')),
            visibilidade=Visibilidade(data.get('visibilidade'))
        )

    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'tipo': self.tipo.value,
            'valor': self.valor,
            'lotes': [lote.to_dict() for lote in self.lotes] if self.lotes else None,
            'taxaServico': self.taxaServico.value,
            'visibilidade': self.visibilidade.value
        }
        totalIngressos: int
        fimVendas: datetime
        inicioVendas: datetime

        @classmethod
        def from_dict(cls, data: dict):
            lotes_data = data.get('lotes')
            lotes = [Lote.from_dict(lote) for lote in lotes_data] if lotes_data else None
            return cls(
                id=data.get('id'),
                nome=data.get('nome'),
                tipo=TipoIngresso(data.get('tipo')),
                valor=data.get('valor'),
                lotes=lotes,
                taxaServico=TaxaServico(data.get('taxaServico')),
                visibilidade=Visibilidade(data.get('visibilidade')),
                totalIngressos=data.get('totalIngressos'),
                fimVendas=datetime.strptime(data.get('fimVendas'), '%Y-%m-%dT%H:%M:%S'),
                inicioVendas=datetime.strptime(data.get('inicioVendas'), '%Y-%m-%dT%H:%M:%S')
            )

        def to_dict(self):
            return {
                'id': self.id,
                'nome': self.nome,
                'tipo': self.tipo.value,
                'valor': self.valor,
                'lotes': [lote.to_dict() for lote in self.lotes] if self.lotes else None,
                'taxaServico': self.taxaServico.value,
                'visibilidade': self.visibilidade.value,
                'totalIngressos': self.totalIngressos,
                'fimVendas': self.fimVendas.isoformat(),
                'inicioVendas': self.inicioVendas.isoformat()
            }