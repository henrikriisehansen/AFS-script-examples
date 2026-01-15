const nodemailer = require('nodemailer');

class TrustpilotEmailSender {
  /**
   * @param {Object} smtpConfig - Object containing host, port, secure, auth { user, pass }
   * @param {string} trustpilotAfsEmail - Your unique address (unique@email.com)
   * @param {boolean} afsAsBcc - If true, sends to Trustpilot as BCC (invisible to customer).
   */
  constructor(smtpConfig, trustpilotAfsEmail, afsAsBcc = true) {
    this.transporter = nodemailer.createTransport(smtpConfig);
    this.trustpilotAfsEmail = trustpilotAfsEmail;
    this.afsAsBcc = afsAsBcc;
  }

  /**
   * Sends an HTML email containing the Trustpilot JSON-LD script.
   * @param {string} recipientEmail 
   * @param {string} recipientName 
   * @param {string} referenceId 
   */
  async sendEmail(recipientEmail, recipientName, referenceId) {
try {
      // 1. Prepare the JSON payload
      const tpData = {
        recipientEmail: recipientEmail,
        recipientName: recipientName,
        referenceId: referenceId
      };
      
      // JSON.stringify handles escaping of special characters automatically
      const jsonScript = JSON.stringify(tpData, null, 2);

      // 2. Construct the HTML
      // We inject the script into the head
      const htmlContent = `
        <html>
        <head>
          <script type='application/json+trustpilot'>
            ${jsonScript}
          </script>
        </head>
        <body>
          <p>Hi ${recipientName}!<br>
          How are you?<br>
          </p>
        </body>
        </html>
      `;

      // 3. Configure Message Options (To/BCC Logic)
      const mailOptions = {
        from: this.transporter.options.auth.user, // Defaults to authenticated user
        subject: "Feedback Request",
        html: htmlContent,
      };

      if (this.afsAsBcc) {
        // BCC MODE: Customer sees only themselves in 'To'. Trustpilot is hidden in 'Bcc'.
        mailOptions.to = recipientEmail;
        mailOptions.bcc = this.trustpilotAfsEmail;
      } else {
        // DIRECT MODE: Both emails appear in the 'To' header.
        mailOptions.to = [recipientEmail, this.trustpilotAfsEmail];
      }

      // 4. Send
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`Email sent successfully. Message ID: ${info.messageId}`);
      return info;

    } catch (error) {
      console.error("Failed to send email:", error);
      throw error;
    }
  }
}

// --- Usage Example ---

// 1. Configuration
const smtpConfig = {
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: "your_email@gmail.com",
    pass: "your_app_password" // Use App Password for Gmail
  }
};

const TRUSTPILOT_EMAIL = "example.com+123456@invite.trustpilot.com";

// 2. Initialize Sender
// afsAsBcc: true (Recommended) -> Trustpilot receives a copy blindly.
const sender = new TrustpilotEmailSender(smtpConfig, TRUSTPILOT_EMAIL, true);

// 3. Execute (Wrapped in async function)
(async () => {
  await sender.sendEmail(
    "customer@example.com",
    "John Doe",
    "ORDER-1001"
  );
})();
console.log(generateHtml(payload));

