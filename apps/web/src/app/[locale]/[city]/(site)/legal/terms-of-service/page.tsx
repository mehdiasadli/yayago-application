export default function TermsOfServicePage() {
  return (
    <div className='mx-auto max-w-4xl px-4 py-12 md:py-16'>
      <div className='mb-8'>
        <h1 className='font-bold text-3xl tracking-tight md:text-4xl'>Terms of Service</h1>
        <p className='mt-2 text-muted-foreground'>Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className='space-y-8 text-sm leading-relaxed md:text-base'>
        <section className='space-y-4'>
          <h2 className='font-semibold text-xl tracking-tight'>1. Introduction</h2>
          <p>
            Welcome to YayaGO. These Terms of Service ("Terms") govern your use of the YayaGO website, mobile application, and services (collectively, the "Platform"), operated by Yayago Car Rental LLC ("Company", "we", "us", or "our"), a company registered in Dubai, United Arab Emirates.
          </p>
          <p>
            By accessing or using our Platform, you agree to be bound by these Terms. If you do not agree to these Terms, you may not use our Services.
          </p>
        </section>

        <section className='space-y-4'>
          <h2 className='font-semibold text-xl tracking-tight'>2. The Marketplace</h2>
          <p>
            YayaGO operates as a marketplace that connects vehicle rental companies ("Hosts" or "Partners") with individuals seeking to rent vehicles ("Renters" or "Users"). We are not a rental car company and do not own the vehicles listed on our Platform. We act as an intermediary to facilitate the booking process.
          </p>
          <p>
            The actual rental contract is concluded directly between the Renter and the Host. YayaGO is not a party to the rental agreement and is not responsible for the condition of the vehicles or the performance of the rental contract.
          </p>
        </section>

        <section className='space-y-4'>
          <h2 className='font-semibold text-xl tracking-tight'>3. User Accounts</h2>
          <p>
            To use certain features of the Platform, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
          </p>
          <p>
            You are responsible for safeguarding your password and for all activities that occur under your account. You agree to immediately notify us of any unauthorized use of your account.
          </p>
        </section>

        <section className='space-y-4'>
          <h2 className='font-semibold text-xl tracking-tight'>4. Eligibility and Verification</h2>
          <ul className='list-disc pl-5 space-y-2'>
            <li>
              <strong>For Renters:</strong> You must be at least 21 years old (or older depending on the vehicle category), hold a valid driving license recognized in the UAE, and have a valid payment method.
            </li>
            <li>
              <strong>For Hosts:</strong> You must be a registered business with a valid trade license and RTA permits to operate a car rental business in the UAE.
            </li>
          </ul>
          <p>
            We reserve the right to request identity verification documents (e.g., Passport, Emirates ID, Driving License) at any time.
          </p>
        </section>

        <section className='space-y-4'>
          <h2 className='font-semibold text-xl tracking-tight'>5. Booking and Payments</h2>
          <p>
            When you book a vehicle, you agree to pay the total fees presented to you, which may include the rental rate, insurance, security deposit, and applicable taxes/fees.
          </p>
          <p>
            <strong>Cancellation Policy:</strong> Cancellations are subject to the specific policy selected by the Host for the listing. Details are provided at the time of booking.
          </p>
        </section>

        <section className='space-y-4'>
          <h2 className='font-semibold text-xl tracking-tight'>6. Prohibited Activities</h2>
          <p>
            Users agree not to use the Platform for any unlawful purpose, to harass others, to create false bookings, or to scrape data from our Platform. Misuse of the Platform may result in immediate suspension or termination of your account.
          </p>
        </section>

        <section className='space-y-4'>
          <h2 className='font-semibold text-xl tracking-tight'>7. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by UAE law, Yayago Car Rental LLC shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses.
          </p>
        </section>

        <section className='space-y-4'>
          <h2 className='font-semibold text-xl tracking-tight'>8. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the Emirate of Dubai and the Federal Laws of the United Arab Emirates. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the Dubai Courts.
          </p>
        </section>

        <section className='space-y-4'>
          <h2 className='font-semibold text-xl tracking-tight'>9. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at support@yayago.ae.
          </p>
        </section>
      </div>
    </div>
  );
}
