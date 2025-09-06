
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Enable static generation for maximum performance
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour

import { HelpCircle, UserCheck, Podcast } from 'lucide-react';
import Link from 'next/link';
import { VerifiedBadge } from '@/components/VerifiedBadge';

export default function VerificationPolicyPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <header className="mb-12 text-center">
        <HelpCircle className="mx-auto h-16 w-16 text-primary mb-4" />
        <h1 className="text-5xl font-bold tracking-tighter">Verification Help Center</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Everything you need to know about getting verified on PodDB Pro.
        </p>
      </header>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <VerifiedBadge className="h-6 w-6" />
              What is Verification?
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-invert max-w-none">
            <p>
              The verification badge <VerifiedBadge className="inline-block h-5 w-5" /> on PodDB lets people know that a podcast or creator profile is authentic and officially managed by the creators themselves. It builds trust and helps distinguish official pages from fan-made or community-contributed pages.
            </p>
            <p>
              A verified page means our team has confirmed that the page represents the genuine presence of the public figure or brand it represents.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Who Can Get Verified?</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-invert max-w-none">
            <p>We verify two types of entities on PodDB:</p>
            <ul>
              <li>
                <strong><Podcast className="inline-block h-5 w-5 mr-1" /> Podcasts:</strong> The podcast page must represent a real, established podcast. The person applying must be an authorized representative (e.g., host, producer, owner).
              </li>
              <li>
                <strong><UserCheck className="inline-block h-5 w-5 mr-1" /> People:</strong> Creator profiles for notable individuals in the podcasting industry, such as hosts, well-known guests, and producers.
              </li>
            </ul>
            <p>To be eligible, your account must also be complete, meaning you have a bio, a profile photo, and have been active on our platform.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How to Apply for Verification</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-invert max-w-none">
            <p>Applying for verification is a straightforward process:</p>
            <ol>
              <li>
                <strong>Navigate to Your Profile:</strong> Log in and go to your <Link href="/profile">Profile Page</Link>.
              </li>
              <li>
                <strong>Go to the &apos;Verification&apos; Tab:</strong> Click on the &quot;Verification&quot; tab to open the application form.
              </li>
              <li>
                <strong>Select What to Verify:</strong> Choose whether you want to verify a podcast you&apos;ve submitted or your own creator profile.
              </li>
              <li>
                <strong>Choose the Specific Item:</strong> Select the exact podcast or profile from the dropdown list. The item must already exist on PodDB.
              </li>
              <li>
                <strong>Provide Supporting Information:</strong> In the &quot;Notes&quot; section, provide links and information that help us confirm your identity and association with the item you&apos;re verifying. Good examples include:
                <ul>
                  <li>A link to your official website that lists the podcast.</li>
                  <li>Links to official social media profiles (e.g., Twitter, Instagram).</li>
                  <li>A link to an article or press release about you or your podcast.</li>
                </ul>
              </li>
              <li>
                <strong>Submit Your Request:</strong> Once you&apos;ve filled out the form, click &quot;Submit Request&quot;. Our team will review it.
              </li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What Happens After I Apply?</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-invert max-w-none">
            <p>
              After you submit your request, our team will manually review your application and the provided information. This process can take several business days.
            </p>
            <p>
              You can track the status of your request in the &quot;Your Verification Requests&quot; section on your profile&apos;s verification tab. We will notify you once a decision has been made.
            </p>
            <p>
              Please note that PodDB reserves the right to remove verification at any time if an account violates our terms of service or community guidelines. Submitting false information during the verification process will result in your request being denied and may lead to further action.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
