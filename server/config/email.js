const nodemailer = require('nodemailer');
const Notification = require('../models/Notification');

/**
 * Centralized Nodemailer transporter using SMTP_* environment variables.
 * Supports Gmail App Passwords (spaces removed automatically).
 */
const createTransporter = () => {
  const smtpPass = (process.env.SMTP_PASS || '').replace(/\s/g, '');
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || '',
      pass: smtpPass
    },
    tls: {
      rejectUnauthorized: false // allow self-signed certs in dev
    }
  });
};

/**
 * Send email and log the attempt to the Notification collection.
 * Implements Requirement 4: Notification Failure Handling with retry logging.
 *
 * @param {string} recipient - Destination email address
 * @param {string} subject - Email subject line
 * @param {string} body - Plain-text body
 * @param {string} html - Optional HTML body
 * @returns {Promise<boolean>} - true if sent, false if failed (logged for retry)
 */
const sendEmailWithRetry = async (recipient, subject, body, html = null) => {
  // Create a notification log entry with 'retrying' status
  let log;
  try {
    log = await Notification.create({ recipient, subject, body, status: 'retrying' });
  } catch (logErr) {
    console.error('Failed to create notification log:', logErr.message);
  }

  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: `"${process.env.FROM_NAME || 'HealSync'}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
      to: recipient,
      subject,
      text: body,
      ...(html && { html })
    };

    await transporter.sendMail(mailOptions);

    if (log) {
      log.status = 'sent';
      log.sentAt = new Date();
      await log.save();
    }
    return true;
  } catch (error) {
    console.error(`Email send failed to ${recipient}: ${error.message}. Logged for retry.`);
    if (log) {
      log.status = 'failed';
      log.errorLog = error.message;
      await log.save();
    }
    return false;
  }
};

module.exports = { sendEmailWithRetry, createTransporter };
