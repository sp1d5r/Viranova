import React, {useEffect, useState} from 'react';
import {ExistingProjectCard} from "../cards/existing-project-card/existing-project-card";
import PlaygroundBackground from "../../assets/playground-assets/PlaygroundBackground.png";
import {useAuth} from "../../contexts/Authentication";

export interface ExistingProjectsProps {
  className?: string
}



export const ExistingProjects: React.FC<ExistingProjectsProps> = ({className=''}) => {
  const [recentProjects, setRecentProjects] = useState([{}]);
  const {authState} = useAuth();

  useEffect(() => {
    // Extract all the recent projects from the user.
    // FirebaseFirestoreService.queryDocuments(
    //   '/videos',
    //   'uid',
    //   authState.user && authState.user.uid ? authState.user.uid : '',
    //   'uid',
    //   (documents) => {
    //     setRecentProjects(documents);
    //   }
    //   )

    setRecentProjects([{
        backgroundImage: PlaygroundBackground,
        date: 'Tues 6th Feb',
        videoId: 'randomId',
      },
      {
        backgroundImage: PlaygroundBackground,
        date: 'Tues 6th Feb',
        videoId: 'randomId',
      },
    ])
  }, []);

  return <section className={"w-full border-t border-accent flex justify-center items-center flex-col gap-[10] p-5"}>
      { /* Existing Projects Title */}
      <div className={"container flex-col justify-center items-start"}>
        <div>
          <h1 className={"text-title text-white"}>Existing Projects </h1>
          <p className={"text-gray-500"}>Look through your existing projects to edit or export! </p>
        </div>
      </div>

      { /* Existing Projects Carousel */ }
      <div className={"w-[70%] grid grid-cols-3 gap-5 pt-10 justify-center items-center"}>
        {[1, 2, 3, 4].map((index,elem) => {
          return <ExistingProjectCard
            key={index}
            backgroundImage={PlaygroundBackground}
            date={"Tue 6 Feb"} title={"Begin your journey with Vira Nova"}
            videoId={elem.toString()}
          />
        })}
      </div>
  </section>
}