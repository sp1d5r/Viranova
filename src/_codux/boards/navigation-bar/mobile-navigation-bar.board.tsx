import { createBoard } from '@wixc3/react-board';
import { NavigationBar } from '../../../components/navigation-bar/navigation-bar';

export default createBoard({
    name: 'Mobile Navigation Bar',
    Board: () => <NavigationBar />,
    isSnippet: true,
    environmentProps: {
        windowWidth: 414,
        windowHeight: 896
    }
});
