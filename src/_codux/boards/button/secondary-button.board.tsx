import { createBoard } from '@wixc3/react-board';
import { SecondaryButton } from '../../../components/secondary-button/secondary-button';

export default createBoard({
    name: 'SecondaryButton',
    Board: () => <SecondaryButton />,
    isSnippet: true,
});
