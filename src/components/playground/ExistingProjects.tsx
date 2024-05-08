import React, {useEffect, useState} from 'react';
import {ExistingProjectCard} from "../cards/existing-project-card/existing-project-card";
import {useAuth} from "../../contexts/Authentication";
import FirebaseFirestoreService from "../../services/database/strategies/FirebaseFirestoreService";
import {documentToUserVideo, UserVideo} from "../../types/collections/UserVideo";

export interface ExistingProjectsProps {
  className?: string
}


export const ExistingProjects: React.FC<ExistingProjectsProps> = ({className=''}) => {
  const [recentProjects, setRecentProjects] = useState<UserVideo[]>([]);
  const [projectsId, setProjectsID] = useState<string[]>([]);
  const {authState} = useAuth();
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    // Extract all the recent projects from the user.
    FirebaseFirestoreService.queryDocuments(
      '/videos',
      'uid',
      authState.user && authState.user.uid ? authState.user.uid : '',
      'uid',
      (documents) => {
        setProjectsID(documents.map((doc) => {return doc.id!}))
        setRecentProjects(documents.map(doc => {
          return documentToUserVideo(doc)
        }).sort((elem1, elem2) => {return elem2.uploadTimestamp - elem1.uploadTimestamp}));
      }
      )
  }, [authState, refresh]);

  return <section className={"w-full border-t border-accent flex justify-center items-center flex-col gap-[10] p-5"}>
      { /* Existing Projects Title */}
      <div className={"container flex-col justify-center items-start"}>
        <div>
          <h1 className={"text-title text-white"}>Existing Projects </h1>
          <p className={"text-gray-500"}>Look through your existing projects to edit or export! </p>
        </div>
      </div>

      { /* Existing Projects Carousel */ }
      <div className={"w-[70%] flex flex-wrap gap-5 pt-10 justify-center items-center"}>
        {
          recentProjects.map((elem, index) => {
            return <ExistingProjectCard videoId={projectsId[index]} userVideo={elem} setRefresh={setRefresh} id={index}/>
          })
        }

      </div>
  </section>
}