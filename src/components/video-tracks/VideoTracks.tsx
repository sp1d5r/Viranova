import React from "react";

export interface VideoTracksProps{
  totalFrames: number;
}


export const VideoTracks: React.FC<VideoTracksProps> = ({totalFrames}) => {
  /*
  * The video tracks are a component which house an array of different components, each component has a start and an
  * end point i suppose. Each track has a colour too.
  * */
  return <div className="w-full h-20 rounded bg-gray-700">

  </div>
}