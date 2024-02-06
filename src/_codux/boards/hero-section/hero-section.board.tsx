import { createBoard } from '@wixc3/react-board';
import { HeroSection } from '../../../components/sections/hero-section/hero-section';

export default createBoard({
    name: 'LandingPage Board',
    Board: () => <HeroSection />,
    isSnippet: true,
});
