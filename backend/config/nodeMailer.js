import sibApiV3Sdk from 'sib-api-v3-sdk';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Initialize the Brevo API client
const defaultClient = sibApiV3Sdk.ApiClient.instance;

// Set up API key authentication using environment variable
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

// Create an instance of the Transactional Emails API
const transactionalEmailsApi = new sibApiV3Sdk.TransactionalEmailsApi();

/**
 * Sends an email using Brevo (Sendinblue) transactional email API.
 *
 * @async
 * @function sendEmail
 * @param {string} recipient - The recipient's email address.
 * @param {string} subject - The subject of the email.
 * @param {string} message - The content of the email body (plain text or HTML).
 * @returns {Promise<void>} Resolves when the email is sent or logs an error if sending fails.
 *
 * @example
 * sendEmail('user@example.com', 'Welcome!', 'This is your welcome message.');
 */
async function sendEmail(recipient, subject, message) {
  // Convert plain text line breaks to HTML if the message is plain text
  const isHtml = message.includes('<') && message.includes('>');
  let htmlContent;
  
  if (isHtml) {
    // If message already contains HTML tags, use it as is
    htmlContent = message;
  } else {
    // Convert plain text to HTML format
    const formattedMessage = message
      .replace(/\n\n/g, '</p><p>')  // Double line breaks become paragraph breaks
      .replace(/\n/g, '<br>')       // Single line breaks become <br> tags
      .trim();
    
    htmlContent = `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h3 style="color: #2c3e50; margin-bottom: 20px;">Hello,</h3>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
              <p style="margin: 0;">${formattedMessage}</p>
            </div>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #666; margin: 0;">
              This is an automated message from trackurIssue. Please do not reply to this email.
            </p>
          </div>
        </body>
      </html>
    `;
  }

  // Define the email payload
  const sendSmtpEmail = {
    sender: { 
      name: 'trackurIssue',
      email: 'argawmintesinot@gmail.com' // Change to your verified sender if needed
    },
    to: [{ email: recipient }],
    subject: subject,
    htmlContent: htmlContent
  };

  try {
    // Send the transactional email
    const response = await transactionalEmailsApi.sendTransacEmail(sendSmtpEmail);
    console.log('✅ Email sent successfully to:', recipient);
    return response;
  } catch (error) {
    // Log any errors that occur during sending
    console.error('❌ Failed to send email to:', recipient, error);
    throw error; // Re-throw to allow calling code to handle the error
  }
}

export default sendEmail;

// Example usage (uncomment to test):
// sendEmail('mintd060@gmail.com', 'Welcome!', 'This is a normal paragraph text below the hello.');
