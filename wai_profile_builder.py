# =========================================
# WAI – Profile Builder (Step 5)
# =========================================
# این فایل:
# - قطبیت رغبت‌ها را تعیین می‌کند
# - گوی مکمل را اضافه می‌کند
# - شناسنامه نهایی WAI را می‌سازد
# - خروجی JSON استاندارد تولید می‌کند
# =========================================

import json

# =========================================
# گوی‌های مکمل (طبق Word)
# =========================================

COMPLEMENT_COLOR = {
    "قرمز 🔴": "آبی 🔵",
    "آبی 🔵": "قرمز 🔴",
    "مشکی ⚫️": "سبز 🟢",
    "سبز 🟢": "مشکی ⚫️",
    "نارنجی 🟠": "نارنجی 🟠"
}

# =========================================
# تعیین قطبیت رغبت
# =========================================

def determine_polarity(score: float) -> str:
    """
    تعیین قطبیت بر اساس امتیاز نهایی
    """
    if score >= 7:
        return "غالب"
    elif score >= 4:
        return "میانه"
    else:
        return "ضعیف"

# =========================================
# ساخت شناسنامه نهایی WAI
# =========================================

def build_wai_profile(all_results: dict) -> dict:
    """
    ورودی:
        all_results -> خروجی calculate_all_interests()

    خروجی:
        دیکشنری شناسنامه نهایی WAI
    """

    interests = list(all_results.values())

    # مرتب‌سازی نزولی بر اساس امتیاز
    interests.sort(key=lambda x: x.get("score", 0), reverse=True)

    profile = {
        "dominant_axis": None,
        "top_interests": [],
        "all_interests": []
    }

    for item in interests:
        interest = item.get("interest")
        score = item.get("score", 0)
        color = item.get("color")

        enriched = {
            "interest": interest,
            "score": score,
            "color": color,
            "complement_color": COMPLEMENT_COLOR.get(color),
            "polarity": determine_polarity(score)
        }

        profile["all_interests"].append(enriched)

        if enriched["polarity"] == "غالب":
            profile["top_interests"].append(enriched)

    # محور غالب = بیشترین امتیاز
    if interests:
        profile["dominant_axis"] = interests[0].get("interest")

    return profile

# =========================================
# خروجی گرفتن JSON
# =========================================

def export_profile(profile: dict, filename: str = "wai_profile.json"):
    """
    ذخیره شناسنامه WAI در فایل JSON
    """
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(profile, f, ensure_ascii=False, indent=2)

# =========================================
# تست مستقل (اختیاری)
# =========================================

if __name__ == "__main__":
    # این بخش فقط برای تست مستقل این فایل است
    mock_results = {
        "R": {
            "interest": "R",
            "score": 4.0,
            "color": "قرمز 🔴"
        },
        "P": {
            "interest": "P",
            "score": 7.9,
            "color": "سبز 🟢"
        }
    }

    profile = build_wai_profile(mock_results)
    export_profile(profile)

    print("✅ wai_profile_builder تست شد و خروجی ساخته شد")
