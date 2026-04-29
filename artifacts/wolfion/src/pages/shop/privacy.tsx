import { ShopLayout } from "@/components/shop-layout";
import { GlassCard } from "@/components/glass";

const FADE = "animate-in fade-in slide-in-from-bottom-4 duration-1000 fill-mode-both";

const SUPPORT_EMAIL = "wolfion@wolfion.com.au";
const EFFECTIVE_DATE = "29 April 2026";

export default function PrivacyPolicyPage() {
  return (
    <ShopLayout>
      <section className="container mx-auto px-5 py-16 sm:py-24 max-w-4xl">
        <div className={`mb-12 ${FADE}`}>
          <p className="text-[11px] uppercase tracking-[0.5em] text-neutral-500 mb-4">Legal</p>
          <h1 className="text-4xl sm:text-6xl font-light tracking-tight leading-[1.05]">
            Privacy <span className="font-serif italic">Policy</span>
          </h1>
          <p className="mt-4 text-sm text-neutral-500">Effective date: {EFFECTIVE_DATE}</p>
        </div>

        <GlassCard padding="p-7 sm:p-10" rounded="rounded-3xl">
          <div className="space-y-8 text-[15px] leading-[1.8] font-light text-neutral-800 dark:text-neutral-200">
            <p>
              This Privacy Policy explains how{" "}
              <span className="font-medium text-neutral-900 dark:text-neutral-50">Wolfion</span>{" "}
              ("we", "us", "our") collects, uses, and protects your personal information when you use our website,
              mobile application, and related services (together, the "Service"). By using the Service you agree
              to the practices described below.
            </p>

            <Section title="1. Information we collect">
              <p>We collect the following categories of information:</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>
                  <span className="font-medium">Account information</span> — your name, email address, and profile
                  details provided through Google, email sign-in, or our authentication provider (Clerk).
                </li>
                <li>
                  <span className="font-medium">Order information</span> — items you purchase, shipping address,
                  contact phone number, and order history.
                </li>
                <li>
                  <span className="font-medium">Payment information</span> — when you pay with bKash, Nagad, Rocket,
                  card, PayPal, UnionPay, or QR, the payment is processed by the respective payment provider. We
                  store only a reference to the transaction and a masked identifier (e.g. last four digits), never
                  full card numbers or wallet PINs.
                </li>
                <li>
                  <span className="font-medium">Device & usage data</span> — IP address, browser type, device model,
                  operating system, pages viewed, and basic analytics needed to keep the Service running and secure.
                </li>
                <li>
                  <span className="font-medium">Cookies & local storage</span> — used to keep you signed in,
                  remember your cart, and preserve preferences.
                </li>
              </ul>
            </Section>

            <Section title="2. How we use your information">
              <ul className="list-disc pl-6 space-y-2">
                <li>To create and manage your account.</li>
                <li>To process orders, payments, refunds, and deliveries.</li>
                <li>To provide customer support and respond to your enquiries.</li>
                <li>To send transactional messages (order confirmations, shipping updates, receipts).</li>
                <li>To detect, prevent, and investigate fraud or abuse of the Service.</li>
                <li>To comply with legal obligations (tax, accounting, consumer law).</li>
                <li>To improve our products, website, and mobile app.</li>
              </ul>
            </Section>

            <Section title="3. How we share your information">
              <p>
                We do not sell your personal information. We share it only with trusted service providers who
                help us operate the Service, including:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Authentication: <span className="font-medium">Clerk</span></li>
                <li>Hosting & infrastructure: <span className="font-medium">Replit</span></li>
                <li>Payment processors: <span className="font-medium">bKash, Nagad, Rocket, PayPal, UnionPay,</span> and card networks</li>
                <li>Shipping & courier partners (only the address and contact required for delivery)</li>
                <li>Government or law-enforcement authorities when required by law</li>
              </ul>
            </Section>

            <Section title="4. Data retention">
              <p>
                We keep your account information for as long as your account is active. Order, invoice, and
                payment records are retained for at least 7 years to meet tax and accounting obligations in
                Bangladesh and Australia. You may request deletion of your account at any time (see Section 7).
              </p>
            </Section>

            <Section title="5. Security">
              <p>
                We use industry-standard safeguards including HTTPS encryption in transit, encrypted storage
                of sensitive data, role-based access control, and signed authentication tokens. No system is
                100% secure; if you believe your account has been compromised, contact us immediately.
              </p>
            </Section>

            <Section title="6. Children's privacy">
              <p>
                The Service is not directed to children under the age of 13. We do not knowingly collect
                personal information from children. If you believe a child has provided us with personal
                information, please contact us and we will delete it.
              </p>
            </Section>

            <Section title="7. Your rights">
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Access the personal information we hold about you.</li>
                <li>Correct inaccurate or incomplete information.</li>
                <li>Request deletion of your account and associated data (subject to legal retention rules).</li>
                <li>Withdraw consent for marketing communications at any time.</li>
                <li>Lodge a complaint with your local data-protection authority.</li>
              </ul>
              <p className="mt-3">
                To exercise any of these rights, email us at{" "}
                <a href={`mailto:${SUPPORT_EMAIL}`} className="text-[#9C5872] dark:text-[#E8C5CD] underline">
                  {SUPPORT_EMAIL}
                </a>.
              </p>
            </Section>

            <Section title="8. International users">
              <p>
                Wolfion operates from <span className="font-medium">Bangladesh</span> and{" "}
                <span className="font-medium">Australia</span>. By using the Service you understand that your
                information may be transferred to, stored, and processed in these countries.
              </p>
            </Section>

            <Section title="9. Mobile app permissions">
              <p>
                Our Android app does not request camera, microphone, contacts, or location permissions. It uses
                only the network and storage permissions required to load the website and keep you signed in.
              </p>
            </Section>

            <Section title="10. Changes to this policy">
              <p>
                We may update this Privacy Policy from time to time. When we do, we will revise the "Effective
                date" at the top of this page. Continued use of the Service after changes means you accept the
                updated policy.
              </p>
            </Section>

            <Section title="11. Contact us">
              <p>
                If you have any questions about this Privacy Policy or how we handle your data, please contact:
              </p>
              <div className="mt-3 space-y-1">
                <p>
                  <span className="font-medium text-neutral-900 dark:text-neutral-50">Wolfion</span>
                </p>
                <p>
                  Email:{" "}
                  <a href={`mailto:${SUPPORT_EMAIL}`} className="text-[#9C5872] dark:text-[#E8C5CD] underline">
                    {SUPPORT_EMAIL}
                  </a>
                </p>
                <p>
                  Website:{" "}
                  <a
                    href="https://www.wolfion.com.au"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#9C5872] dark:text-[#E8C5CD] underline"
                  >
                    www.wolfion.com.au
                  </a>
                </p>
              </div>
            </Section>
          </div>
        </GlassCard>
      </section>
    </ShopLayout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-lg sm:text-xl font-medium text-neutral-900 dark:text-neutral-50 mb-3 tracking-tight">
        {title}
      </h2>
      <div className="text-neutral-700 dark:text-neutral-300">{children}</div>
    </div>
  );
}
