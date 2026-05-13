"""
Browser-safe telephony simulation hooks.

Production deployments swap `simulate_call` for Asterisk AMI / SIP origination or integrate the CallerAgent
workflow described in the hackathon architecture brief.
"""


def simulate_call(student_id: str) -> dict[str, str]:
    return {
        "student_id": student_id,
        "mode": "browser-simulation",
        "status": "completed",
        "detail": "Replace with SIP originate or CallerAgent bridge when PBX credentials are available.",
    }
