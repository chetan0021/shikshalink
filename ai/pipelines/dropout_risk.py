from dataclasses import dataclass


@dataclass
class RiskSignal:
    attendance: float
    parent_sentiment: float
    performance: float


def compute_risk(signal: RiskSignal) -> str:
    score = signal.attendance * 0.4 + signal.parent_sentiment * 0.2 + signal.performance * 0.4
    if score >= 0.75:
        return "Green"
    if score >= 0.45:
        return "Yellow"
    return "Red"
