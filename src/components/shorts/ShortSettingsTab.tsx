import React, {useState} from "react";
import {Short} from "../../types/collections/Shorts";
import FirebaseFirestoreService from "../../services/database/strategies/FirebaseFirestoreService";
import {useNotificaiton} from "../../contexts/NotificationProvider";

export interface ShortSettingsTabProps {
  short: Short;
  shortId: string;
}

export const ShortSettingsTab :React.FC<ShortSettingsTabProps> = ({short, shortId}) => {
  const [shortIdea, setShortIdea] = useState<string>(short.short_idea);
  const [shortIdeaExplanation, setShortIdeaExplanation] = useState(short.short_idea_explanation)
  const {showNotification} = useNotificaiton();

  const reset = () => {
    setShortIdea(short.short_idea);
    setShortIdeaExplanation(short.short_idea_explanation);
  }

  const updateShortDetails = () => {
    FirebaseFirestoreService.updateDocument(
      'shorts',
      shortId,
      {
        short_idea: shortIdea,
        short_idea_explanation: shortIdeaExplanation
      },
      () => {showNotification('Updated', 'Updated Short Information', 'success');},
      (err) => {showNotification('Updated', err.message, 'error');}
    )
  }

  return <div className="p-6 text-medium text-gray-400 bg-gray-900 rounded-lg w-full">
    <h3 className="text-xl font-bold text-white mb-2">Short Settings</h3>
    <p className="mb-2">Before progressing with the next few stages, take a second here and make sure everything looks in order</p>

    <p className="text-white font-bold pt-5">Original Transcript:</p>
    <p className="bg-gray-900 px-2 py-2 m-2">
      {short.transcript}
    </p>
    <div className="mb-6">
      <p className="text-white font-bold pt-2">Short Idea:</p>

      <label htmlFor="default-input" className="block mb-2 text-sm font-medium text-white">
        <input
          type="text"
          id="default-input"
          value={shortIdea}
          onChange={(e)=>{
            setShortIdea(e.target.value)
          }}
          className="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" />
      </label>
    </div>
    <div className="mb-6">
      <p className="text-white font-bold pt-2">Idea Justification:</p>
      <label htmlFor="large-input" className="block mb-2 text-sm font-medium text-white">
        <textarea
          id="message"
          rows={4}
          value={shortIdeaExplanation}
          onChange={(e)=>{
            setShortIdeaExplanation(e.target.value)
          }}
          className="block p-2.5 w-full text-sm rounded-lg border bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
          placeholder="Write your thoughts here..."
        ></textarea>
     </label>
    </div>
    <div>
      <button
        type="button"
        className="text-white focus:ring-4 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-blue-800"
        onClick={() => {reset()}}
      >
        Reset
      </button>
      <button
        type="button"
        className="focus:outline-none text-white focus:ring-4 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 bg-green-600 hover:bg-green-700 focus:ring-green-800"
        onClick={() => {updateShortDetails()}}
      >
        Submit
      </button>
    </div>
  </div>
}