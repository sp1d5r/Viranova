import React from 'react';
import ScrollableLayout from "../layouts/ScrollableLayout";

const TermsOfServicePages = () => {
  return (
    <ScrollableLayout>
      <div className="text-white container flex flex-col gap-2">
        <h1 className="text-4xl font-bold">Terms of Service</h1>
        <p><em>Last updated: Mon 8th Jul 2024</em></p>

        <p>
          Welcome to ViraNova! These Terms of Service ("Terms") govern your use of our website located at
          <a className="text-primary underline" href="https://master.d2gor5eji1mb54.amplifyapp.com"> www.viranova.com</a>. and any related services provided by ViraNova ("we", "us", or "our"). By accessing or
          using our website and services, you agree to be bound by these Terms. If you do not agree with any part of
          these Terms, you must not use our website or services.
        </p>

        <h2 className="text-2xl font-bold my-2">1. Acceptance of Terms</h2>
        <p>
          By accessing or using ViraNova, you affirm that you are at least 18 years of age and have the legal capacity
          to enter into these Terms. If you are using our services on behalf of an entity, you represent and warrant
          that you have the authority to bind that entity to these Terms.
        </p>

        <h2 className="text-2xl font-bold my-2">2. Services Provided</h2>
        <p>
          ViraNova offers a clipping tool that takes videos from YouTube and automatically clips them into content
          suitable for TikTok through temporal segmentation. The services are provided through our website and may
          include a Flask backend and a React frontend.
        </p>

        <h2 className="text-2xl font-bold my-2">3. User Accounts</h2>
        <p>
          To access certain features of our services, you may need to create a user account. You agree to provide
          accurate, current, and complete information during the registration process and to update such information
          to keep it accurate, current, and complete. You are responsible for safeguarding your account password and
          for all activities that occur under your account.
        </p>

        <h2 className="text-2xl font-bold my-2">4. Use of Services</h2>
        <p>
          You agree to use our services only for lawful purposes and in accordance with these Terms. You shall not:
        </p>
        <ul>
          <li>Violate any applicable local, state, national, or international law.</li>
          <li>Infringe on the rights of others, including intellectual property rights.</li>
          <li>Use our services to upload, post, or distribute any content that is unlawful, defamatory, obscene, or otherwise objectionable.</li>
          <li>Engage in any conduct that restricts or inhibits anyone's use or enjoyment of the services, or which may harm ViraNova or its users.</li>
        </ul>

        <h2 className="text-2xl font-bold my-2">5. Content Ownership</h2>
        <p>
          You retain ownership of any videos or content you upload to our services. By using our services, you grant
          ViraNova a non-exclusive, worldwide, royalty-free, sublicensable, and transferable license to use, reproduce,
          distribute, prepare derivative works of, display, and perform the content in connection with providing the services.
        </p>

        <h2 className="text-2xl font-bold my-2">6. Intellectual Property</h2>
        <p>
          All content and materials available on our website, including but not limited to text, graphics, website
          name, code, images, and logos, are the intellectual property of ViraNova and are protected by applicable
          copyright and trademark laws. Any unauthorized use of our content is prohibited.
        </p>

        <h2 className="text-2xl font-bold my-2">7. Privacy Policy</h2>
        <p>
          Our Privacy Policy, which is incorporated into these Terms by reference, explains how we collect, use, and
          protect your information. By using our services, you agree to the terms of our Privacy Policy.
        </p>

        <h2 className="text-2xl font-bold my-2">8. Termination</h2>
        <p>
          We may terminate or suspend your account and access to our services, without prior notice or liability, for
          any reason, including if you breach these Terms. Upon termination, your right to use the services will immediately cease.
        </p>

        <h2 className="text-2xl font-bold my-2">9. Disclaimers and Limitation of Liability</h2>
        <p>
          Our services are provided "as is" and "as available" without warranties of any kind, either express or implied.
          ViraNova does not warrant that the services will be uninterrupted, error-free, or free of viruses or other harmful
          components. In no event shall ViraNova be liable for any indirect, incidental, special, consequential, or punitive
          damages, whether based on warranty, contract, tort, or any other legal theory, arising out of your use or inability
          to use the services.
        </p>

        <h2 className="text-2xl font-bold my-2">10. Governing Law</h2>
        <p>
          These Terms shall be governed and construed in accordance with the laws of the United Kingdom, without regard to its
          conflict of law provisions. Any disputes arising under or in connection with these Terms shall be resolved in the courts
          of the United Kingdom.
        </p>

        <h2 className="text-2xl font-bold my-2">11. Changes to Terms</h2>
        <p>
          We reserve the right to modify or replace these Terms at any time. We will provide notice of any changes by posting
          the new Terms on our website. Your continued use of the services after any such changes constitutes your acceptance
          of the new Terms.
        </p>

        <h2 className="text-2xl font-bold my-2">12. Contact Us</h2>
        <p>
          If you have any questions about these Terms, please contact us at <a className="text-primary underline" href={"mailto:elijahahmad03@gmail.com"}>elijahahmad03@gmail.com</a>.
        </p>

        <p>
          <strong>By using our website and services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.</strong>
        </p>
      </div>
    </ScrollableLayout>
  );
};

export default TermsOfServicePages;