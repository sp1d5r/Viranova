import React, {useEffect, useState} from 'react';
import {ExistingProjectCard} from "../cards/existing-project-card/existing-project-card";
import {useAuth} from "../../contexts/Authentication";
import FirebaseFirestoreService from "../../services/database/strategies/FirebaseFirestoreService";
import {documentToUserVideo, UserVideo} from "../../types/collections/UserVideo";
import {SquigglyUnderline} from "../ui/squiggly-line";
import {ExistingShortCard} from "../cards/existing-short-card/ExistingShortCard";
import {documentToShort, Short} from "../../types/collections/Shorts";
import {toNumber} from "lodash";

export interface ExistingProjectsProps {
  className?: string
}


export const ExistingProjects: React.FC<ExistingProjectsProps> = ({className=''}) => {
  const [recentProjects, setRecentProjects] = useState<UserVideo[]>([]);
  const [recentShorts, setRecentShorts] = useState<Short[]>([]);
  const [selectedLink, setSelectedLink] = useState("Projects");
  const {authState} = useAuth();
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    FirebaseFirestoreService.queryDocuments(
      '/videos',
      'uid',
      authState.user && authState.user.uid ? authState.user.uid : '',
      'uid',
      (documents) => {
        console.log(documents);
        setRecentProjects(documents.map(doc => {
          return documentToUserVideo(doc)
        }).sort((elem1, elem2) => {return elem2.uploadTimestamp - elem1.uploadTimestamp}));
      }
      )
  }, [authState, refresh]);

  useEffect(() => {
    FirebaseFirestoreService.queryDocuments(
      '/shorts',
      'uid',
      authState.user && authState.user.uid ? authState.user.uid : '',
      'uid',
      (documents) => {
        setRecentShorts(documents.map(doc => {
          return documentToShort(doc)
        }).sort((elem1, elem2) => {return toNumber(elem2.last_updated) - toNumber(elem1.last_updated)}));
      }
    )
  }, [authState, refresh]);

  return <section className={"w-full border-t border-accent flex justify-center items-center flex-col gap-[10] p-5"}>


      { /* Existing Projects Title */}
      <div className={"container flex-col justify-center items-start"}>
        <div>
          <h1 className={"text-title text-white"}>Overview </h1>
          <SquigglyUnderline
            navigation={[{name: "Projects"}, {name: "Shorts"}]}
            setSelectedLink={setSelectedLink}
            selectedLink={selectedLink}
          />
          {selectedLink=="Projects" && <p className={"text-gray-500 my-4"}>Look through your existing projects to edit or export!</p>}
        </div>
      </div>

      { /* Existing Projects Carousel */ }
      <div className={"w-full md:w-[70%] flex flex-wrap gap-5 pt-10 justify-center items-center"}>
        {
          selectedLink=="Projects" && recentProjects.map((elem, index) => {
            return <ExistingProjectCard userVideo={elem} setRefresh={setRefresh} id={index}/>
          })
        }

        {
          selectedLink=="Shorts" && recentShorts.map((elem, index) => {
            return <ExistingShortCard short={elem} />
          })
        }

      </div>
  </section>
}