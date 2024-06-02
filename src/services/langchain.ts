import { Client } from "langsmith";

const LangSmithFeedback = (() => {
  const client = new Client({apiKey: process.env.REACT_APP_LANGCHAIN_API_KEY});

  return {
    async addFeedback({runId, score, comment = ""}: {runId: string, score: number, comment?: string}) {
      await client.createFeedback(runId, "feedback-key", {
        score,
        comment,
      });
    }
  };
})();


export default LangSmithFeedback;