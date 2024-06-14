import React, {useState, useEffect, useRef} from 'react';
import {BoundingBoxes, Boxes, Short} from "../../../../types/collections/Shorts";
import FirebaseFirestoreService from "../../../../services/database/strategies/FirebaseFirestoreService";
import {useNotificaiton} from "../../../../contexts/NotificationProvider";

export interface ManualOverrideControlProps {
  currentFrame: number;
  totalFrames: number;
  cuts: number [];
  setCuts: React.Dispatch<React.SetStateAction<number[]>>
  internalBoundingBoxes: BoundingBoxes;
  setInternalBoundingBoxes: React.Dispatch<React.SetStateAction<BoundingBoxes | undefined>>;
  shortId: string;
  short: Short;
}

type ManualOverrideOptions = "None" | "Static Bounding Box Move"

interface BoxMovementPos {
  x: number,
  y: number
}

const ManualOverrideControls: React.FC<ManualOverrideControlProps> = ({ currentFrame, totalFrames, cuts, setCuts, internalBoundingBoxes, setInternalBoundingBoxes, shortId, short }) => {
  const [currentIntervalIndex, setCurrentIntervalIndex] = useState<number | undefined>();
  const {showNotification} = useNotificaiton();
  const [editedBoundingBoxes, setEditedBoundingBoxes] = useState(internalBoundingBoxes);
  const [moveOption, setMoveOption] = useState<ManualOverrideOptions>("None");
  const boxRef = useRef<HTMLDivElement>(null)
  const [boxMovement, setBoxMovement] = useState<BoxMovementPos>({x: internalBoundingBoxes.boxes[currentFrame][0], y: internalBoundingBoxes.boxes[currentFrame][1]})

  useEffect(() => {
    setBoxMovement({x: internalBoundingBoxes.boxes[currentFrame][0], y: internalBoundingBoxes.boxes[currentFrame][1]});
  }, [currentFrame, internalBoundingBoxes]);

  useEffect(() => {
    const findCurrentIntervalIndex = () => {
      let start = 0;
      for (let i = 0; i <= cuts.length; i++) {
        let end: number;
        if (i == cuts.length) {
          end = totalFrames;
        } else {
          end = cuts[i];
        }
        if (currentFrame >= start && currentFrame <= end) {
          console.log("here");
          return i;
        }
        start = end + 1;
      }
      return undefined;
    };

    setCurrentIntervalIndex(findCurrentIntervalIndex());
  }, [currentFrame, cuts]);

  const resetBoundingBoxes = () => {
    setEditedBoundingBoxes(internalBoundingBoxes);
  }

  const handlePreview = () => {

    const newBoxes = [...internalBoundingBoxes.boxes];

    // Find start and end frame based on cuts (using findCurrentIntervalIndex)

    let start = 0;
    let end: number = 0;

    for (let i = 0; i <= cuts.length; i++) {
      if (i == cuts.length) {
        end = totalFrames;
      } else {
        end = cuts[i];
      }
      if (currentFrame >= start && currentFrame <= end) {
        break;
      }
      start = end + 1;
    }

    // Update boxes within the identified range
    for (let i = start; i < end; i++) {
      console.log(i)
      newBoxes[i] = [
        boxMovement.x,
        boxMovement.y,
        editedBoundingBoxes.boxes[i]?.[2] ?? 0, // Use default 0 for width if undefined
        editedBoundingBoxes.boxes[i]?.[3] ?? 0, // Use default 0 for height if undefined
      ];
    }
    setInternalBoundingBoxes({boxes: newBoxes });
  };

  const submitBoxes = () => {
    FirebaseFirestoreService.updateDocument(
      "shorts",
      shortId,
      {
        bounding_boxes: JSON.stringify(internalBoundingBoxes)
      },
      () => {
        showNotification('Success', 'Bounding Boxes Updated', 'success');
      },
      (error) => {
        showNotification('Unable to update', error.message, 'error');
      }
    )
  }


  if (currentIntervalIndex != undefined) {
    return (
      <div className="text-white w-full flex flex-col gap-2">
        <h4 className="text-2xl font-bold">Manual Override Options (Interval {currentIntervalIndex + 1})</h4>

        <div className="flex gap-2">
          <button
            onClick={() => {
              if (moveOption == "Static Bounding Box Move") {
                setMoveOption("None")
              } else {
                setMoveOption("Static Bounding Box Move")
              }}
            }
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:outline-none focus:ring-gray-100 focus:text-blue-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700 gap-3"
          >
            Static Box Move
            <svg className="w-5 h-5 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 4h4m0 0v4m0-4-5 5M8 20H4m0 0v-4m0 4 5-5"/>
            </svg>
          </button>
          <button
            onClick={() => {
              const newCuts = [...cuts];
              newCuts.push(currentFrame);
              newCuts.sort((a,b) => a-b);
              console.log("New sorts", newCuts)
              setCuts(newCuts);
            }}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:outline-none focus:ring-gray-100 focus:text-blue-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700 gap-3"
          >
            Add a Cut
            <svg className="w-5 h-5 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 4h4m0 0v4m0-4-5 5M8 20H4m0 0v-4m0 4 5-5"/>
            </svg>
          </button>
          <button
            onClick={() => {
              FirebaseFirestoreService.updateDocument(
                "shorts",
                shortId,
                {
                  cuts: cuts
                },
                () => {
                  showNotification(
                    "Updated cuts",
                    "Updated all the cuts",
                    "success"
                  )
                }
              )
            }}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-emerald-200 rounded-lg hover:bg-emerald-100 hover:text-white focus:z-10 focus:ring-4 focus:outline-none focus:ring-emerald-100 focus:text-emerald-700 dark:bg-emerald-800 dark:text-gray-200 dark:border-emerald-600 dark:hover:text-white dark:hover:bg-emerald-700 dark:focus:ring-emerald-700 gap-3"
          >
            Submit Cut
            <svg className="w-5 h-5 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 4h4m0 0v4m0-4-5 5M8 20H4m0 0v-4m0 4 5-5"/>
            </svg>
          </button>
          <button
            onClick={() => {}}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:outline-none focus:ring-gray-100 focus:text-blue-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700 gap-3"
          >
            Submit Update
          </button>
          <button onClick={() => {}} className="inline-flex items-center px-4 py-2 text-sm font-medium border rounded-lg focus:z-10 focus:ring-4 focus:outline-none focus:text-blue-700 bg-red-800 text-gray-100 border-gray-600 hover:text-white hover:bg-red-700 focus:ring-red-700 gap-3">
            Reset Changes
          </button>
        </div>

        {moveOption == "Static Bounding Box Move" && (
            <div
              className="relative w-full bg-background border  border-primary"
              style={{ paddingBottom: `${(short.height / short.width) * 100}%` }}
            >
              <div
                className="absolute bg-primary"
                ref={boxRef}
                style={{
                  width: `${(internalBoundingBoxes.boxes[currentFrame][2] / short.width) * 100}%`,
                  height: `${(internalBoundingBoxes.boxes[currentFrame][3] / short.height) * 100}%`,
                  top: `${(internalBoundingBoxes.boxes[currentFrame][1] / short.height) * 100}%`,
                  left: `${(boxMovement.x / short.width) * 100}%`,
                }}/>

              <div className="absolute top-0 right-0 m-2 p-2 rounded bg-gray-700">
                <p className="text-white">Move X position</p>
                <input type="number" id="x_position" value={boxMovement.x} onChange={(e) => {setBoxMovement(prevState => {
                  return {...prevState, x: parseInt(e.target.value)}
                })}} className="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" placeholder={"x position"} required />
                <p className="text-white">Move Y position</p>
                <input disabled type="number" id="y_position" value={boxMovement.y} className="mb-2 border text-sm rounded-lg block w-full p-2.5 cursor-not-allowed bg-gray-700 border-gray-600 placeholder-gray-400 text-gray-400 focus:ring-blue-500 focus:border-blue-500" placeholder={"y position"} required />
                <button
                  onClick={() => {handlePreview()}}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:outline-none focus:ring-gray-100 focus:text-blue-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700 gap-3"
                >
                  Preview Above
                </button>
                <button
                  onClick={() => {submitBoxes()}}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium border rounded-lg focus:z-10 focus:ring-4 focus:outline-none bg-emerald-800 text-gray-400 border-emerald-600 hover:text-white hover:bg-emerald-700 focus:ring-emerald-700 gap-3"
                >
                  Submit Section
                </button>
              </div>
            </div>
          )
         }

      </div>
    );
  } else {
    return <></>;
  }
}

export default ManualOverrideControls;