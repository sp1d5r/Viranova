import React from 'react';
import ScrollableLayout from "../layouts/ScrollableLayout";

const PrivacyPolicyPage = () => {
  return (
    <ScrollableLayout>
      <div className="text-white container flex flex-col gap-2">
        <h1 className="text-4xl font-bold">Privacy Policy</h1>
        <p><em>Last updated: Mon 8th Jul 2024</em></p>

        <p>
          ViraNova ("we", "us", or "our") is committed to protecting and respecting your privacy. This Privacy Policy explains
          how we collect, use, and safeguard your information when you visit our website <a className="text-primary underline" href="https://master.d2gor5eji1mb54.amplifyapp.com"> www.viranova.com</a> and use our services.
          By using our website and services, you agree to the collection and use of information in accordance with this policy.
        </p>

        <h2 className="text-2xl font-bold my-2">1. Information We Collect</h2>
        <p>We may collect and process the following personal data about you:</p>
        <ul>
          <li><strong>Name</strong></li>
          <li><strong>Email address</strong></li>
          <li><strong>IP address</strong></li>
          <li><strong>Device information</strong></li>
        </ul>

        <h2 className="text-2xl font-bold my-2">2. How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Improve our services</li>
          <li>Track user experience</li>
          <li>Monitor and fix errors</li>
        </ul>

        <h2 className="text-2xl font-bold my-2">3. Data Sharing</h2>
        <p>We do not share your personal data with third parties.</p>

        <h2 className="text-2xl font-bold my-2">4. Data Retention</h2>
        <p>We retain your personal data for one year. After this period, your data is deleted from our systems.</p>

        <h2 className="text-2xl font-bold my-2">5. Your Rights</h2>
        <p>You have the right to:</p>
        <ul>
          <li>Access the data we hold about you</li>
          <li>Correct any inaccuracies in your data</li>
          <li>Delete your data from our platform</li>
        </ul>
        <p>These rights can be exercised through your account management application.</p>

        <h2 className="text-2xl font-bold my-2">6. Cookies</h2>
        <p>We use cookies to:</p>
        <ul>
          <li>Track user experience</li>
          <li>Monitor and fix errors</li>
        </ul>

        <h2 className="text-2xl font-bold my-2">7. Security Measures</h2>
        <p>We implement a range of security measures to protect your personal data, including:</p>
        <ul>
          <li>Encryption</li>
          <li>Use of Firebase for secure data storage</li>
          <li>JWT tokens to prevent unauthorized access</li>
        </ul>

        <h2 className="text-2xl font-bold my-2">8. Contact Information</h2>
        <p>
          If you have any questions or concerns about this Privacy Policy or our data practices, please contact us at:
        </p>
        <address>
          <strong>ViraNova</strong><br />
          Elijah Ahmad<br />
          Email: <a className="text-primary underline" href="mailto:elijahahmad03@gmail.com">elijahahmad03@gmail.com</a><br />
        </address>
      </div>
    </ScrollableLayout>
  );
};

export default PrivacyPolicyPage;