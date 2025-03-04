# src/models/ticket_model.py

from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum

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
            data=data.get('data'),
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
            viradaProximoLote=ViradaProximoLote.from_dict(data.get('viradaProximoLote', {}))
        )

    def to_dict(self):
        return {
            'valor': self.valor,
            'quantidade': self.quantidade,
            'viradaProximoLote': self.viradaProximoLote.to_dict()
        }

class Ingresso(BaseModel):
    id: Optional[str] = None
    nome: str
    tipo: TipoIngresso
    valor: float
    totalIngressos: Optional[int] = None
    inicioVendas: Optional[str] = None
    fimVendas: Optional[str] = None
    lotes: Optional[List[Lote]] = None
    taxaServico: TaxaServico
    visibilidade: Visibilidade

    @classmethod
    def from_dict(cls, data: dict):
        if not data:
            return None
            
        lotes_data = data.get('lotes', [])
        lotes = [Lote.from_dict(lote) for lote in lotes_data] if lotes_data else None
        
        return cls(
            id=data.get('id'),
            nome=data.get('nome'),
            tipo=TipoIngresso(data.get('tipo')),
            valor=float(data.get('valor', 0)),
            totalIngressos=int(data.get('totalIngressos')) if data.get('totalIngressos') else None,
            inicioVendas=data.get('inicioVendas'),
            fimVendas=data.get('fimVendas'),
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
            'totalIngressos': self.totalIngressos,
            'inicioVendas': self.inicioVendas,
            'fimVendas': self.fimVendas,
            'lotes': [lote.to_dict() for lote in self.lotes] if self.lotes else None,
            'taxaServico': self.taxaServico.value,
            'visibilidade': self.visibilidade.value
        }