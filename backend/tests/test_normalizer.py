import copy
from app.services.normalizer import (
    normalize_column_name,
    normalize_phone,
    normalize_email,
    normalize_ip,
    normalize_imei,
    normalize_id,
    normalize_amount,
    normalize_records,
)


def test_column_name_normalization():
    assert normalize_column_name(" Mobile Number ") == "mobile_number"
    assert normalize_column_name("Transaction ID") == "transaction_id"
    assert normalize_column_name("IP-Address") == "ip_address"
    assert normalize_column_name("  Account - Number  ") == "account_number"
    assert normalize_column_name("Total   Amount ($)") == "total_amount_($)"


def test_phone_normalization():
    assert normalize_phone("+1 (555) 123-4567") == "+15551234567"
    assert normalize_phone(" 09876-543-210 ") == "09876543210"
    assert normalize_phone("+91 98765 43210") == "+919876543210"
    # Does not invent country code when absent
    assert normalize_phone("9876543210") == "9876543210"


def test_email_normalization():
    assert normalize_email(" User@Example.COM ") == "user@example.com"
    assert normalize_email("SUSPECT.ALICE@FRAUD.NET") == "suspect.alice@fraud.net"


def test_ip_normalization():
    assert normalize_ip(" 192.168.1.1 ") == "192.168.1.1"
    assert normalize_ip(" 10.0.0.50 ") == "10.0.0.50"


def test_imei_normalization():
    assert normalize_imei("86123-456 7890123") == "861234567890123"
    assert normalize_imei(" 861234567890123 ") == "861234567890123"


def test_transaction_account_id_preservation():
    # Surrounding whitespace is stripped, but hyphen/case/characters are preserved
    assert normalize_id(" TXN-998877-A ") == "TXN-998877-A"
    assert normalize_id(" ACC_00123456 ") == "ACC_00123456"


def test_amount_normalization():
    assert normalize_amount("$ 1,250.50") == 1250.5
    assert normalize_amount("₹ 50,000") == 50000
    assert normalize_amount("USD 700.00") == 700.0
    assert normalize_amount("1,000,000") == 1000000
    # Preserves non-numeric strings safely
    assert normalize_amount("N/A") == "N/A"


def test_unknown_fields_remaining_intact():
    raw_data = {
        "columns": ["Custom Field", "Device Notes"],
        "records": [{"Custom Field": " Secret Data ", "Device Notes": "Blue iPhone 13"}],
    }
    normalized = normalize_records(raw_data)
    assert normalized["columns"] == ["custom_field", "device_notes"]
    assert normalized["records"] == [
        {"custom_field": "Secret Data", "device_notes": "Blue iPhone 13"}
    ]


def test_empty_null_values():
    raw_data = {
        "columns": [" Mobile Number ", "Amount", "Email"],
        "records": [{" Mobile Number ": None, "Amount": "", "Email": None}],
    }
    normalized = normalize_records(raw_data)
    assert normalized["columns"] == ["mobile_number", "amount", "email"]
    assert normalized["records"] == [
        {"mobile_number": None, "amount": "", "email": None}
    ]


def test_original_parser_output_not_mutated():
    raw_data = {
        "columns": [" Mobile Number ", "Transaction ID"],
        "records": [
            {" Mobile Number ": "+1 (555) 123-4567 ", "Transaction ID": " TXN-001 "}
        ],
    }
    original_copy = copy.deepcopy(raw_data)

    normalize_records(raw_data)

    # Assert original raw_data was not mutated in place
    assert raw_data == original_copy
