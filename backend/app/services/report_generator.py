import copy
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.platypus import (
    HRFlowable,
    KeepTogether,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


def safe_txt(val: Any) -> str:
    """Escapes XML special characters for safe ReportLab Paragraph rendering."""
    if val is None or val == "":
        return "N/A"
    return escape(str(val))


def generate_investigation_report(
    case_id: str,
    evidence: List[Dict[str, Any]],
    findings: List[Dict[str, Any]],
    risk_summary: Dict[str, Any],
    timeline: List[Dict[str, Any]],
    output_path: Path,
) -> Path:
    """
    Generates an evidence-linked PDF investigation brief using ReportLab Platypus.
    Input objects remain unmutated.
    """
    if not case_id or not str(case_id).strip():
        raise ValueError("case_id is required and cannot be empty")
    if evidence is None or not isinstance(evidence, list):
        raise ValueError("evidence must be a list")
    if findings is None or not isinstance(findings, list):
        raise ValueError("findings must be a list")
    if risk_summary is None or not isinstance(risk_summary, dict):
        raise ValueError("risk_summary must be a dictionary")
    if timeline is None or not isinstance(timeline, list):
        raise ValueError("timeline must be a list")
    if not output_path:
        raise ValueError("output_path is required")

    target_path = Path(output_path)
    target_path.parent.mkdir(parents=True, exist_ok=True)

    # Prepare styles
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "DocTitle",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=20,
        leading=24,
        textColor=colors.HexColor("#1E293B"),
    )

    h2_style = ParagraphStyle(
        "SectionHeader",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=14,
        leading=18,
        textColor=colors.HexColor("#0F172A"),
        spaceBefore=12,
        spaceAfter=6,
    )

    body_style = ParagraphStyle(
        "Body",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#334155"),
    )

    bold_body_style = ParagraphStyle(
        "BoldBody",
        parent=body_style,
        fontName="Helvetica-Bold",
    )

    sha_style = ParagraphStyle(
        "SHAMono",
        parent=body_style,
        fontName="Courier",
        fontSize=7,
        leading=9,
        textColor=colors.HexColor("#0F172A"),
    )

    disclaimer_style = ParagraphStyle(
        "Disclaimer",
        parent=body_style,
        fontName="Helvetica-Oblique",
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#64748B"),
    )

    story = []
    generated_at = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")

    # -------------------------------------------------------------
    # 1. Header
    # -------------------------------------------------------------
    story.append(Paragraph("Cyber Fraud Investigation Brief", title_style))
    story.append(Paragraph(f"<b>Case ID:</b> {safe_txt(case_id)} | <b>Generated:</b> {generated_at}", body_style))
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#CBD5E1"), spaceAfter=15))

    # -------------------------------------------------------------
    # 2. Investigation Summary
    # -------------------------------------------------------------
    story.append(Paragraph("1. Investigation Summary", h2_style))
    summary_data = [
        [
            Paragraph("<b>Case ID:</b>", body_style),
            Paragraph(safe_txt(case_id), body_style),
            Paragraph("<b>Evidence Files:</b>", body_style),
            Paragraph(str(len(evidence)), body_style),
        ],
        [
            Paragraph("<b>Findings Detected:</b>", body_style),
            Paragraph(str(len(findings)), body_style),
            Paragraph("<b>Priority Level:</b>", body_style),
            Paragraph(f"<b>{safe_txt(risk_summary.get('priority', 'N/A')).upper()}</b> (Score: {risk_summary.get('score', 0)}/100)", bold_body_style),
        ],
    ]
    t_summary = Table(summary_data, colWidths=[120, 150, 120, 150])
    t_summary.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F8FAFC")),
            ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("PADDING", (0, 0), (-1, -1), 6),
        ])
    )
    story.append(t_summary)
    story.append(Spacer(1, 15))

    # -------------------------------------------------------------
    # 3. Evidence Inventory
    # -------------------------------------------------------------
    story.append(Paragraph("2. Evidence Inventory", h2_style))
    if not evidence:
        story.append(Paragraph("No evidence files recorded.", body_style))
    else:
        ev_headers = [
            Paragraph("<b>Evidence ID / File</b>", bold_body_style),
            Paragraph("<b>Type / Size</b>", bold_body_style),
            Paragraph("<b>SHA-256 Hash</b>", bold_body_style),
        ]
        ev_rows = [ev_headers]

        for item in evidence:
            ev_id = safe_txt(item.get("evidence_id"))
            fn = safe_txt(item.get("filename"))
            ft = safe_txt(item.get("file_type"))
            fs = f"{item.get('file_size', 0)} bytes"
            sha = safe_txt(item.get("sha256"))

            col1 = Paragraph(f"<b>{ev_id}</b><br/>{fn}", body_style)
            col2 = Paragraph(f"{ft.upper()}<br/>{fs}", body_style)
            col3 = Paragraph(sha, sha_style)
            ev_rows.append([col1, col2, col3])

        t_evidence = Table(ev_rows, colWidths=[150, 100, 290])
        t_evidence.setStyle(
            TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#F1F5F9")),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("PADDING", (0, 0), (-1, -1), 5),
            ])
        )
        story.append(t_evidence)

    story.append(Spacer(1, 15))

    # -------------------------------------------------------------
    # 4. Investigative Priority & Signals
    # -------------------------------------------------------------
    story.append(Paragraph("3. Investigative Priority & Signals", h2_style))
    story.append(
        Paragraph(
            "<i>Investigative Priority — not a probability of fraud or guilt.</i>",
            disclaimer_style,
        )
    )
    story.append(Spacer(1, 5))

    signals = risk_summary.get("signals", [])
    if not signals:
        story.append(Paragraph("No risk signals recorded.", body_style))
    else:
        sig_headers = [
            Paragraph("<b>Finding ID / Pattern</b>", bold_body_style),
            Paragraph("<b>Points</b>", bold_body_style),
            Paragraph("<b>Scoring Reason</b>", bold_body_style),
        ]
        sig_rows = [sig_headers]

        for sig in signals:
            fid = safe_txt(sig.get("finding_id"))
            pat = safe_txt(sig.get("pattern_type"))
            pts = f"+{sig.get('points', 0)}"
            sr = safe_txt(sig.get("scoring_reason"))

            col1 = Paragraph(f"<b>{fid}</b><br/>{pat}", body_style)
            col2 = Paragraph(f"<b>{pts}</b>", bold_body_style)
            col3 = Paragraph(sr, body_style)
            sig_rows.append([col1, col2, col3])

        t_signals = Table(sig_rows, colWidths=[180, 60, 300])
        t_signals.setStyle(
            TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#F1F5F9")),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("PADDING", (0, 0), (-1, -1), 5),
            ])
        )
        story.append(t_signals)

    story.append(Spacer(1, 15))

    # -------------------------------------------------------------
    # 5. Investigative Findings
    # -------------------------------------------------------------
    story.append(Paragraph("4. Detected Investigative Findings", h2_style))
    if not findings:
        story.append(Paragraph("No investigative findings detected.", body_style))
    else:
        for f in findings:
            fid = safe_txt(f.get("finding_id"))
            title = safe_txt(f.get("title"))
            priority = safe_txt(f.get("priority", "")).upper()
            pat = safe_txt(f.get("pattern_type"))
            reason = safe_txt(f.get("reason"))
            entities_str = ", ".join(map(safe_txt, f.get("entity_ids", []))) or "None"
            recs_str = ", ".join(map(str, f.get("record_indices", []))) or "None"

            finding_block = [
                Paragraph(f"<b>{title}</b> ({fid}) — Priority: <b>{priority}</b>", bold_body_style),
                Paragraph(f"<b>Pattern Type:</b> {pat}", body_style),
                Paragraph(f"<b>Reason:</b> {reason}", body_style),
                Paragraph(f"<b>Involved Entities:</b> {entities_str}", body_style),
                Paragraph(f"<b>Supporting Record Indices:</b> {recs_str}", body_style),
                Spacer(1, 6),
            ]
            story.append(KeepTogether(finding_block))

    story.append(Spacer(1, 15))

    # -------------------------------------------------------------
    # 6. Chronological Timeline
    # -------------------------------------------------------------
    story.append(Paragraph("5. Chronological Timeline", h2_style))
    if not timeline:
        story.append(Paragraph("No chronological timeline events available.", body_style))
    else:
        tl_headers = [
            Paragraph("<b>Timestamp</b>", bold_body_style),
            Paragraph("<b>Type / Event</b>", bold_body_style),
            Paragraph("<b>Entities & Traceability</b>", bold_body_style),
        ]
        tl_rows = [tl_headers]

        for ev in timeline:
            ts = safe_txt(ev.get("timestamp"))
            ev_type = safe_txt(ev.get("event_type"))
            desc = safe_txt(ev.get("description"))
            r_idx = ev.get("record_index", "N/A")
            e_ids = ", ".join(map(safe_txt, ev.get("entity_ids", []))) or "N/A"

            col1 = Paragraph(ts, body_style)
            col2 = Paragraph(f"<b>{ev_type}</b><br/>{desc}", body_style)
            col3 = Paragraph(f"Record #{r_idx}<br/>Entities: {e_ids}", body_style)
            tl_rows.append([col1, col2, col3])

        t_timeline = Table(tl_rows, colWidths=[130, 240, 170])
        t_timeline.setStyle(
            TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#F1F5F9")),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("PADDING", (0, 0), (-1, -1), 5),
            ])
        )
        story.append(t_timeline)

    story.append(Spacer(1, 15))

    # -------------------------------------------------------------
    # 7. Limitations & Interpretation
    # -------------------------------------------------------------
    lim_block = [
        Paragraph("6. Limitations & Methodological Interpretation", h2_style),
        Paragraph("• Shared IP addresses may represent shared infrastructure and do not establish common control or identity.", body_style),
        Paragraph("• Shared IMEI values indicate a device relationship but do not independently establish identity.", body_style),
        Paragraph("• Investigative priority scores are triage signals, not determinations of guilt.", body_style),
        Paragraph("• Findings depend strictly on the quality, structure, and completeness of supplied evidence.", body_style),
        Paragraph("• Missing or inconsistent timestamps may limit chronological reconstruction.", body_style),
    ]
    story.append(KeepTogether(lim_block))

    # Build PDF
    doc = SimpleDocTemplate(
        str(target_path),
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36,
    )
    doc.build(story)

    return target_path
