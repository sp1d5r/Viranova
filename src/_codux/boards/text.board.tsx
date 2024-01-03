import { createBoard } from '@wixc3/react-board';

export default createBoard({
    name: 'text',
    Board: () => <div></div>,
    isSnippet: true,
});
