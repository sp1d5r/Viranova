import { createBoard } from '@wixc3/react-board';
import { PricingSection } from '../../../components/pricing-section/pricing-section';

export default createBoard({
    name: 'PricingSection',
    Board: () => <PricingSection />,
    isSnippet: true,
    environmentProps: {
        windowWidth: 1024,
        windowHeight: 768,
        canvasWidth: 911
    }
});
