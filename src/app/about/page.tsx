
import { TechTemplate01Footer } from "@/components/templates/tech-01/footer";
import { TechTemplate01Header } from "@/components/templates/tech-01/header";
import { getActiveTemplate } from "@/lib/templates";

export default async function AboutPage() {
    const activeTemplate = await getActiveTemplate();
    const theme = activeTemplate ? activeTemplate.themeMode : 'dark';

    return (
        <div>
            {activeTemplate && <TechTemplate01Header config={activeTemplate} themeMode={theme} />}
            <main className="container mx-auto px-4 py-12 md:py-20">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-4xl font-bold font-headline mb-6">About Us</h1>
                    <div className="prose dark:prose-invert max-w-none space-y-4">
                        <p>
                            Welcome to our website! We are dedicated to providing the best content on a variety of topics that matter to you. Our mission is to inform, entertain, and inspire our readers through well-researched articles, guides, and insights.
                        </p>
                        <p>
                            Our team is composed of passionate writers, editors, and creators who are experts in their respective fields. We believe in the power of information and strive to deliver accurate, engaging, and up-to-date content.
                        </p>
                        <p>
                            Whether you're here to learn something new, find a solution to a problem, or simply explore your interests, we're glad to have you with us. Thank you for being a part of our community.
                        </p>
                    </div>
                </div>
            </main>
            {activeTemplate && <TechTemplate01Footer config={activeTemplate} themeMode={theme} />}
        </div>
    );
}
