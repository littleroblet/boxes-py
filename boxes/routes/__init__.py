"""
Routes module for Boxes.py web server
"""

from .home import serveHome
from .makes import serveMakes
from .materials import serveMaterials
from .settings import serveSettings

__all__ = ['serveHome', 'serveMakes', 'serveMaterials', 'serveSettings']
