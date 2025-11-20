"""
Routes module for Boxes.py web server
"""

from .makes import serveMakes
from .materials import serveMaterials

__all__ = ['serveMakes', 'serveMaterials']
