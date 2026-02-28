import { Hero } from "@/app/components/Hero";
import { StickyOrderButton } from "@/app/components/StickyOrderButton";
import { ProductCards } from "@/app/components/ProductCards";
import { HowItWorks } from "@/app/components/HowItWorks";
import { PolicyBanner } from "@/app/components/PolicyBanner";
import { OrderForm } from "@/app/components/OrderForm";
import { ServiceArea } from "@/app/components/ServiceArea";
import { FAQ } from "@/app/components/FAQ";
import { Contact } from "@/app/components/Contact";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Hero />
      <div className="mx-auto max-w-5xl px-4 pb-20">
        <ProductCards />
        <HowItWorks />
        <PolicyBanner />
        <OrderForm />
        <ServiceArea />
        <FAQ />
        <Contact />
      </div>
      <StickyOrderButton />
    </main>
  );
}