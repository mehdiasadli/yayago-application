export default function PrivacyPolicyPage() {
  return (
    <div className='mx-auto max-w-4xl px-4 py-12 md:py-16'>
      <div className='mb-8'>
        <h1 className='font-bold text-3xl tracking-tight md:text-4xl'>Privacy Policy</h1>
        <p className='mt-2 text-muted-foreground'>Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className='space-y-8 text-sm leading-relaxed md:text-base'>
        <section className='space-y-4'>
          <h2 className='font-semibold text-xl tracking-tight'>1. Introduction</h2>
          <p>
            Yayago Car Rental LLC ("we", "us", or "our") respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our YayaGO platform.
          </p>
          <p>
            This policy applies to all users of our website and mobile applications in the United Arab Emirates and globally.
          </p>
        </section>

        <section className='space-y-4'>
          <h2 className='font-semibold text-xl tracking-tight'>2. Information We Collect</h2>
          <p>We collect information that you provide directly to us, including:</p>
          <ul className='list-disc pl-5 space-y-2'>
            <li>
              <strong>Personal Identification:</strong> Name, email address, phone number, date of birth.
            </li>
            <li>
              <strong>Identity Documents:</strong> Copies of Passport, Emirates ID, or other government IDs for verification.
            </li>
            <li>
              <strong>Driving Information:</strong> Driving license details and history.
            </li>
            <li>
              <strong>Payment Information:</strong> Credit card details (processed securely by our payment processors, we do not store full card numbers).
            </li>
          </ul>
          <p className='mt-2'>
            We also automatically collect certain information about your device and usage of our Platform (IP address, device type, browser type).
          </p>
        </section>

        <section className='space-y-4'>
          <h2 className='font-semibold text-xl tracking-tight'>3. How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul className='list-disc pl-5 space-y-2'>
            <li>Facilitate bookings and process payments.</li>
            <li>Verify your identity and eligibility to rent vehicles.</li>
            <li>Communicate with you regarding your bookings, updates, and support.</li>
            <li>Improve our Platform and user experience.</li>
            <li>Comply with legal obligations in the UAE.</li>
          </ul>
        </section>

        <section className='space-y-4'>
          <h2 className='font-semibold text-xl tracking-tight'>4. Sharing of Information</h2>
          <p>We may share your information with:</p>
          <ul className='list-disc pl-5 space-y-2'>
            <li>
              <strong>Hosts/Partners:</strong> When you book a vehicle, we share your relevant details with the rental company to fulfill the contract.
            </li>
            <li>
              <strong>Service Providers:</strong> Third-party vendors who provide services such as payment processing, data analysis, and email delivery.
            </li>
            <li>
              <strong>Legal Authorities:</strong> When required by law or to protect our rights or the safety of others.
            </li>
          </ul>
        </section>

        <section className='space-y-4'>
          <h2 className='font-semibold text-xl tracking-tight'>5. Data Security</h2>
          <p>
            We implement reasonable security measures to protect your information. However, no transmission over the internet is completely secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section className='space-y-4'>
          <h2 className='font-semibold text-xl tracking-tight'>6. Your Rights</h2>
          <p>
            You have the right to access, correct, or delete your personal information. You can manage your account settings directly in the app or contact us for assistance.
          </p>
        </section>

        <section className='space-y-4'>
          <h2 className='font-semibold text-xl tracking-tight'>7. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page.
          </p>
        </section>

        <section className='space-y-4'>
          <h2 className='font-semibold text-xl tracking-tight'>8. Contact Us</h2>
          <p>
            If you have any questions or concerns about this Privacy Policy, please contact us at support@yayago.ae.
          </p>
        </section>
      </div>
    </div>
  );
}
