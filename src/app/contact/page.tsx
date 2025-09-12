
import { TechTemplate01Footer } from "@/components/templates/tech-01/footer";
import { TechTemplate01Header } from "@/components/templates/tech-01/header";
import { getActiveTemplate } from "@/lib/templates";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default async function ContactPage() {
    const activeTemplate = await getActiveTemplate();
    const theme = activeTemplate ? activeTemplate.themeMode : 'dark';

    return (
        <div>
            {activeTemplate && <TechTemplate01Header config={activeTemplate} themeMode={theme} />}
            <main className="container mx-auto px-4 py-12 md:py-20">
                <div className="max-w-2xl mx-auto">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-3xl font-bold font-headline">Contact Us</CardTitle>
                            <CardDescription>Have a question or feedback? Fill out the form below to get in touch with us.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input id="name" placeholder="Your Name" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" placeholder="your@email.com" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="message">Message</Label>
                                    <Textarea id="message" placeholder="Your message..." rows={5} />
                                </div>
                                <Button type="submit" className="w-full">Send Message</Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </main>
            {activeTemplate && <TechTemplate01Footer config={activeTemplate} themeMode={theme} />}
        </div>
    );
}
