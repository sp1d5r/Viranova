import { createBoard } from '@wixc3/react-board';
import { NewEraSection } from '../../../components/sections/new-era-section/new-era-section';

export default createBoard({
    name: 'NewEraSection',
    Board: () => <NewEraSection />,
    isSnippet: true,
    environmentProps: {
windowWidth: 802
}
});
