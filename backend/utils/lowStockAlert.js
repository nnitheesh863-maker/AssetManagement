// utils/lowStockAlert.js
// Simple low‑stock alert utility. In a real system this would integrate with
// a toast/notification library on the frontend and an email service.
// For now we emit a console message and, if an EMAIL_ENABLED env var is set,
// simulate sending an email.

const nodemailer = require('nodemailer'); // optional, will be used only if config present

/**
 * Sends a low‑stock alert for the given inventory document.
 * @param {Object} inventory Mongoose document
 */
async function sendLowStockAlert(inventory) {
  try {
    const message = `⚠️ Low stock alert: ${inventory.productName || inventory.productId} has only ${inventory.availableQuantity} units left (minimum required ${inventory.minimumStock}).`;
    // In‑app toast – we just log; frontend can listen via socket.io or polling.
    console.log('[LowStockAlert]', message);

    // Email alert (optional)
    if (process.env.EMAIL_ENABLED === 'true') {
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'no-reply@shivfurniture.com',
        to: process.env.LOW_STOCK_ALERT_RECIPIENTS || '', // comma‑separated list
        subject: 'Low Stock Alert – Shiv Furniture ERP',
        text: message,
      };
      await transporter.sendMail(mailOptions);
    }
  } catch (err) {
    console.error('Failed to send low‑stock alert:', err);
  }
}

module.exports = { sendLowStockAlert };
