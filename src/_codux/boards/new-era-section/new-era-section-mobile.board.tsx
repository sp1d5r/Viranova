import { createBoard } from '@wixc3/react-board';
import { NewEraSection } from '../../../components/sections/new-era-section/new-era-section';

export default createBoard({
    name: 'NewEraSection Mobile',
    Board: () => <NewEraSection />,
    isSnippet: true,
    environmentProps: {
        windowWidth: 390,
        windowHeight: 844
    }
});
