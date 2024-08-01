import React, {useEffect, useRef, useState} from 'react';
import {TransparentNavigationBar} from '../components/navigation-bar/transparent-navigation-bar';
import {ExistingProjects} from '../components/playground/ExistingProjects';
import {CreateProject} from '../components/playground/CreateProject';
import LogoIcon from "../assets/logo/Scissors.svg";
import gsap from "gsap";
import {BackgroundBeams} from "../components/ui/background-beams";
import {useNotificaiton} from "../contexts/NotificationProvider";
import FirebaseFirestoreService from "../services/database/strategies/FirebaseFirestoreService";
import {useAuth} from "../contexts/Authentication";


export default function PlaygroundPage() {
    const comp = useRef(null);
    const [youtubeLink, setYouTubeLink] = useState<string>();
    const { showNotification } = useNotificaiton();
    const { authState } = useAuth();
    const [uploadProgress, setUploadProgress] = useState<number>(0);



    useEffect(() => {
        let ctx = gsap.context(() => {
            let timeline = gsap.timeline();
            timeline.from(["#landingLogoIcon", "#landingLogoI", "#landingLogoR", "#landingLogoA", "#landingLogoN", "#landingLogoO", "#landingLogoV", "#landingLogoA2"], {
                opacity: 0,
                y: "+=30",
                stagger: 0.05
            }).from(["#landingSubText1", "#landingSubText2", "#landingSubText3"], {
                opacity:0,
                y: "-=10",
                stagger: 0.12
            }).to("#landingBackgroundScreen", {
                xPercent: "-100",
                duration: 0.1,
                delay:0.12
            })
        }, comp);

        return () => ctx.revert();

    }, []);

    const isValidYouTubeUrl = (url: string) => {
        // Regular expression to check if the URL is a valid YouTube video URL
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})$/;
        return youtubeRegex.test(url);
    }

    const submitYoutubeLink = () => {
        if (youtubeLink) {
            if (isValidYouTubeUrl(youtubeLink)) {
                FirebaseFirestoreService.addDocument("videos", {
                    uid: authState.user!.uid,
                    processingProgress: 0,
                    status: "Link Provided",
                    previousStatus: "Started...",
                    uploadTimestamp: Date.now(),
                    progressMessage: "Performing Download",
                    queuePosition: -1,
                    link: youtubeLink,
                },
                  (doc_id) => {
                      showNotification(
                        "Created Document!",
                        `Successfully created new document: ${doc_id}`,
                        "success",
                        10000
                      );
                      window.location.href = `/video-handler?video_id=${doc_id}`
                  },
                  () => {
                      showNotification(
                        "Error Document Creation",
                        'Failed to create document... Try again another time maybe?',
                        "error",
                        10000
                      );
                  }
                )
            } else {
                showNotification("Invalid Link", "Come on... Give me a real link...", "error");
            }
        } else {
            showNotification("No Link", "You need to add a youtube link", "error");
        }
    }

    const submitButton = () => {
        if (authState.isAuthenticated && authState.user && authState.user.uid) {
            if (youtubeLink){
                submitYoutubeLink();
            }
        } else {
            window.location.href = "/authenticate";
        }
    }

    return <div ref={comp} className={'relative w-full h-[100vh]'}>
        <TransparentNavigationBar />

        {/* Loading Page */}
        <div id="landingBackgroundScreen" className="fixed w-screen h-screen bg-background z-50 flex flex-col justify-center items-center gap-3 cursor-not-allowed">
            <span className='text-2xl text-white font-bold flex items-center justify-center gap-1'>
                <img id="landingLogoIcon" src={LogoIcon} alt="" className={"h-8 w-8"} />
                <span id="landingLogoI">I</span>
                <span id="landingLogoR">R</span>
                <span id="landingLogoA">A</span>
                <span id="landingLogoN" className="text-primary">N</span>
                <span id="landingLogoO" className="text-primary">O</span>
                <span id="landingLogoV" className="text-primary">V</span>
                <span id="landingLogoA2" className="text-primary">A</span>
            </span>
            <span className="text-white flex gap-2">
                <span id="landingSubText1">Automate Clipping.</span>
                <span id="landingSubText2">Drive Traffic.</span>
                <span id="landingSubText3" className="text-primary font-bold">Deliver Results</span>
            </span>
        </div>

        <div className="w-full  max-h-[700px] min-h-[600px] flex justify-start items-center flex-col relative sm:px-16 gap-8 pt-24  sm:pt-28 m-auto py-6">
            <BackgroundBeams />

            <div className="w-[60%] min-w-[350px] flex   justify-start items-center flex-col gap-8 my-8">
                <div className="w-full min-h-[200px] z-0 overflow-hidden border-primary border rounded-xl text-white p-4">
                    <p className="text-2xl font-bold">Clip Video</p>
                    <div className="bg-white/0 py-5"> {/* Ensure this div is completely transparent */}
                        <CreateProject />
                    </div>
                    <div className="w-full border-b border-accent/20 my-2"/>
                    <label htmlFor="helper-text" className="block my-2 text-sm font-medium text-gray-900 dark:text-white">
                        Or send a YouTube link
                        <input
                          type="link"
                          id="helper-text"
                          aria-describedby="helper-text-explanation"
                          className="border my-1 text-sm rounded-lg block w-full px-2.5 py-1  bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
                          placeholder="youtube.com/w?dsjknvsfv"
                          value={youtubeLink}
                          onChange={(e) => {setYouTubeLink(e.target.value)}}
                        />
                    </label>
                    <p id="helper-text-explanation" className="mt-2 text-sm text-gray-500 dark:text-gray-400">Only use YouTube videos you have permission to select.</p>
                    <button
                      type="button"
                      className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 my-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                      onClick={() => { submitButton() }}
                    >
                        Continue
                    </button>
                    {uploadProgress!==0 && <div className={"w-[300px] outline outline-black rounded-full h-2.5"}>
                        <div className={"bg-accent outline-black outline  h-2.5 rounded-full"} style={{width: `${uploadProgress}%`}}></div>
                    </div>}
                </div>
            </div>
        </div>

        {/* Bottom Recently Used Cards */}
        <ExistingProjects />
    </div>
}