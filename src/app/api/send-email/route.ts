import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export const dynamic = 'force-static';
export const revalidate = false;

export async function POST(request: NextRequest) {
  try {
    const { to, subject, html, text, config } = await request.json();

    console.log('Email request received:', { to, subject, config: { ...config, smtp_password: '***' } });

    if (!to || !subject || !html || !config) {
      console.error('Missing required fields:', { to: !!to, subject: !!subject, html: !!html, config: !!config });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create transporter with proper SSL configuration
    const transporter = nodemailer.createTransport({
      host: config.smtp_host,
      port: config.smtp_port,
      secure: config.smtp_port === 465, // true for 465, false for other ports
      auth: {
        user: config.smtp_username,
        pass: config.smtp_password,
      },
      tls: {
        rejectUnauthorized: false, // Allow self-signed certificates
      },
      debug: true, // Enable debug logging
      logger: true, // Enable logger
    });

    // Test connection first
    console.log('Testing SMTP connection...');
    await transporter.verify();
    console.log('SMTP connection verified successfully');

    // Send email
    console.log('Sending email...');
    const info = await transporter.sendMail({
      from: `"${config.from_name}" <${config.from_email}>`,
      to,
      subject,
      html,
      text,
      headers: {
        'X-Mailer': 'PodDB Pro',
        'X-Priority': '3',
        'X-MSMail-Priority': 'Normal',
        'Importance': 'Normal',
        // Add Gravatar support for sender profile picture
        'X-Gravatar': 'true',
      },
      // Add reply-to header
      replyTo: config.from_email,
    });

    console.log('Email sent successfully:', info.messageId);

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
    });
  } catch (error: any) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email', details: error.message },
      { status: 500 }
    );
  }
}
