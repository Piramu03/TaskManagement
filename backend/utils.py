from datetime import datetime, date

def calculate_priority(due_date_str: str | None):
    if not due_date_str:
        return None

    due_date = datetime.strptime(due_date_str, "%Y-%m-%d").date()
    today = date.today()
    diff = (due_date - today).days

    if diff <= 0:
        return "high"
    elif diff <= 2:
        return "medium"
    else:
        return "low"
