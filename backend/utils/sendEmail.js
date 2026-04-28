const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/**
 * Send an assignment notification email to a delivery agent.
 * @param {Object} options
 * @param {string} options.agentEmail  - Recipient email address
 * @param {string} options.agentName   - Delivery agent's name
 * @param {string} options.orderId     - Order ID string
 * @param {string} options.customerName - Customer's name
 * @param {string} options.deliveryAddress - Delivery address
 * @param {string} options.totalAmount  - Order total (formatted string)
 * @param {Array}  options.items        - Array of { name, quantity, price }
 */
const sendAssignmentEmail = async ({
    agentEmail,
    agentName,
    orderId,
    customerName,
    deliveryAddress,
    totalAmount,
    items = [],
}) => {
    const itemRows = items
        .map(
            (item) =>
                `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;">${item.name}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:center;">${item.quantity}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:right;">₹${item.price}</td>
        </tr>`
        )
        .join('');

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>New Order Assigned</title>
</head>
<body style="margin:0;padding:0;background:#f4f7fb;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fb;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#ff6b35,#f7c59f);padding:36px 40px;text-align:center;">
              <h1 style="margin:0;color:#fff;font-size:28px;letter-spacing:1px;">🛵 QuickBite Delivery</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.9);font-size:15px;">New Order Assigned to You</p>
            </td>
          </tr>
          <!-- Greeting -->
          <tr>
            <td style="padding:32px 40px 16px;">
              <p style="margin:0;font-size:17px;color:#333;">Hi <strong>${agentName}</strong>,</p>
              <p style="margin:12px 0 0;color:#555;font-size:15px;line-height:1.6;">
                The admin has assigned you a new delivery order. Please review the details below and head to the restaurant for pickup.
              </p>
            </td>
          </tr>
          <!-- Order Info Card -->
          <tr>
            <td style="padding:8px 40px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff9f5;border:1px solid #ffe0cc;border-radius:10px;overflow:hidden;">
                <tr>
                  <td style="padding:16px 20px;border-bottom:1px solid #ffe0cc;">
                    <span style="color:#ff6b35;font-weight:700;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">Order ID</span><br/>
                    <span style="color:#333;font-size:15px;font-weight:600;">#${orderId}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 20px;border-bottom:1px solid #ffe0cc;">
                    <span style="color:#ff6b35;font-weight:700;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">Customer</span><br/>
                    <span style="color:#333;font-size:15px;">${customerName}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 20px;border-bottom:1px solid #ffe0cc;">
                    <span style="color:#ff6b35;font-weight:700;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">📍 Delivery Address</span><br/>
                    <span style="color:#333;font-size:15px;">${deliveryAddress}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 20px;">
                    <span style="color:#ff6b35;font-weight:700;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">💰 Total Amount</span><br/>
                    <span style="color:#333;font-size:18px;font-weight:700;">₹${totalAmount}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Items Table -->
          <tr>
            <td style="padding:0 40px 32px;">
              <p style="margin:0 0 12px;font-weight:700;color:#333;font-size:15px;">🍽️ Order Items</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #f0f0f0;border-radius:8px;overflow:hidden;">
                <tr style="background:#f8f8f8;">
                  <th style="padding:10px 12px;text-align:left;color:#666;font-size:13px;font-weight:600;">Item</th>
                  <th style="padding:10px 12px;text-align:center;color:#666;font-size:13px;font-weight:600;">Qty</th>
                  <th style="padding:10px 12px;text-align:right;color:#666;font-size:13px;font-weight:600;">Price</th>
                </tr>
                ${itemRows}
              </table>
            </td>
          </tr>
          <!-- CTA Button -->
          <tr>
            <td style="padding:0 40px 40px;text-align:center;">
              <p style="margin:0 0 20px;color:#888;font-size:13px;">Log in to the QuickBite app to view and manage this delivery.</p>
              <a href="${process.env.CLIENT_URL}" style="display:inline-block;background:linear-gradient(135deg,#ff6b35,#f7931e);color:#fff;font-size:15px;font-weight:700;padding:14px 36px;border-radius:50px;text-decoration:none;letter-spacing:0.5px;">Open QuickBite App</a>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#fafafa;padding:20px 40px;text-align:center;border-top:1px solid #f0f0f0;">
              <p style="margin:0;color:#aaa;font-size:12px;">© 2024 QuickBite Food Delivery. All rights reserved.</p>
              <p style="margin:4px 0 0;color:#aaa;font-size:12px;">This is an automated notification. Please do not reply.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    await transporter.sendMail({
        from: `"QuickBite Admin 🍔" <${process.env.EMAIL_USER}>`,
        to: agentEmail,
        subject: `🛵 New Delivery Assigned – Order #${orderId}`,
        html,
    });
};

module.exports = { sendAssignmentEmail };
