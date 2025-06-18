// Import the Brevo (Sendinblue) SDK
import SibApiV3Sdk from 'sib-api-v3-sdk';

// Initialize the default API client instance
const defaultClient = SibApiV3Sdk.ApiClient.instance;

// Configure the API key authentication using your environment variable
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

// Create an instance of the TransactionalEmailsApi
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

/**
 * Sends an email using Brevo (Sendinblue)
 * 
 * @param {string} to - Recipient email address
 * @param {string} subject - Subject line of the email
 * @param {string} text - Plain text version of the email content
 * @param {string} [html] - Optional HTML content for rich formatting
 * @param {string} [receiverName] - Optional name of the recipient
 * @returns {Promise<Object>} - Returns the API response object if email is sent successfully
 * @throws {Error} - Throws an error if the email fails to send
 */
const sendEmail = async (to, subject, text, html = null, receiverName = null) => {
  // Validate required parameters
  if (!to || !subject || !text) {
    throw new Error('Missing required parameters: to, subject, and text are required');
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(to)) {
    throw new Error('Invalid email format');
  }
  // Create a new SendSmtpEmail object which holds all email content
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

  // Set the sender details (name and email address), falling back to default values
  sendSmtpEmail.sender = {
    name: process.env.EMAIL_SENDER_NAME || 'Trackurissue',
    email: process.env.EMAIL_SENDER_ADDRESS || 'no-reply@yourdomain.com'
  };

  // Set the recipient (email and optional name)
  sendSmtpEmail.to = [
    {
      email: to,
      name: receiverName || to // If receiverName is not provided, use the email as the name
    }
  ];

  // Set the subject and plain text content of the email
  sendSmtpEmail.subject = subject;
  sendSmtpEmail.textContent = text;

  // Optionally add HTML content if provided
  if (html) {
    sendSmtpEmail.htmlContent = html;
  }

  try {
    // Attempt to send the email through the API
    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);

    // Log the successful response
    console.log('Email sent successfully:', {
      messageId: response.messageId,
      to,
      subject
    });

    // Return the API response
    return response;
  } catch (error) {
    // Log the error details
    console.error('Failed to send email:', {
      to,
      subject,
      error: error.message || error
    });

    // Rethrow a new error to notify calling code of failure
    throw new Error('Email sending failed');
  }
};

// Export the sendEmail function as the default export
export default sendEmail;
