import { createBoard } from '@wixc3/react-board';
import { NavigationBar } from '../../components/navigation-bar/navigation-bar';
import { HeroSection } from '../../components/hero-section/hero-section';


export default createBoard({
    name: 'LandingPage',
    Board: () => <div>
        <NavigationBar />
        <HeroSection />
    </div>,
    isSnippet: true,
    environmentProps: {
        canvasHeight: 616,
        canvasWidth: 1008
    }
});
