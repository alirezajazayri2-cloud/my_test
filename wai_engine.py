# ======================================================
# WAI Logic Engine – Final Version (All-in-One)
# ======================================================
# - Load questions from wai_questions.json
# - Apply user answers
# - Calculate A, A+, B, Final Score
# - Determine color (mono / bipolar)
# - Determine polarity
# - Build final WAI profile
# - Export wai_profile.json
# ======================================================

import json
import math
from pathlib import Path

# ======================================================
# Constants
# ======================================================

BIPOLAR_INTERESTS = {"N", "B", "R", "D", "P", "L", "C"}
UNIPOLAR_INTERESTS = {"T", "K", "F", "I", "S", "O", "V", "M"}

ORANGE_ELIGIBLE = {"N", "B", "L", "C", "D"}

COMPLEMENT_COLOR = {
    "قرمز 🔴": "آبی 🔵",
    "آبی 🔵": "قرمز 🔴",
    "مشکی ⚫️": "سبز 🟢",
    "سبز 🟢": "مشکی ⚫️",
    "نارنجی 🟠": "نارنجی 🟠"
}

BASE_A = {
    "N": 46, "B": 20, "R": 39, "D": 54, "P": 50,
    "L": 31, "C": 26, "T": 44, "K": 34, "F": 30,
    "I": 34, "S": 49, "O": 30, "V": 67, "M": 34
}

# ======================================================
# Load Questions
# ======================================================

def load_questions():
    path = Path(__file__).parent / "wai_questions.json"
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

# ======================================================
# Question penalty (A+ logic)
# ======================================================

def question_penalty(q):
    options = q.get("options_count")
    weighted = q.get("weighted", False)

    if options == 2:
        return 2 if weighted else 1
    if options == 3:
        return 4 if weighted else 2

    return 0  # سوالات ASK / تشریحی

# ======================================================
# Apply user answers
# ======================================================

def apply_answers(questions, user_answers):
    for q in questions:
        qid = q.get("id")
        q["user_answer"] = user_answers.get(qid)
    return questions

# ======================================================
# Calculate A+
# ======================================================

def calculate_a_plus(questions, interest):
    a_plus = BASE_A[interest]

    for q in questions:
        if q.get("interest") != interest:
            continue

        if q.get("user_answer") is None:
            a_plus -= question_penalty(q)

    return max(a_plus, 1)

# ======================================================
# Calculate B
# ======================================================

def calculate_b(questions, interest):
    b = 0
    for q in questions:
        if q.get("interest") != interest:
            continue

        ans = q.get("user_answer")
        if ans == "ب":
            b += 1
        elif ans == "ج":
            b += 2

    return b

# ======================================================
# Score calculation
# ======================================================

def calculate_score(b, a_plus):
    raw = (b / a_plus) * 9
    return math.ceil(raw * 10) / 10

# ======================================================
# Color logic
# ======================================================

def determine_color(interest, score):
    if interest in BIPOLAR_INTERESTS:
        if 1 <= score <= 3.6:
            return "مشکی ⚫️"
        if 3.7 <= score <= 5.4:
            if interest in ORANGE_ELIGIBLE and 4.1 <= score <= 5.5:
                return "نارنجی 🟠"
            return "قرمز 🔴"
        if 5.5 <= score <= 7.8:
            return "آبی 🔵"
        return "سبز 🟢"

    else:  # UNIPOLAR
        if 0.5 <= score <= 3.1:
            return "مشکی ⚫️"
        if 3.2 <= score <= 4.1:
            return "قرمز 🔴"
        if 5 <= score <= 7.3:
            return "آبی 🔵"
        return "سبز 🟢"

# ======================================================
# Polarity
# ======================================================

def determine_polarity(score):
    if score >= 7:
        return "غالب"
    elif score >= 4:
        return "میانه"
    return "ضعیف"

# ======================================================
# Calculate all interests
# ======================================================

def calculate_all_interests(questions):
    results = {}

    for interest in BASE_A:
        a_plus = calculate_a_plus(questions, interest)
        b = calculate_b(questions, interest)
        score = calculate_score(b, a_plus)
        color = determine_color(interest, score)

        results[interest] = {
            "interest": interest,
            "A+": a_plus,
            "B": b,
            "score": score,
            "color": color
        }

    return results

# ======================================================
# Build final WAI profile (Step 5)
# ======================================================

def build_wai_profile(results):
    items = list(results.values())
    items.sort(key=lambda x: x["score"], reverse=True)

    profile = {
        "dominant_axis": items[0]["interest"],
        "top_interests": [],
        "all_interests": []
    }

    for item in items:
        enriched = {
            "interest": item["interest"],
            "score": item["score"],
            "color": item["color"],
            "complement_color": COMPLEMENT_COLOR[item["color"]],
            "polarity": determine_polarity(item["score"])
        }

        profile["all_interests"].append(enriched)

        if enriched["polarity"] == "غالب":
            profile["top_interests"].append(enriched)

    return profile

# ======================================================
# Export JSON
# ======================================================

def export_profile(profile):
    path = Path(__file__).parent / "wai_profile.json"
    with open(path, "w", encoding="utf-8") as f:
        json.dump(profile, f, ensure_ascii=False, indent=2)

def interpret_profile(dominant_axis, top_interests):
    if dominant_axis == "M":
        return {
            "summary": "...",
            "personality": [...],
            "work_environment": "...",
            "job_suggestions": [...]
        }
INTEREST_LABELS = {
    "B": "BGAN",
    "C": "EBI",
    "D": "PJO",
    "F": "PER",
    "I": "DRN",
    "K": "BDN",
    "L": "TMA",
    "M": "JAM",
    "N": "BAZ",
    "O": "AMN",
    "P": "MHS",
    "R": "NAMN",
    "S": "SHE",
    "T": "GRH",
    "V": "DID"
}
def print_wai_identity(profile):
    print("\n📝 شناسنامه شخصیت‌شناسی هستی ضمیری WAI\n")

    for item in profile["all_interests"]:
        code = item["interest"]
        label = INTEREST_LABELS.get(code, code)
        color = item["color"]

        print(f"{label}{color}")

# ======================================================
# MAIN
# ======================================================

if __name__ == "__main__":
    questions = load_questions()

    sample_answers = {
        q["id"]: "ب"
        for q in questions
        if "id" in q
    }

    questions = apply_answers(questions, sample_answers)
    results = calculate_all_interests(questions)
    profile = build_wai_profile(results)
    export_profile(profile)

    print_wai_identity(profile)

    print("\n✅ شناسنامه WAI ساخته شد")
