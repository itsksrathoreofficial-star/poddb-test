"use client";

import React from 'react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/components/AuthProvider';
import { Mail, Loader2, Send } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { submitContactForm } from '@/app/actions/contact';
import { useFormStatus } from 'react-dom';

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <Button type="submit" variant="hero" size="lg" disabled={pending}>
            {pending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Send className="mr-2 h-5 w-5" />}
            Send Message
        </Button>
    );
}

export default function ContactPage() {
    const { user } = useAuth();
    const formRef = React.useRef<HTMLFormElement>(null);

    const handleFormAction = async (formData: FormData) => {
        const result = await submitContactForm(formData);
        if (result.success) {
            toast.success("Message Sent!", {
                description: "Thank you for contacting us. We will get back to you shortly.",
            });
            formRef.current?.reset();
        } else {
            toast.error("Failed to send message", {
                description: "An unexpected error occurred. Please try again.",
            });
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader className="text-center">
                    <Mail className="mx-auto h-12 w-12 text-primary mb-4" />
                    <CardTitle className="text-3xl">Contact Support</CardTitle>
                    <CardDescription>
                        Have a question or need help? Fill out the form below and we&apos;ll get back to you.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form ref={formRef} action={handleFormAction} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" name="name" placeholder="Your Name" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input id="email" name="email" type="email" placeholder="your@email.com" defaultValue={user?.email || ''} required />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="subject">Subject</Label>
                            <Input id="subject" name="subject" placeholder="How can we help?" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="message">Message</Label>
                            <Textarea id="message" name="message" placeholder="Please describe your issue in detail..." rows={6} required />
                        </div>
                        <div className="text-right">
                           <SubmitButton />
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
