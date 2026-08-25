"""
AIRIS Scraper Engine - Multi-adapter data collection and validation gate.
"""
from .models import FareObservation, CabinClass, ValidationResult
from .validator import Validator

__all__ = ["FareObservation", "CabinClass", "ValidationResult", "Validator"]
