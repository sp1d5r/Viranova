import { createBoard } from '@wixc3/react-board';
import { SecondaryButton } from '../../../components/buttons/secondary-button/secondary-button';

export default createBoard({
    name: 'SecondaryButton',
    Board: () => <SecondaryButton onClick={(e) => {console.log("Here")}} />,
    isSnippet: true,
});
