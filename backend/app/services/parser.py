import csv
import json
from pathlib import Path
from typing import Any, Dict, List
import openpyxl


def parse_csv(file_path: Path) -> Dict[str, Any]:
    """
    Parses a CSV file into the common internal representation:
    {"columns": [...], "records": [...]}
    """
    try:
        with open(file_path, "r", encoding="utf-8-sig", errors="replace") as f:
            reader = csv.reader(f)
            try:
                headers = next(reader)
            except StopIteration:
                return {"columns": [], "records": []}

            columns = [str(h).strip() for h in headers]
            records: List[Dict[str, Any]] = []
            for row in reader:
                record = {}
                for col, val in zip(columns, row):
                    record[col] = val
                records.append(record)

            return {"columns": columns, "records": records}
    except Exception as e:
        raise ValueError(f"Failed to parse CSV file: {str(e)}")


def parse_xlsx(file_path: Path) -> Dict[str, Any]:
    """
    Parses the first worksheet of an XLSX file into the common internal representation:
    {"columns": [...], "records": [...]}
    """
    try:
        wb = openpyxl.load_workbook(file_path, data_only=True, read_only=True)
        sheet = wb.worksheets[0]
        rows = list(sheet.iter_rows(values_only=True))
        wb.close()

        if not rows:
            return {"columns": [], "records": []}

        headers = [str(cell).strip() if cell is not None else "" for cell in rows[0]]
        records: List[Dict[str, Any]] = []

        for row in rows[1:]:
            if all(cell is None for cell in row):
                continue
            record = {}
            for col, val in zip(headers, row):
                record[col] = "" if val is None else str(val)
            records.append(record)

        return {"columns": headers, "records": records}
    except Exception as e:
        raise ValueError(f"Failed to parse XLSX file: {str(e)}")


def parse_json(file_path: Path) -> Dict[str, Any]:
    """
    Parses a JSON file (top-level list of objects or object containing a list of records)
    into the common internal representation:
    {"columns": [...], "records": [...]}
    """
    try:
        with open(file_path, "r", encoding="utf-8", errors="replace") as f:
            data = json.load(f)
    except Exception as e:
        raise ValueError(f"Failed to parse JSON file: {str(e)}")

    records_list = None
    if isinstance(data, list):
        records_list = data
    elif isinstance(data, dict):
        # First check explicit record keys
        for key in ["records", "data", "items", "rows", "results"]:
            if key in data and isinstance(data[key], list):
                records_list = data[key]
                break
        # Fallback: check any list of dicts in values
        if records_list is None:
            for v in data.values():
                if isinstance(v, list) and (
                    len(v) == 0 or all(isinstance(i, dict) for i in v)
                ):
                    records_list = v
                    break

    if records_list is None or not isinstance(records_list, list):
        raise ValueError(
            "Unsupported JSON structure: Expected a list of objects or an object containing a list of records."
        )

    records: List[Dict[str, Any]] = []
    columns_set: List[str] = []

    for item in records_list:
        if not isinstance(item, dict):
            raise ValueError(
                "Unsupported JSON structure: Record items in list must be JSON objects."
            )
        records.append(item)
        for k in item.keys():
            if k not in columns_set:
                columns_set.append(k)

    return {"columns": columns_set, "records": records}


def parse_txt(file_path: Path) -> Dict[str, Any]:
    """
    Parses a TXT file into the common internal representation:
    {"columns": ["text"], "records": [{"text": "..."}]}
    """
    try:
        with open(file_path, "r", encoding="utf-8", errors="replace") as f:
            content = f.read()
        return {"columns": ["text"], "records": [{"text": content}]}
    except Exception as e:
        raise ValueError(f"Failed to parse TXT file: {str(e)}")


def parse_evidence(file_path: Path, file_type: str) -> Dict[str, Any]:
    """
    Dispatches evidence parsing based on file type.
    Supported types: 'csv', 'xlsx', 'json', 'txt'.
    """
    fmt = file_type.lower()
    if fmt == "csv":
        return parse_csv(file_path)
    elif fmt == "xlsx":
        return parse_xlsx(file_path)
    elif fmt == "json":
        return parse_json(file_path)
    elif fmt == "txt":
        return parse_txt(file_path)
    else:
        raise ValueError(f"Unsupported evidence file type for parsing: '{file_type}'")
