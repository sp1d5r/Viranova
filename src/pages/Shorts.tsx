import React, {useEffect, useState} from "react";
import ScrollableLayout from "../layouts/ScrollableLayout";
import {URLSearchParamsInit, useSearchParams} from "react-router-dom";
import FirebaseFirestoreService from "../services/database/strategies/FirebaseFirestoreService";
import {useNotificaiton} from "../contexts/NotificationProvider";
import {documentToShort, Short} from "../types/collections/Shorts";
import {ShortSettingsTab} from "../components/shorts/ShortSettingsTab";
import {documentToSegment, Segment} from "../types/collections/Segment";
import {TranscriptEditorTab} from "../components/shorts/TranscriptEditorTab";
import {AttentionTab} from "../components/shorts/AttentionTab";
import {LoadingIcon} from "../components/loading/Loading";
import {ExportTab} from "../components/shorts/ExportTab";

export interface ShortsProps {

}

export type Tabs = "Short Settings" | "Transcript Editor" | "Attention Capture" | "Export"

export const Shorts: React.FC<ShortsProps> = ({}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const short_id = searchParams.get("short_id");
  const [short, setShort] = useState<Short | undefined>();
  const [loading, setLoading] = useState(true);
  const [segment, setSegment] = useState<Segment | undefined>();
  const {showNotification} = useNotificaiton();
  const initialTab = searchParams.get("tab") as Tabs || "Short Settings";
  const [tabSelected, setTabSelected] = useState<Tabs>(initialTab);

  useEffect(() => {
    let params: URLSearchParamsInit = { tab: tabSelected };

    // Assign `short_id` only if it is not null, and ensure it's included as a string.
    if (short_id !== null) {
      params = { ...params, short_id: short_id };
    }

    setSearchParams(params);
  }, [tabSelected, short_id, setSearchParams]);

  useEffect(() => {
    if (short_id){
      FirebaseFirestoreService.listenToDocument("shorts",
        short_id,
        (document) => {
          if (document)  setShort(documentToShort(document));
        },
        (error) => {
          showNotification("Get Document", "Failed to get Short", "error")
        })
    }
  }, [short_id]);

  useEffect(() => {
    if (short) {
      FirebaseFirestoreService.listenToDocument("topical_segments",
        short.segment_id,
        (document) => {
          if (document)  setSegment(documentToSegment(document));
        },
        (error) => {
          showNotification("Get Document", "Failed to get Short", "error")
        })
      setLoading(false);
    }
  }, [short]);

  return <ScrollableLayout className={"flex flex-col gap-2 items-center "}>
    <div className="max-w-screen-xl w-full flex flex-col text-white px-2 ">
      <div className="md:flex gap-2">
        <ul className="flex-wrap flex flex-row space-x-4 justify-center sm:justify-start my-4 overflow-x-auto md:flex-col md:space-y-4 md:space-x-0 text-sm font-medium text-gray-400 md:mb-0 max-h-[90vh]">
        <li>
            <button disabled={tabSelected === "Short Settings"} onClick={() => {setTabSelected("Short Settings")}} className="inline-flex items-center px-4 py-3 rounded-lg w-full bg-gray-800 hover:bg-gray-700 hover:text-white text-left disabled:text-white disabled:bg-green-600" aria-current="page">
              <svg className="w-4 h-4 me-2 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z"/>
              </svg>
              <span className="hidden md:inline">Short Settings</span>
            </button>
          </li>
          <li>
            <button disabled={tabSelected === "Transcript Editor"} onClick={() => {setTabSelected("Transcript Editor")}} className="inline-flex items-center px-4 py-3 rounded-lg w-full bg-gray-800 hover:bg-gray-700 hover:text-white text-left disabled:text-white disabled:bg-green-600" >
              <svg className="w-4 h-4 me-2 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 18"><path d="M6.143 0H1.857A1.857 1.857 0 0 0 0 1.857v4.286C0 7.169.831 8 1.857 8h4.286A1.857 1.857 0 0 0 8 6.143V1.857A1.857 1.857 0 0 0 6.143 0Zm10 0h-4.286A1.857 1.857 0 0 0 10 1.857v4.286C10 7.169 10.831 8 11.857 8h4.286A1.857 1.857 0 0 0 18 6.143V1.857A1.857 1.857 0 0 0 16.143 0Zm-10 10H1.857A1.857 1.857 0 0 0 0 11.857v4.286C0 17.169.831 18 1.857 18h4.286A1.857 1.857 0 0 0 8 16.143v-4.286A1.857 1.857 0 0 0 6.143 10Zm10 0h-4.286A1.857 1.857 0 0 0 10 11.857v4.286c0 1.026.831 1.857 1.857 1.857h4.286A1.857 1.857 0 0 0 18 16.143v-4.286A1.857 1.857 0 0 0 16.143 10Z"/></svg>
              <span className="hidden md:inline">Transcript Editor</span>
            </button >
          </li>
          <li>
            <button disabled={tabSelected === "Attention Capture"} onClick={() => {setTabSelected("Attention Capture")}}  className="inline-flex items-center px-4 py-3 rounded-lg w-full bg-gray-800 hover:bg-gray-700 hover:text-white text-left disabled:text-white disabled:bg-green-600">
              <svg className="w-4 h-4 me-2 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M18 7.5h-.423l-.452-1.09.3-.3a1.5 1.5 0 0 0 0-2.121L16.01 2.575a1.5 1.5 0 0 0-2.121 0l-.3.3-1.089-.452V2A1.5 1.5 0 0 0 11 .5H9A1.5 1.5 0 0 0 7.5 2v.423l-1.09.452-.3-.3a1.5 1.5 0 0 0-2.121 0L2.576 3.99a1.5 1.5 0 0 0 0 2.121l.3.3L2.423 7.5H2A1.5 1.5 0 0 0 .5 9v2A1.5 1.5 0 0 0 2 12.5h.423l.452 1.09-.3.3a1.5 1.5 0 0 0 0 2.121l1.415 1.413a1.5 1.5 0 0 0 2.121 0l.3-.3 1.09.452V18A1.5 1.5 0 0 0 9 19.5h2a1.5 1.5 0 0 0 1.5-1.5v-.423l1.09-.452.3.3a1.5 1.5 0 0 0 2.121 0l1.415-1.414a1.5 1.5 0 0 0 0-2.121l-.3-.3.452-1.09H18a1.5 1.5 0 0 0 1.5-1.5V9A1.5 1.5 0 0 0 18 7.5Zm-8 6a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7Z"/>
              </svg>
              <span className="hidden md:inline">Attention Capture</span>
            </button>
          </li>
          <li>
            <button disabled={tabSelected === "Export"} onClick={() => {setTabSelected("Export")}}  className="inline-flex items-center px-4 py-3 rounded-lg w-full bg-gray-800 hover:bg-gray-700 hover:text-white text-left disabled:text-white disabled:bg-green-600">
              <svg className="w-4 h-4 me-2 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7.824 5.937a1 1 0 0 0 .726-.312 2.042 2.042 0 0 1 2.835-.065 1 1 0 0 0 1.388-1.441 3.994 3.994 0 0 0-5.674.13 1 1 0 0 0 .725 1.688Z"/>
                <path d="M17 7A7 7 0 1 0 3 7a3 3 0 0 0-3 3v2a3 3 0 0 0 3 3h1a1 1 0 0 0 1-1V7a5 5 0 1 1 10 0v7.083A2.92 2.92 0 0 1 12.083 17H12a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h1a1.993 1.993 0 0 0 1.722-1h.361a4.92 4.92 0 0 0 4.824-4H17a3 3 0 0 0 3-3v-2a3 3 0 0 0-3-3Z"/>
              </svg>
              <span className="hidden md:inline">Export</span>
            </button>
          </li>
          <div className="w-full h-[50%] relative flex md:justify-center items-end text-white">
            <div className="md:absolute md:-rotate-90">
              <p className="text-4xl font-bold pt-3 sm:pt-5 w-full text-nowrap text-primary">The Kitchen</p>
              <p className="font-bold py-2 text-nowrap">Hold on a second and let him cook 🔥</p>
            </div>
          </div>
        </ul>

        {
          tabSelected == "Short Settings" && short_id && short && segment && <ShortSettingsTab short={short} shortId={short_id} />
        }

        {
          tabSelected == "Transcript Editor" && short && short_id && segment && <TranscriptEditorTab shortId={short_id} short={short} segment={segment} />
        }

        {
          tabSelected == "Attention Capture" && short && short_id && segment && <AttentionTab shortId={short_id} short={short} segment={segment} setTab={setTabSelected}/>
        }

        {
          tabSelected == "Export" && short && short_id && segment && <ExportTab shortId={short_id} short={short} />
        }

        {
          loading && <div className="w-full h-[80vh] flex justify-center items-center">
            <LoadingIcon id={"shortEditor"} text={"Loading Short Information ..."} className={"my-16 mx-auto animate-pulse"}/>
          </div>
        }
      </div>
    </div>
  </ScrollableLayout>
}
