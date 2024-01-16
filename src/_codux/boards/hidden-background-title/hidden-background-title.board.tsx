import { createBoard } from '@wixc3/react-board';
import { HiddenBackgroundTitle } from '../../../components/hidden-background-title/hidden-background-title';

export default createBoard({
    name: 'HiddenBackgroundTitle',
    Board: () => <HiddenBackgroundTitle />,
    isSnippet: true,
});
