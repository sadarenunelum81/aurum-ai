
import { TechTemplate01Footer } from "@/components/templates/tech-01/footer";
import { TechTemplate01Header } from "@/components/templates/tech-01/header";
import { getActiveTemplate } from "@/lib/templates";

export default async function PrivacyPolicyPage() {
    const activeTemplate = await getActiveTemplate();
    const theme = activeTemplate ? activeTemplate.themeMode : 'dark';

    return (
        <div>
            {activeTemplate && <TechTemplate01Header config={activeTemplate} themeMode={theme} />}
            <main className="container mx-auto px-4 py-12 md:py-20">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-4xl font-bold font-headline mb-6">Privacy Policy</h1>
                    <div className="prose dark:prose-invert max-w-none space-y-4">
                        <p>This Privacy Policy describes how your personal information is collected, used, and shared when you visit or make a purchase from our website.</p>
                        
                        <h2 className="text-2xl font-semibold">Personal Information We Collect</h2>
                        <p>When you visit the Site, we automatically collect certain information about your device, including information about your web browser, IP address, time zone, and some of the cookies that are installed on your device.</p>
                        
                        <h2 className="text-2xl font-semibold">How Do We Use Your Personal Information?</h2>
                        <p>We use the Order Information that we collect generally to fulfill any orders placed through the Site (including processing your payment information, arranging for shipping, and providing you with invoices and/or order confirmations). Additionally, we use this Order Information to communicate with you, screen our orders for potential risk or fraud, and when in line with the preferences you have shared with us, provide you with information or advertising relating to our products or services.</p>

                        <h2 className="text-2xl font-semibold">Sharing Your Personal Information</h2>
                        <p>We share your Personal Information with third parties to help us use your Personal Information, as described above. For example, we use Google Analytics to help us understand how our customers use the Site.</p>

                        <h2 className="text-2xl font-semibold">Your Rights</h2>
                        <p>If you are a European resident, you have the right to access personal information we hold about you and to ask that your personal information be corrected, updated, or deleted. If you would like to exercise this right, please contact us through the contact information below.</p>
                        
                        <h2 className="text-2xl font-semibold">Changes</h2>
                        <p>We may update this privacy policy from time to time in order to reflect, for example, changes to our practices or for other operational, legal or regulatory reasons.</p>
                        
                        <h2 className="text-2xl font-semibold">Contact Us</h2>
                        <p>For more information about our privacy practices, if you have questions, or if you would like to make a complaint, please contact us by e-mail or by mail using the details provided on our contact page.</p>
                    </div>
                </div>
            </main>
            {activeTemplate && <TechTemplate01Footer config={activeTemplate} themeMode={theme} />}
        </div>
    );
}
