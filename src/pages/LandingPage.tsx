import {NavigationBar} from "../components/navigation-bar/navigation-bar";
import {HeroSection} from "../components/hero-section/hero-section";
import {WhySection} from "../components/why-section/why-section";
import {NewEraSection} from "../components/new-era-section/new-era-section";
import React from "react";
import ScrollableLayout from "../layouts/ScrollableLayout";

export default function LandingPage({}){
    return <ScrollableLayout>
        <HeroSection />
        <WhySection />
        <NewEraSection />
    </ScrollableLayout>
}