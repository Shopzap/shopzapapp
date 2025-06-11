
import React from 'react';
import LandingNavbar from '@/components/landing/LandingNavbar';
import FooterSection from '@/components/landing/FooterSection';

const CookiePolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />
      
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold font-jakarta mb-8 text-center">
            Cookie Policy
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-muted-foreground text-center mb-12">
              Last updated: January 2025
            </p>

            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-bold font-jakarta mb-4">What Are Cookies?</h2>
                <p className="text-muted-foreground">
                  Cookies are small text files that are stored on your computer or mobile device when 
                  you visit our website. They help us provide you with a better experience by remembering 
                  your preferences and understanding how you use our service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold font-jakarta mb-4">Types of Cookies We Use</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold font-jakarta mb-2">Essential Cookies</h3>
                    <p className="text-muted-foreground">
                      These cookies are necessary for the website to function properly. They enable 
                      core functionality such as security, network management, and accessibility.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold font-jakarta mb-2">Performance Cookies</h3>
                    <p className="text-muted-foreground">
                      These cookies collect information about how you use our website, such as which 
                      pages you visit most often. This helps us improve our website's performance.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold font-jakarta mb-2">Functionality Cookies</h3>
                    <p className="text-muted-foreground">
                      These cookies allow our website to remember choices you make and provide enhanced, 
                      more personal features.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold font-jakarta mb-2">Targeting Cookies</h3>
                    <p className="text-muted-foreground">
                      These cookies are used to deliver relevant advertisements and measure the 
                      effectiveness of advertising campaigns.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold font-jakarta mb-4">Third-Party Cookies</h2>
                <p className="text-muted-foreground mb-4">
                  We may use third-party services that set cookies on our behalf:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Google Analytics - for website analytics</li>
                  <li>Razorpay - for payment processing</li>
                  <li>Social media platforms - for social sharing features</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold font-jakarta mb-4">Managing Cookies</h2>
                <p className="text-muted-foreground mb-4">
                  You can control and/or delete cookies as you wish. You can:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Delete all cookies that are already on your computer</li>
                  <li>Set your browser to prevent cookies from being placed</li>
                  <li>Accept or reject cookies on a case-by-case basis</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  Please note that if you delete cookies or refuse to accept them, you might not be 
                  able to use all of the features we offer.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold font-jakarta mb-4">Cookie Consent</h2>
                <p className="text-muted-foreground">
                  By continuing to use our website, you consent to our use of cookies as described 
                  in this policy. We will ask for your consent before setting any non-essential cookies.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold font-jakarta mb-4">Updates to This Policy</h2>
                <p className="text-muted-foreground">
                  We may update this Cookie Policy from time to time. Any changes will be posted on 
                  this page with an updated revision date.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold font-jakarta mb-4">Contact Us</h2>
                <p className="text-muted-foreground">
                  If you have any questions about our use of cookies, please contact us at:
                </p>
                <p className="text-muted-foreground mt-4">
                  Email: privacy@shopzap.io<br />
                  Address: Mumbai, Maharashtra, India
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>

      <FooterSection />
    </div>
  );
};

export default CookiePolicy;
