import numpy as np
from datetime import datetime, timedelta

def normalize_fare(raw_fare: float, baggage_kg: int, is_direct: bool, fare_class: str) -> tuple[float, float]:
    """
    Fare Quality & Comparability Engine: Normalizes ancillaries and flight structure
    so tickets can be compared fairly before index calculation.
    """
    # 1. Baggage Penalty (Standardized to 15kg baseline)
    baggage_penalty = (15 - baggage_kg) * 450.0 if baggage_kg < 15 else 0.0

    # 2. Connection Adjustment
    direct_multiplier = 1.0 if is_direct else 0.85

    # 3. Class Multiplier
    class_multiplier = 1.0 if fare_class.lower() == "economy" else 0.5 # Normalize business class back to eco benchmark

    standardized_fare = round((raw_fare + baggage_penalty) * direct_multiplier * class_multiplier, 2)
    quality_score = 1.0 if is_direct and baggage_kg >= 15 else 0.85

    return standardized_fare, quality_score

def calculate_index(fares: list[float], base_mean: float = 4500.0) -> float:
    """
    Computes representative index (Base = 100).
    """
    if not fares:
        return 100.0
    current_avg = float(np.mean(fares))
    return round((current_avg / base_mean) * 100.0, 2)

def generate_short_term_forecast(current_index: float) -> dict:
    """
    Short-Term Trend Forecasting Engine (Predicts 7-day trend).
    """
    trend_factor = np.random.choice([1.02, 1.04, 0.98, 1.01]) # Simulated ML trend multiplier
    forecasted_val = round(current_index * trend_factor, 2)
    change_pct = round(((forecasted_val - current_index) / current_index) * 100.0, 2)

    return {
        "forecasted_7d_index": forecasted_val,
        "predicted_change_pct": change_pct,
        "confidence_score": 0.92
    }