import { createBoard } from '@wixc3/react-board';
import { QuickTurnaroundSection } from '../../../components/quick-turnaround-section/quick-turnaround-section';

export default createBoard({
    name: 'QuickTurnaroundSection',
    Board: () => <QuickTurnaroundSection />,
    isSnippet: true,
});
