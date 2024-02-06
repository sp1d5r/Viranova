import {HeroSection} from "../components/sections/hero-section/hero-section";
import {WhySection} from "../components/sections/why-section/why-section";
import {NewEraSection} from "../components/sections/new-era-section/new-era-section";
import React from "react";
import ScrollableLayout from "../layouts/ScrollableLayout";

export default function LandingPage(){
    return <ScrollableLayout>
        <HeroSection />
        <WhySection />
        <NewEraSection />
    </ScrollableLayout>
}