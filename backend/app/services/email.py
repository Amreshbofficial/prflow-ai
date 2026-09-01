"""Email sending service using Resend API."""
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)


def send_email(to: str, subject: str, body: str) -> dict:
    """
    Send an email via Resend API.

    Args:
        to: Recipient email address
        subject: Email subject line
        body: Email body (plain text)

    Returns:
        dict with message ID on success

    Raises:
        RuntimeError: If API key is missing or sending fails
    """
    api_key = settings.RESEND_API_KEY

    if not api_key:
        # In demo mode, log instead of sending
        logger.warning(
            "RESEND_API_KEY not configured. "
            "Email NOT sent — this is demo mode.\n"
            f"  To: {to}\n  Subject: {subject}"
        )
        raise RuntimeError(
            "Email provider not configured. "
            "Set RESEND_API_KEY to enable real email sending. "
            "This message was NOT delivered to the recipient."
        )

    try:
        import httpx
    except ImportError:
        raise RuntimeError("httpx is required for email sending. Install with: pip install httpx")

    try:
        with httpx.Client(timeout=30.0) as client:
            response = client.post(
                "https://api.resend.com/emails",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "from": f"{settings.SENDER_NAME} <{settings.SENDER_EMAIL}>",
                    "to": [to],
                    "subject": subject,
                    "text": body,
                },
            )

        if response.status_code == 200:
            data = response.json()
            logger.info(f"Email sent successfully. ID: {data.get('id')}")
            return data
        else:
            error_detail = response.text
            logger.error(f"Resend API error {response.status_code}: {error_detail}")
            raise RuntimeError(f"Email provider returned {response.status_code}: {error_detail}")

    except httpx.TimeoutException:
        raise RuntimeError("Email sending timed out")
    except httpx.RequestError as e:
        raise RuntimeError(f"Network error while sending email: {str(e)}")
