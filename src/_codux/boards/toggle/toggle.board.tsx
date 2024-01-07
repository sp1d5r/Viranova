import { createBoard } from '@wixc3/react-board';
import { Toggle } from '../../../components/toggle/toggle';



export default createBoard({
    name: 'Toggle',
    Board: () => <Toggle active={true} name={"Toggle"} toggle={() => { }} />,
    isSnippet: true,
    environmentProps: {
        canvasWidth: 71
    }
});
