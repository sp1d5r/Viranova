import { createBoard } from '@wixc3/react-board';
import { VideoAnalysisCard } from '../../../components/cards/video-analysis-card/video-analysis-card';

export default createBoard({
    name: 'VideoAnalysisCard',
    Board: () => <VideoAnalysisCard />,
    isSnippet: true,
});
