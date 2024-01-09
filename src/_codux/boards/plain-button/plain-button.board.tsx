import { createBoard } from '@wixc3/react-board';
import { PlainButton } from '../../../components/plain-button/plain-button';

export default createBoard({
    name: 'PlainButton',
    Board: () => <PlainButton className="bg-accent border-white border" text="Sample Plain Button" icon="" textClassName="font-bold"/>,
    isSnippet: true,
});
