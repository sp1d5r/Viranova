import React, {useEffect, useState} from "react";
import {Short} from "../../types/collections/Shorts";
import FirebaseFirestoreService from "../../services/database/strategies/FirebaseFirestoreService";
import {useNotificaiton} from "../../contexts/NotificationProvider";
import {VideoPlayer} from "../video-player/VideoPlayer";
import {LoadingIcon} from "../loading/Loading";
import FirebaseDatabaseService from "../../services/database/strategies/FirebaseFirestoreService";
import {FirebaseStorageService} from "../../services/storage/strategies";
import {StockAudio} from "../../types/collections/StockAudio";
import {AudioPlayer} from "../audio/AudioPlayer";
import {PingVisualiser} from "./export-tab/PingVisualiser";
import {Timestamp} from "firebase/firestore";
import {AnalyticsTask} from "../../types/collections/Task";

export interface ExportTabProps {
  short: Short;
  shortId: string;
}

interface ShortTitle {
  titleTop: string;
  titleBottom: string;
}

type dataCollectionType = 'Static Collection' | 'Dynamic Decay' | 'Data Freak';

interface DataCollectionType {
  collectionType: dataCollectionType,
  description: string,
}

const dataCollectionMethodologies : DataCollectionType[] = [
  {
    collectionType: 'Static Collection',
    description: 'Once a day, every day for 6 days.'
  },
  {
    collectionType: 'Dynamic Decay',
    description: 'Every hour for first 12 hours, then every 2 hours for next 12 hours, then daily for 5 days.'
  },
  {
    collectionType: 'Data Freak',
    description: 'Every hour for first 24 hours, then every 2 hours for next 24 hours, then every 4 hours for next 24 hours, finally every 12 hours for 3 days.'
  },
]

const createTaskSchedule = (collectionType: dataCollectionType): number[] => {
  const now = Date.now();
  const utcNow = now - (now % 1000); // Round to the nearest second
  const hour = 60 * 60 * 1000;
  const day = 24 * hour;

  switch (collectionType) {
    case 'Static Collection':
      return Array.from({ length: 6 }, (_, i) => utcNow + (i + 1) * day);
    case 'Dynamic Decay':
      return [
        ...Array.from({ length: 12 }, (_, i) => utcNow + (i + 1) * hour),
        ...Array.from({ length: 6 }, (_, i) => utcNow + 12 * hour + (i + 1) * 2 * hour),
        ...Array.from({ length: 5 }, (_, i) => utcNow + 24 * hour + (i + 1) * day)
      ];
    case 'Data Freak':
      return [
        ...Array.from({ length: 24 }, (_, i) => utcNow + (i + 1) * hour),
        ...Array.from({ length: 12 }, (_, i) => utcNow + 24 * hour + (i + 1) * 2 * hour),
        ...Array.from({ length: 6 }, (_, i) => utcNow + 48 * hour + (i + 1) * 4 * hour),
        ...Array.from({ length: 6 }, (_, i) => utcNow + 72 * hour + (i + 1) * 12 * hour)
      ];
    default:
      return [];
  }
};

