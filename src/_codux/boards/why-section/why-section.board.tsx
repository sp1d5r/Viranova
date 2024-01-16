import { createBoard } from '@wixc3/react-board';
import { WhySection } from '../../../components/why-section/why-section';

export default createBoard({
    name: 'WhySection',
    Board: () => <WhySection />,
    isSnippet: true,
    environmentProps: {
        canvasWidth: 1135
    }
});
