import { createBoard } from '@wixc3/react-board';
import { WhySection } from '../../../components/sections/why-section/why-section';

export default createBoard({
    name: 'WhySection Mobile',
    Board: () => <WhySection />,
    isSnippet: true,
    environmentProps: {
        windowWidth: 390,
        windowHeight: 844
    }
});
