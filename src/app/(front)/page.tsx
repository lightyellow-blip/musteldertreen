import ApproachSection from "@/components/front/ApproachSection";
import BrandIdentitySection from "@/components/front/BrandIdentitySection";
import ContactSection from "@/components/front/ContactSection";
import IntroHero from "@/components/front/IntroHero";
import OurPartnersSection from "@/components/front/OurPartnersSection";
import ValuePropositionSection from "@/components/front/ValuePropositionSection";

export default function HomePage() {
  return (
    <>
      <ApproachSection />
      <BrandIdentitySection />
      <ValuePropositionSection />
      <OurPartnersSection />
      <ContactSection />
      <IntroHero />
    </>
  );
}
