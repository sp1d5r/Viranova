
import { createBoard } from '@wixc3/react-board';
import { PricingCard } from '../../../components/pricing-card/pricing-card';

export default createBoard({
    name: 'PricingCard',
    Board: () => <PricingCard features={[{ available: true, featureDescription: "Create 200 shorts a month" }]} />,
    isSnippet: true,
    environmentProps: {
        canvasHeight: 275
    }
});
