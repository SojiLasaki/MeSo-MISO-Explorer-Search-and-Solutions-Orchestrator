"""Page-specific grounding references for the filed MISO tariff PDF.

The PDF remains outside the repository. These references identify the exact
page a response should show when a question overlaps tariff terminology.
"""
import re


TARIFF_DOCUMENT = "TariffAsFiledVersion.pdf"
TARIFF_PATH = r"C:\Users\catty\Downloads\TariffAsFiledVersion.pdf"


def _source(page, title):
    # The local Django endpoint avoids browser restrictions on file:// links.
    pdf_url = "http://127.0.0.1:8000/api/tariff/pdf/#page=" + str(page)
    return {"title": f"{TARIFF_DOCUMENT} — {title}", "url": pdf_url, "page": page, "document": TARIFF_PATH}


TARIFF_LMP = _source(97, "Locational Marginal Price (LMP) definition")
TARIFF_CLEARING = _source(101, "Market Clearing Price and Marginal Congestion Component definitions")
TARIFF_CONFIDENTIAL = _source(123, "Non-Disclosure Agreement and restricted Confidential Information definitions")
TARIFF_NONPUBLIC = _source(738, "Disclosure of Certain Confidential Market Participant Data")


def sources_for_question(question):
    """Return the smallest set of tariff pages relevant to a user question."""
    lower = question.lower()
    sources = []
    if re.search(r"\b(lmp|locational marginal price|commercial pricing node|cpnode)\b", lower):
        sources.append(TARIFF_LMP)
    if re.search(r"\b(market clearing|clearing price|clearing information|mcp|reserve clearing)\b", lower):
        sources.append(TARIFF_CLEARING)
    if re.search(r"\b(mcc|marginal congestion|transmission congestion|congestion charge|binding constraint)\b", lower):
        sources.append(TARIFF_CLEARING)
    if re.search(r"\b(confidential|non[ -]?public|non[ -]?disclosure|nda|restricted information)\b", lower):
        sources.extend([TARIFF_CONFIDENTIAL, TARIFF_NONPUBLIC])
    return sources
