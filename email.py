import smtplib
import json
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText


class TrustpilotTrigger:
    def __init__(self, smtp_server, smtp_port, sender_email, sender_password, trustpilot_afs_email):
        self.smtp_server = smtp_server
        self.smtp_port = smtp_port
        self.sender_email = sender_email
        self.sender_password = sender_password
        self.trustpilot_afs_email = trustpilot_afs_email

    def send_trigger(self, recipient_email, recipient_name, reference_id):
        
        # 1. JSON Payload (Contains the ACTUAL recipient info)
        tp_data = {
            "recipientEmail": recipient_email,
            "recipientName": recipient_name,
            "referenceId": reference_id
        }
        json_script = json.dumps(tp_data, indent=1)

        # 2. HTML Body
        # Note: Since Trustpilot sends the actual invite, this body is mostly 
        # for the JSON payload, unless your Trustpilot template uses snippets from here.
        html_content = f"""
        <html>
        <head>
        <script type='application/json+trustpilot'>
        {json_script}
        </script>
        </head>
        <body>
        <p>Triggering invitation for {recipient_name} ({reference_id}).</p>
        </body>
        </html>
        """

        # 3. Create Message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = f"Order {reference_id}" # Subject often used as Reference ID backup
        msg['From'] = self.sender_email
        
        # --- KEY CHANGE: Send ONLY to Trustpilot ---
        msg['To'] = self.trustpilot_afs_email

        part_html = MIMEText(html_content, 'html')
        msg.attach(part_html)

        # 4. Send
        try:
            if self.smtp_port == 465:
                server = smtplib.SMTP_SSL(self.smtp_server, self.smtp_port)
            else:
                server = smtplib.SMTP(self.smtp_server, self.smtp_port)
                server.starttls()

            server.login(self.sender_email, self.sender_password)
            
            # Send strictly to Trustpilot
            server.sendmail(self.sender_email, [self.trustpilot_afs_email], msg.as_string())
            print(f"Trigger sent to Trustpilot for customer: {recipient_email}")

        except Exception as e:
            print(f"Failed to send trigger: {e}")
        finally:
            try:
                server.quit()
            except:
                pass

# --- Usage ---
# sender = TrustpilotTrigger(..., trustpilot_afs_email="domain+12345@invite.trustpilot.com")
# sender.send_trigger("customer@gmail.com", "John Doe", "1234")