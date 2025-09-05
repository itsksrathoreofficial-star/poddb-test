"use server";

import { getEmailConfig } from '@/app/actions/email-config';
import { sendEmail } from '@/lib/email-service-simple';
import { supabaseServer } from '@/integrations/supabase/server';

export async function submitContactForm(formData: FormData) {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const subject = formData.get('subject') as string;
    const message = formData.get('message') as string;
    
    console.log("New Contact Form Submission:", { name, email, subject, message });

    try {
        // Get email configuration
        const emailConfig = await getEmailConfig();
        console.log('Email config loaded:', emailConfig);
        
        if (!emailConfig) {
            console.error('No email configuration found');
            return { success: false, error: 'Email service not configured' };
        }

        if (!emailConfig.is_active) {
            console.error('Email service is inactive');
            return { success: false, error: 'Email service is disabled' };
        }

        // Check if incoming email is enabled
        if (!emailConfig.incoming_email_enabled || !emailConfig.incoming_email_address) {
            console.log('Incoming email notifications disabled or no address configured');
            // Still save to database but don't send email
        } else {
            // Send email to configured incoming address
            const emailSubject = `${emailConfig.incoming_email_subject_prefix || '[Contact Form]'} ${subject}`;
            const emailHtml = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                    <h2 style="color: #333;">New Contact Form Submission</h2>
                    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p><strong>Name:</strong> ${name}</p>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Subject:</strong> ${subject}</p>
                        <p><strong>Message:</strong></p>
                        <div style="background-color: white; padding: 15px; border-radius: 3px; margin-top: 10px;">
                            ${message.replace(/\n/g, '<br>')}
                        </div>
                    </div>
                    <p style="color: #666; font-size: 14px;">
                        This message was sent from your website contact form.
                    </p>
                </div>
            `;
            const emailText = `
New Contact Form Submission

Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}

This message was sent from your website contact form.
            `;

            console.log('Attempting to send email to:', emailConfig.incoming_email_address);
            const emailSent = await sendEmail(
                emailConfig.incoming_email_address,
                emailSubject,
                emailHtml,
                emailText,
                'contact_form'
            );

            if (!emailSent) {
                console.error('Failed to send contact form email');
                // Don't fail the form submission if email fails
            } else {
                console.log('Contact form email sent successfully');
            }
        }

        // Save to database (if table exists)
        try {
            const supabase = await supabaseServer();
            const { error: dbError } = await supabase
                .from('contact_submissions')
                .insert([{
                    name,
                    email,
                    subject,
                    message,
                    ip_address: null, // Could be added if needed
                    user_agent: null, // Could be added if needed
                }]);

            if (dbError) {
                console.error('Error saving contact submission to database:', dbError);
                // Don't fail the form submission if database save fails
            } else {
                console.log('Contact submission saved to database');
            }
        } catch (dbError) {
            console.error('Error saving contact submission to database:', dbError);
            // Don't fail the form submission if database save fails
        }

        return { success: true };
    } catch (error) {
        console.error('Error processing contact form submission:', error);
        return { success: false, error: 'An unexpected error occurred' };
    }
}