export const ExportTab :React.FC<ExportTabProps> = ({short, shortId}) => {
  const [shortTitle, setShortTitle] = useState<ShortTitle>({
    titleTop: short.short_title_top || '',
    titleBottom: short.short_title_bottom || ''
  });
  const [stockAudio, setStockAudio] = useState<StockAudio[]>([]);
  const [audioSelected, setAudioSelected] = useState({
    audioSelected:-1,
    backgroundAudioPercentage: short.background_percentage,
  });
  const [tikTokLink, setTikTokLink] = useState(short.tiktok_link);
  const [selectedDataCollection, setSelectedDataCollection] = useState<DataCollectionType>(dataCollectionMethodologies[0]);
  const {showNotification} = useNotificaiton();

  const scheduleAnalyticsTasks = async () => {
    const taskSchedule = createTaskSchedule(selectedDataCollection.collectionType);
    const tasks: AnalyticsTask[] = taskSchedule.map((scheduledTime) => ({
      status: 'Pending',
      scheduledTime: Timestamp.fromMillis(scheduledTime),
      operation: 'Analytics',
      taskResultId: `${shortId}_${scheduledTime}`,
      shortId: shortId,
      tikTokLink: tikTokLink
    }));

    try {
      await Promise.all(tasks.map(task =>
        FirebaseFirestoreService.addDocument('tasks', task)
      ));
      showNotification("Success", `Scheduled ${tasks.length} analytics tasks`, "success");
    } catch (error) {
      showNotification("Failed", "Error scheduling analytics tasks", "error");
    }
  };

  useEffect(() => {
    FirebaseFirestoreService.getAllDocuments(
      "stock-audio",
      (docs) => {
        if (docs && docs.length > 0) {
          setStockAudio(docs.map((elem) => elem as StockAudio));
        }
      },
      () => {
        showNotification("Stock Audio", "Failed to get stock audio options", "error")
      }
    )
  }, [short]);

  return <div className="text-medium text-gray-400 bg-gray-900 rounded-lg w-full flex justify-evenly flex-wrap gap-5 p-8">
    <div className="flex flex-col flex-1 gap-2 min-w-[200px] py-2">
      <h3 className="text-xl font-bold text-white mb-2">Export Short!</h3>
      <p className="mb-2">We're finally good to go!</p>

      <span>
        This is also where the magic happens, the best next steps you can take is to load the clip into CapCut
        apply additional editing. Try adding captions. Once you've completed that run it through our
        <a href={"/somewhere else"} className="text-primary underline"> clip evaluation </a>
        engine.
      </span>

      <p>
        Alright! Once you've finished editing the video and posting the video add the link to the TikTok produced here:
      </p>


      <div className="mt-2">
        <label className="block text-sm font-medium text-gray-900 dark:text-white">
          Short Title
          <div className="flex gap-2">
            <input
              type="text"
              id="short-title-top"
              className="bg-gray-50 border my-2 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              value={shortTitle.titleTop}
              placeholder="Title Top"
              onChange={(e) => {setShortTitle(prevState => {
                return {...prevState, titleTop: e.target.value}
              })}}
            />
            <input
              type="text"
              id="short-title-bottom"
              className="bg-gray-50 border my-2 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              value={shortTitle.titleBottom}
              placeholder="Title Bottom"
              onChange={(e) => {setShortTitle(prevState => {
                return {...prevState, titleBottom: e.target.value}
              })}}
            />
            <button onClick={() => {
              if (shortTitle) {
                FirebaseDatabaseService.updateDocument(
                  'shorts',
                  shortId,
                  {
                    'short_title_top': shortTitle.titleTop,
                    'short_title_bottom': shortTitle.titleBottom,
                  },
                  ()=>{
                    showNotification("Update Successful", "Updated short title", "success")
                  },
                  (error)=>{
                    showNotification("Update Failed", error.message, "error")
                  }
                )
              }
            }}
            className="inline-flex items-center px-4 py-2 my-2 text-sm font-medium border rounded-lg focus:z-10 focus:ring-4 focus:outline-none focus:text-blue-700 bg-gray-800 text-gray-200 border-blue-600 hover:text-white hover:bg-blue-700 focus:ring-blue-700 gap-3"
              >
              Update
              <svg className="w-5 h-5 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M18 14v4.833A1.166 1.166 0 0 1 16.833 20H5.167A1.167 1.167 0 0 1 4 18.833V7.167A1.166 1.166 0 0 1 5.167 6h4.618m4.447-2H20v5.768m-7.889 2.121 7.778-7.778"/>
              </svg>
            </button>
          </div>
        </label>
      </div>

      <div className="mt-2 items-center">
        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
          Background Audio
          {audioSelected.audioSelected != -1 && <AudioPlayer path={stockAudio[audioSelected.audioSelected].storageLocation} />}
          <div className="flex gap-2 items-center">
            <form className="max-w-sm flex gap-2 items-center">
              <select id="stock-audio-options" onChange={(e) => {setAudioSelected(prevState => {
                return {
                  ...prevState,
                  audioSelected: parseInt(e.target.value)
                }
              })}} className="border text-sm rounded-lg block w-[50%] p-2.5 h-10 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500">
                <option selected={audioSelected.audioSelected == -1}>Choose a track</option>
                {
                  stockAudio.map((elem, index) => {
                    return <option value={index} selected={audioSelected.audioSelected == index}>{elem.songName}</option>
                  })
                }
              </select>
              <input
                type="number"
                min={0}
                max={100}
                id="short-title-bottom"
                className="bg-gray-50 border my-2 border-gray-300 w-[50%] text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                value={audioSelected.backgroundAudioPercentage}
                placeholder="Audio %"
                onChange={(e) => {
                  setAudioSelected(prevState => {
                    return {
                      ...prevState,
                      backgroundAudioPercentage: parseInt(e.target.value)
                    }
                  })
                }}
              />
            </form>
            <button onClick={() => {
              if (audioSelected.audioSelected >= 0 && audioSelected.backgroundAudioPercentage >= 0 && audioSelected.backgroundAudioPercentage <= 100) {
                FirebaseDatabaseService.updateDocument(
                  'shorts',
                  shortId,
                  {
                    'background_audio': stockAudio[audioSelected.audioSelected].id,
                    'background_percentage': audioSelected.backgroundAudioPercentage,
                  },
                  ()=>{
                    showNotification("Update Successful", "Added Background Audio", "success")
                  },
                  (error)=>{
                    showNotification("Update Failed", error.message, "error")
                  }
                )
              }
            }}
                    className="inline-flex items-center px-4 py-2 my-2 text-sm font-medium border rounded-lg focus:z-10 focus:ring-4 focus:outline-none focus:text-blue-700 bg-gray-800 text-gray-200 border-violet-600 hover:text-white hover:bg-violet-700 focus:ring-violet-700 gap-3"
            >
              Add
              <svg className="w-5 h-5 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M17.316 4.052a.99.99 0 0 0-.9.14c-.262.19-.416.495-.416.82v8.566a4.573 4.573 0 0 0-2-.464c-1.99 0-4 1.342-4 3.443 0 2.1 2.01 3.443 4 3.443 1.99 0 4-1.342 4-3.443V6.801c.538.5 1 1.219 1 2.262 0 .56.448 1.013 1 1.013s1-.453 1-1.013c0-1.905-.956-3.18-1.86-3.942a6.391 6.391 0 0 0-1.636-.998 4 4 0 0 0-.166-.063l-.013-.005-.005-.002h-.002l-.002-.001ZM4 5.012c-.552 0-1 .454-1 1.013 0 .56.448 1.013 1 1.013h9c.552 0 1-.453 1-1.013 0-.559-.448-1.012-1-1.012H4Zm0 4.051c-.552 0-1 .454-1 1.013 0 .56.448 1.013 1 1.013h9c.552 0 1-.454 1-1.013 0-.56-.448-1.013-1-1.013H4Zm0 4.05c-.552 0-1 .454-1 1.014 0 .559.448 1.012 1 1.012h4c.552 0 1-.453 1-1.012 0-.56-.448-1.013-1-1.013H4Z" clipRule="evenodd"/>
              </svg>
            </button>
          </div>
        </label>
      </div>


      <div className="flex flex-col text-white">
        <p className="mb-0">Handle Analytics</p>
        <div className="flex gap-2 w-full items-center justify-center">
          <label className="block text-sm font-medium  flex-1">
            <input
              type="text"
              id="default-input"
              onChange={(e) => {setTikTokLink(e.target.value)}}
              className=" bg-gray-50 border my-2 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              value={tikTokLink}
            />
          </label>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex justify-evenly items-center">
            {dataCollectionMethodologies.map((elem) => {
              return <button
                disabled={elem.collectionType==selectedDataCollection.collectionType}
                className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-teal-300 to-lime-300 group-hover:from-teal-300 group-hover:to-lime-300 group-disabled:from-teal-300 group-disabled:to-lime-300 dark:text-white dark:hover:text-gray-900 focus:ring-4 focus:outline-none focus:ring-lime-200 dark:focus:ring-lime-800"
                onClick={() => {
                  setSelectedDataCollection(elem);
                }}
              >
                <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0 group-disabled:bg-opacity-0 group-disabled:text-gray-900 group-disabled:font-bold">
                {elem.collectionType}
                </span>
              </button>
            })}
          </div>
          <p>{selectedDataCollection.description}</p>
          <PingVisualiser dataType={selectedDataCollection.collectionType} />
          <button onClick={() => {
            if (tikTokLink) {
              FirebaseFirestoreService.updateDocument(
                'shorts',
                shortId,
                {
                  'tiktok_link': tikTokLink,
                },
                async () => {
                  showNotification("Update Successful", "Updated short TikTok link", "success");
                  await scheduleAnalyticsTasks();
                },
                (error) => {
                  showNotification("Update Failed", error.message, "error")
                }
              )
            } else {
              showNotification("Error", "Please provide a TikTok link", "error");
            }
          }}
                  className="inline-flex items-center  justify-center px-4 py-2 my-2 text-sm font-medium border rounded-lg focus:z-10 focus:ring-4 focus:outline-none focus:text-cyan-700 bg-gray-800 text-gray-200 border-cyan-600 hover:text-white hover:bg-cyan-700 focus:ring-cyan-700 gap-3"
          >
            Schedule Analytics
            <svg className="w-5 h-5 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M18 14v4.833A1.166 1.166 0 0 1 16.833 20H5.167A1.167 1.167 0 0 1 4 18.833V7.167A1.166 1.166 0 0 1 5.167 6h4.618m4.447-2H20v5.768m-7.889 2.121 7.778-7.778"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <div className="flex flex-col gap-2 flex-1 min-w-[200px] py-3">
      {short.finished_short_location ?
        <VideoPlayer path={short.finished_short_location} loadingText={"Loading Finished Product"}/> :
        <div className="w-full h-full bg-background rounded-xl flex justify-center items-center">
          <LoadingIcon id={"exporttab"} text={"Video not generated"} className={"min-h-[200px]"}/>
        </div>
      }
      <div className="w-full flex gap-2">
        <button type="button" className="inline-flex items-center px-4 py-2 my-2 text-sm font-medium border rounded-lg focus:z-10 focus:ring-4 focus:outline-none focus:text-emerald-700 bg-gray-800 text-gray-200 border-emerald-600 hover:text-white hover:bg-emerald-700 focus:ring-emerald-700 gap-3">
          <svg xmlns="http://www.w3.org/2000/svg"  height="30px" width="30px" viewBox="0 0 192 192" fill="none"><path stroke="#ffffff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="15" d="M170 42 22 124v14c0 6.627 5.373 12 12 12h78c6.627 0 12-5.373 12-12v-9.5"/><path stroke="#ffffff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="15" d="M170 150 22 68V54c0-6.627 5.373-12 12-12h78c6.627 0 12 5.373 12 12v9.5"/></svg>
          Export to CapCut
        </button>

        <button
          type="button"
          className="inline-flex items-center px-4 py-2 my-2 text-sm font-medium border rounded-lg focus:z-10 focus:ring-4 focus:outline-none focus:text-emerald-700 bg-gray-800 text-gray-200 border-emerald-600 hover:text-white hover:bg-emerald-700 focus:ring-emerald-700 gap-3"
          disabled={!short.bounding_boxes}
          onClick={() => {
            FirebaseFirestoreService.updateDocument(
              "shorts",
              shortId,
              {
                "short_status": "Preview Video",
                "previous_short_status": "Requested to Preview Video"
              },
              () => {showNotification("Success", "Requested to preview video", "success")},
              (error) => {showNotification("Failed", error.message, "error")},
            )
          }}
        >
          Preview
        </button>

        <button
          type="button"
          className="inline-flex items-center px-4 py-2 my-2 text-sm font-medium border rounded-lg focus:z-10 focus:ring-4 focus:outline-none focus:text-emerald-700 bg-gray-800 text-gray-200 border-emerald-600 hover:text-white hover:bg-emerald-700 focus:ring-emerald-700 gap-3"
          disabled={!short.finished_short_location}
          onClick={() => {
            FirebaseStorageService.downloadFile(short.finished_short_location).then(
              (blob) => {
                const blobUrl = window.URL.createObjectURL(blob);

                // Create a link and set the URL and download attribute
                const link = document.createElement('a');
                link.href = blobUrl;
                link.setAttribute('download', short.finished_short_location.split("/").filter((_, index) => {
                  return index > 0
                }).join('')); // Set the filename here

                // Append to the body, click it, and then remove it
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                // Clean up by revoking the Blob URL after a timeout
                setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);
              }
            ).catch(
              (err) => {showNotification('Error', 'Failed to get URL - preview first', 'error')}
            );
          }}
        >
          Download
          <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 13V4M7 14H5a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-2m-1-5-4 5-4-5m9 8h.01"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
}