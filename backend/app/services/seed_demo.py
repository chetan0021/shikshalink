from __future__ import annotations

from datetime import date, timedelta

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db.models import (
    AdminBotTask,
    AttendanceEvent,
    BeoTask,
    CareerOpportunity,
    ParentCallEvent,
    School,
    StateMetric,
    Student,
    VendorBudgetLine,
)
from app.services.risk_engine import refresh_all_risk_snapshots


def seed_if_empty(db: Session) -> bool:
    if db.scalar(select(func.count()).select_from(School)) or 0:
        return False

    schools_spec = [
        (
            "29200100101",
            "Government Higher Primary School, Bengaluru Urban",
            "Bengaluru Urban",
            "Karnataka",
            420,
            18,
            1_250_000,
            "Functional labs; rooftop solar pilot",
        ),
        (
            "09100100101",
            "Government Middle School, Patna Sadar",
            "Patna",
            "Bihar",
            310,
            12,
            890_000,
            "Library refurbishment scheduled",
        ),
        (
            "33250100201",
            "Government Upper Primary School, Panaji",
            "North Goa",
            "Goa",
            205,
            9,
            540_000,
            "STEM tinkering lab operational",
        ),
        (
            "27250200102",
            "Government Girls Higher Primary School, Surat City",
            "Surat",
            "Gujarat",
            388,
            15,
            980_000,
            "ICT-enabled classrooms phase two",
        ),
        (
            "09211800101",
            "Government Primary School, Varanasi Urban",
            "Varanasi",
            "Uttar Pradesh",
            445,
            16,
            760_000,
            "Drinking water filtration upgraded",
        ),
        (
            "33060100503",
            "Government Middle School, Chennai Central",
            "Chennai",
            "Tamil Nadu",
            502,
            22,
            1_480_000,
            "Smart classroom bundle deployed",
        ),
        (
            "36041000802",
            "Government Upper Primary School, Hyderabad South East",
            "Hyderabad",
            "Telangana",
            398,
            17,
            1_020_000,
            "Dual-language digital library",
        ),
        (
            "23100200405",
            "Government Higher Secondary School, Indore Urban",
            "Indore",
            "Madhya Pradesh",
            612,
            27,
            1_340_000,
            "Vocational hub partnership active",
        ),
    ]

    school_objs: list[School] = []
    for row in schools_spec:
        school_objs.append(
            School(
                udise_code=row[0],
                name=row[1],
                district=row[2],
                state=row[3],
                enrollment_total=row[4],
                teacher_count=row[5],
                grant_inr=float(row[6]),
                infra_status=row[7],
            )
        )
    db.add_all(school_objs)
    db.flush()

    students_spec = [
        ("Ananya Rao", 7, "919845001122", True),
        ("Vikram S", 8, "919845001133", True),
        ("Kavana M", 6, "919845001144", True),
        ("Ravi Kumar", 7, "919612002211", True),
        ("Pooja Devi", 8, "919612002222", True),
        ("Merlyn Fernandes", 7, "919811223344", True),
        ("Yash Patel", 8, "919874556677", True),
        ("Aditi Mishra", 6, "919919988776", True),
        ("Soundar Rajan", 7, "919884455566", True),
        ("Noor Fatima", 8, "919898765432", True),
        ("Imran Khan", 7, "917311223344", True),
        ("Deepika Sen", 6, "919955667788", True),
    ]

    studs: list[Student] = []
    for idx, spec in enumerate(students_spec):
        school = school_objs[idx % len(school_objs)]
        studs.append(
            Student(
                school_id=school.id,
                name=spec[0],
                grade=spec[1],
                parent_phone=spec[2],
                is_active=spec[3],
            )
        )
    db.add_all(studs)
    db.flush()

    today = date.today()
    for st in studs:
        for offset in range(21):
            d = today - timedelta(days=offset)
            if st.name == "Kavana M" and offset < 7:
                status = "absent" if offset % 2 == 0 else "present"
            elif st.name == "Aditi Mishra" and offset < 4:
                status = "absent"
            else:
                status = "present" if offset % 8 != 0 else "absent"
            db.add(AttendanceEvent(student_id=st.id, event_date=d, status=status))

    db.add(
        ParentCallEvent(
            student_id=studs[2].id,
            language="kn",
            call_status="completed",
            sentiment_score=-0.35,
            transcript_summary="Parent cited transport issues and irregular attendance.",
        )
    )
    db.add(
        ParentCallEvent(
            student_id=studs[7].id,
            language="hi",
            call_status="completed",
            sentiment_score=-0.15,
            transcript_summary="Guardian requested hostel support information.",
        )
    )

    db.add_all(
        [
            AdminBotTask(
                school_id=school_objs[0].id,
                title="Mid-day meal reconciliation — MDM portal export",
                status="pending",
                form_payload={"scheme": "MDM", "month": today.strftime("%Y-%m")},
            ),
            AdminBotTask(
                school_id=school_objs[0].id,
                title="Teacher transfer request draft — intra-district",
                status="in_review",
                form_payload={
                    "teacher": "Senior instructor mathematics",
                    "destination_block": "North cluster office",
                },
            ),
            AdminBotTask(
                school_id=school_objs[5].id,
                title="Safety audit worksheet — fire extinguisher checklist",
                status="pending",
                form_payload={"facility_block": "East wing", "audit_month": today.strftime("%Y-%m")},
            ),
        ]
    )

    db.add_all(
        [
            BeoTask(
                title="Verify attendance dip cluster in Ward 12 government primaries",
                description="Cross-check UDISE daily marks with attendance registers for variance above eight percent.",
                assigned_role="CRC",
                assignee_name="CRC Lakshmi",
                due_date=today + timedelta(days=3),
                status="open",
            ),
            BeoTask(
                title="Solar lab vendor utilization audit — cluster seven",
                description="Confirm invoice alignment with sanctioned rooftop solar maintenance grant.",
                assigned_role="BRP",
                assignee_name="BRP Imran",
                due_date=today + timedelta(days=7),
                status="in_progress",
                escalated=False,
            ),
            BeoTask(
                title="CRC roster refresh after teacher rationalization workshop",
                description="Upload signed attendance from May coordination meeting.",
                assigned_role="DEO_COORD",
                assignee_name="District coordination cell",
                due_date=today + timedelta(days=14),
                status="open",
            ),
        ]
    )

    careers = [
        CareerOpportunity(
            title="Solar technician pathway",
            category="Green energy",
            region_hint="Karnataka",
            description="NSQF-aligned installer modules plus district solar hub apprenticeship intake.",
            min_grade=6,
            max_grade=8,
        ),
        CareerOpportunity(
            title="ITI electrician programme",
            category="Vocational",
            region_hint="Bihar",
            description="Nearest ITI electrical trade seats with hostel scholarship checklist.",
            min_grade=6,
            max_grade=8,
        ),
        CareerOpportunity(
            title="District vocational laboratory assistant",
            category="School labs",
            region_hint="Karnataka",
            description="Support NSQF sessions under Rashtriya Madhyamik Shiksha Abhiyan labs.",
            min_grade=6,
            max_grade=8,
        ),
        CareerOpportunity(
            title="Agri-processing apprenticeship near APMC yards",
            category="Agriculture",
            region_hint="Uttar Pradesh",
            description="Cold-chain helper roles tied to Krishi Vigyan Kendra orientation camps.",
            min_grade=6,
            max_grade=8,
        ),
        CareerOpportunity(
            title="Healthcare ward assistant preparatory track",
            category="Health",
            region_hint="Tamil Nadu",
            description="Bridge classes toward medical lab attendant certificates.",
            min_grade=6,
            max_grade=8,
        ),
        CareerOpportunity(
            title="Heritage tourism interpretive guide junior cadre",
            category="Tourism",
            region_hint="Goa",
            description="Localized storytelling skill-building with tourism department outreach.",
            min_grade=6,
            max_grade=8,
        ),
        CareerOpportunity(
            title="Textiles ATEL cluster helper programme",
            category="Manufacturing",
            region_hint="Gujarat",
            description="Safety-certified helper pathway inside textile parks near Surat.",
            min_grade=6,
            max_grade=8,
        ),
        CareerOpportunity(
            title="Drone surveying literacy pilot",
            category="Emerging skills",
            region_hint="Telangana",
            description="Introductory GNSS and drone safety orientation from ICT labs.",
            min_grade=7,
            max_grade=8,
        ),
        CareerOpportunity(
            title="Public works apprenticeship feeder course",
            category="Infrastructure",
            region_hint="Madhya Pradesh",
            description="Measurement assistant roles aligned with PMGSY monitoring cohorts.",
            min_grade=6,
            max_grade=8,
        ),
        CareerOpportunity(
            title="Community radio storytelling residency",
            category="Media",
            region_hint="Karnataka",
            description="Hyper-local Kannada programming internships via Akashvani nodal schools.",
            min_grade=6,
            max_grade=8,
        ),
    ]
    db.add_all(careers)

    metrics_rows = [
        ("KA", "Karnataka", "dropout_risk", 0.28),
        ("KA", "Karnataka", "attendance", 0.86),
        ("KA", "Karnataka", "budget_utilization", 0.74),
        ("KA", "Karnataka", "parent_engagement", 0.62),
        ("BR", "Bihar", "dropout_risk", 0.41),
        ("BR", "Bihar", "attendance", 0.78),
        ("BR", "Bihar", "budget_utilization", 0.69),
        ("BR", "Bihar", "parent_engagement", 0.55),
        ("MH", "Maharashtra", "dropout_risk", 0.33),
        ("MH", "Maharashtra", "attendance", 0.84),
        ("MH", "Maharashtra", "budget_utilization", 0.81),
        ("MH", "Maharashtra", "parent_engagement", 0.58),
        ("TN", "Tamil Nadu", "dropout_risk", 0.27),
        ("TN", "Tamil Nadu", "attendance", 0.88),
        ("TN", "Tamil Nadu", "budget_utilization", 0.79),
        ("TN", "Tamil Nadu", "parent_engagement", 0.65),
        ("GJ", "Gujarat", "dropout_risk", 0.31),
        ("GJ", "Gujarat", "attendance", 0.85),
        ("GJ", "Gujarat", "budget_utilization", 0.83),
        ("GJ", "Gujarat", "parent_engagement", 0.61),
        ("UP", "Uttar Pradesh", "dropout_risk", 0.39),
        ("UP", "Uttar Pradesh", "attendance", 0.79),
        ("UP", "Uttar Pradesh", "budget_utilization", 0.71),
        ("UP", "Uttar Pradesh", "parent_engagement", 0.54),
        ("TG", "Telangana", "dropout_risk", 0.30),
        ("TG", "Telangana", "attendance", 0.87),
        ("TG", "Telangana", "budget_utilization", 0.77),
        ("TG", "Telangana", "parent_engagement", 0.59),
        ("MP", "Madhya Pradesh", "dropout_risk", 0.36),
        ("MP", "Madhya Pradesh", "attendance", 0.81),
        ("MP", "Madhya Pradesh", "budget_utilization", 0.73),
        ("MP", "Madhya Pradesh", "parent_engagement", 0.56),
        ("GA", "Goa", "dropout_risk", 0.22),
        ("GA", "Goa", "attendance", 0.90),
        ("GA", "Goa", "budget_utilization", 0.78),
        ("GA", "Goa", "parent_engagement", 0.67),
    ]
    for code, name, key, val in metrics_rows:
        db.add(StateMetric(state_code=code, state_name=name, metric_key=key, value=val))

    db.add_all(
        [
            VendorBudgetLine(
                school_id=school_objs[0].id,
                fiscal_year="2025-26",
                vendor_name="GreenGrid Solar Supplies",
                allocated_inr=450_000,
                utilized_inr=332_000,
            ),
            VendorBudgetLine(
                school_id=school_objs[5].id,
                fiscal_year="2025-26",
                vendor_name="Chennai Smart Classroom Consortium",
                allocated_inr=620_000,
                utilized_inr=581_000,
            ),
            VendorBudgetLine(
                school_id=school_objs[3].id,
                fiscal_year="2025-26",
                vendor_name="Surat Mid-Day Meal Logistics Cooperative",
                allocated_inr=280_000,
                utilized_inr=241_500,
            ),
        ]
    )

    db.commit()
    refresh_all_risk_snapshots(db)
    return True
