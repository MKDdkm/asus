import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Problem from "@/components/Problem";
import Solution from "@/components/Solution";
import Workflow from "@/components/Workflow";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <Services />
        <Problem />
        <Solution />
        <Workflow />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
