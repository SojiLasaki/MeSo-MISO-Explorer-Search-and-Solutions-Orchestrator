"""Curated report fallback. These are official links, not copied report data."""

REPORTS = [
    {
        "id": "real_time_pricing_report",
        "title": "Real-Time Pricing Report Reader’s Guide",
        "url": "https://docs.misoenergy.org/marketreports/Real-Time%20Pricing%20Report_Real-Time%20Pricing%20Report%20Readers%20Guide.pdf",
        "description": "Legacy real-time pricing report documentation. For recurring retrieval, prefer the Real-Time Ex-Post LMP API.",
        "api_replacement": "realtime_lmp",
        "terms": ["real-time pricing report", "real time pricing report", "rt pricing", "lmp report"],
    },
    {
        "id": "actual_load_report",
        "title": "Daily Forecast and Actual Load by Local Resource Zone",
        "url": "https://docs.misoenergy.org/marketreports/Daily%20Forecast%20and%20Actual%20Load%20by%20Local%20Resource%20Zone_Daily%20Forecast%20and%20Actual%20Load%20Report%20by%20Local%20Resource%20Zone%20Report%20Readers%20Guide.pdf",
        "description": "Legacy actual-load report documentation. For ongoing retrieval, prefer the Actual Load API.",
        "api_replacement": "actual_load",
        "terms": ["actual load report", "daily forecast actual load", "historical load report"],
    },
    {
        "id": "market_report_archive",
        "title": "MISO Market Report Archives",
        "url": "https://www.misoenergy.org/markets-and-operations/real-time--market-data/market-report-archives/",
        "description": "Official archive for older and retained MISO market-report material.",
        "api_replacement": None,
        "terms": ["older report", "old report", "legacy report", "market report", "report archive"],
    },
]


def find_report(question):
    lower = question.lower()
    ranked = []
    for report in REPORTS:
        score = sum(len(term.split()) * 10 + len(term) for term in report["terms"] if term in lower)
        if score:
            ranked.append((score, report))
    return max(ranked, key=lambda item: item[0])[1] if ranked else None
