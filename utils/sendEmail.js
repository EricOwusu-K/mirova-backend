const { Resend } = require('resend')

const resend = new Resend(process.env.RESEND_API_KEY)

const sendOtpEmail = async (to, otp, name = '') => {
  const { error } = await resend.emails.send({
    from: 'Mirova Jewellery <onboarding@resend.dev>',
    to,
    subject: 'Your Mirova Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #faf9f7;">
        <h1 style="color: #1a1a1a; font-family: Georgia, serif; letter-spacing: 3px; font-size: 24px; text-align: center;">MIROVA</h1>
        <p style="color: #888; text-align: center; letter-spacing: 2px; font-size: 12px; margin-top: -8px;">JEWELRY</p>
        <div style="background: #ffffff; border: 1px solid #e8e8e8; border-radius: 8px; padding: 32px; margin-top: 24px; text-align: center;">
          <p style="color: #1a1a1a; font-size: 15px;">Hello${name ? ' ' + name : ''},</p>
          <p style="color: #555; font-size: 14px;">Your verification code is:</p>
          <p style="font-size: 36px; letter-spacing: 10px; font-weight: bold; color: #1a1a1a; margin: 24px 0;">${otp}</p>
          <p style="color: #888; font-size: 13px;">This code expires in 10 minutes.</p>
        </div>
        <p style="color: #aaa; font-size: 11px; text-align: center; margin-top: 24px;">This is an automated message. Please do not reply to this email.</p>
        <p style="color: #aaa; font-size: 11px; text-align: center;">© 2026 Mirova Jewelry. All Rights Reserved.</p>
      </div>
    `,
  })

  if (error) {
    throw new Error(error.message || 'Failed to send email')
  }
}

module.exports = sendOtpEmail