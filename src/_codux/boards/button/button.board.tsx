import { createBoard } from '@wixc3/react-board';
import { PrimaryButton } from '../../../components/buttons/primary-button/primary-button';

export default createBoard({
    name: 'Button',
    Board: () => <PrimaryButton onClick={()=>{}} />,
    isSnippet: true,
    environmentProps: {
        canvasWidth: 179
    }
});
