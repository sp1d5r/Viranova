import React, {ChangeEventHandler, DragEventHandler, useEffect, useRef, useState} from 'react';
import {TransparentNavigationBar} from '../components/navigation-bar/transparent-navigation-bar';
import {ExistingProjects} from '../components/playground/ExistingProjects';
import {CreateProject} from '../components/playground/CreateProject';
import LogoIcon from "../assets/logo/Scissors.svg";
import gsap from "gsap";
import {SquigglyUnderline} from "../components/ui/squiggly-line";
import {BackgroundBeams} from "../components/ui/background-beams";
import {useNotificaiton} from "../contexts/NotificationProvider";
import FirebaseFirestoreService from "../services/database/strategies/FirebaseFirestoreService";
import {useAuth} from "../contexts/Authentication";
import {Simulate} from "react-dom/test-utils";
import submit = Simulate.submit;
import FirebaseStorageService from "../services/storage/strategies/FirebaseStorageService";
import {UserVideo, userVideoToDocument} from "../types/collections/UserVideo";
import FirebaseDatabaseService from "../services/database/strategies/FirebaseFirestoreService";

function getRandomString(strings: string[]): string {
    const randomIndex = Math.floor(Math.random() * strings.length);
    return strings[randomIndex];
}

export default function PlaygroundPage() {
    const comp = useRef(null);
    const [selectedLink, setSelectedLink] = useState("Clip video");
    const [youtubeLink, setYouTubeLink] = useState<string>();
    const { showNotification } = useNotificaiton();
    const { authState } = useAuth();
    const [files, setFiles] = useState<File[]>([]);
    const [uploadProgress, setUploadProgress] = useState<number>(0);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const openFileDialog = () => {
        fileInputRef.current?.click();
    };


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

    /* Upload File Video */

    const validateAndProcessFiles = async (newFiles: FileList) => {
        if (newFiles.length !== 1) {
            let error =  getRandomString([
                "Whoa there! This isn't a file buffet. Pick your favorite and stick with it—one file at a time, please.",
                "Trying to upload more than one file? What is this, a party? No +1s allowed here, buddy.",
                "Look, I'm just a simple program. You throw more than one file at me, and I get all confused. One at a time, please.",
                "One file only, please. Don't make me call the file police.",
                "If I had a dime for every extra file you tried to upload... I'd still ask you to upload just one.",
            ]);
            showNotification(
              'Video Upload Error',
              error,
              'error',
              5000);
            setFiles([]);
            return;
        }

        const file = newFiles[0];

        if (!file.type.includes('mp4')) {
            let error = getRandomString([
                "In a world full of formats, be an MP4 🤢. Seriously, we can only handle MP4s right now.",
                "MP4s only, please. All other formats are currently on a very long vacation 🏝.",
                "Think of MP4 as the VIP pass 🎬. Other formats? Sorry, they're not on the list.",
                "We're throwing an MP4-only party 🎉. Other formats need not apply.",
                "Imagine MP4s are like pizza, and we're all hungry 🤤. Other formats? They're like broccoli to us now.",
                "We have a strict dress code here: MP4s only. Other formats will have to wait outside.",
                "Our system is on a diet and currently only digesting MP4s. Help us keep it healthy!",
                "MP4s are like the cool kids in our school😎. Don't worry, we're working on letting everyone else in soon.",
                "It's an MP4 world, and we're just living in it. For now, that's all we can handle.",
                "Sending an MP4 is like sending a love letter to our system. It really appreciates the gesture."
            ]);
            showNotification('Video File Type Error', error, 'error', 5000);
            setFiles([]);
            return;
        }

        const fileSizeLimit = 70 * 1024 * 1024; // 5 MB
        if (file.size > fileSizeLimit) {
            const errorMessages = [
                `This file's got more weight than we can lift 🏋️‍♂️. Keep it under ${(fileSizeLimit / 1024 / 1024).toFixed(2)}MB, please.`,
                `Looks like your file's been feasting 🍔. Can we slim it down to under ${(fileSizeLimit / 1024 / 1024).toFixed(2)}MB?`,
                `If files were balloons 🎈, yours is a bit too inflated. Let's deflate to under ${(fileSizeLimit / 1024 / 1024).toFixed(2)}MB.`,
                `This file is larger than our appetite 🍰. We're on a diet of under ${(fileSizeLimit / 1024 / 1024).toFixed(2)}MB files.`,
                `Your file is stretching our pants! We need it under ${(fileSizeLimit / 1024 / 1024).toFixed(2)}MB to fit.`,
                `Think of our storage as a tiny suitcase 🧳, and your file needs to fit under ${(fileSizeLimit / 1024 / 1024).toFixed(2)}MB.`,
                `We're like a small door, and your file is a big sofa 🛋️. Can you make it under ${(fileSizeLimit / 1024 / 1024).toFixed(2)}MB?`,
                `Your file's a blockbuster hit in terms of size 🎥. Let's cut it down to under ${(fileSizeLimit / 1024 / 1024).toFixed(2)}MB.`,
                `If file sizes were drinks 🍹, yours is a bit too strong. How about under ${(fileSizeLimit / 1024 / 1024).toFixed(2)}MB?`,
                `This file's size is epic, but can we get a short story version under ${(fileSizeLimit / 1024 / 1024).toFixed(2)}MB?`
            ];

            const error = getRandomString(errorMessages);
            showNotification('Video Upload Error', error, 'error', 5000);
            setFiles([]);
            return;
        }

        if (!authState.isAuthenticated) {
            showNotification('Video Upload Error', "You aren't authenticated you donut...", 'error', 5000);
            window.location.href = "/authenticate"
            return;
        }

        // const newVideoRef = doc(collection(db, "videos"));
        // const videoId = newVideoRef.id;
        const filePath = `videos-raw/${file.name}`;

        /* Attempt to Upload Video */
        try {
            const downloadURL = await FirebaseStorageService.uploadFile(filePath, file, (progress) => {
                setUploadProgress(progress);
            });

            console.log('File uploaded successfully:', filePath);
            showNotification('Upload Success', 'File uploaded successfully!', 'success', 5000);
        } catch (error) {
            console.error('Upload error:', error);
            showNotification(
              'Upload Error',
              `Failed to upload file. \n ${error}`,
              'error',
              10000);

            return;
        }

        setFiles([file]);

        /* Attempt to Create a New Document */
        try {
            showNotification('Creating Task', 'Creating a new job... Don\'t go anywhere.', 'info', 10000);

            // Generate new User Video
            const userVideoData: UserVideo  = {
                uid: authState.user!.uid,
                originalFileName: file.name,
                processingProgress: 0,
                status: "Uploaded",
                uploadTimestamp: Date.now(),
                progressMessage: "Uploading video to transcription queue",
                videoPath: filePath,
                link: "",
                queuePosition: -1
            }

            // Generate new Video Document
            const videoDocument = userVideoToDocument(userVideoData);

            await FirebaseDatabaseService.addDocument(
              "videos",
              videoDocument,
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
        } catch (error) {
            console.log('Upload Error:', error);
            showNotification(
              'Document Upload Error',
              `Failed to Create Document. \n ${error}`,
              'error',
              10000);
            setFiles([]);
            setUploadProgress(0);
        }
    };

    const dropHandler: DragEventHandler<HTMLDivElement> = (event) => {
        event.preventDefault();
        validateAndProcessFiles(event.dataTransfer.files);
        console.log('File(s) dropped');
    };

    const dragOverHandler: DragEventHandler<HTMLDivElement> = (event) => {
        event.preventDefault();
        console.log('File(s) in drop zone');
    };

    const handleFileInputChange: ChangeEventHandler<HTMLInputElement> = (event) => {
        if (event.target.files && event.target.files.length > 0) {
            console.log('Files selected', event.target.files);
            validateAndProcessFiles(event.target.files).then((res) => {
                console.log("Uploaded file: ", res)
            });
        }
    };

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

            <div className="w-[60%] min-w-[350px] flex justify-start items-center flex-col gap-8 mb-8">
                <SquigglyUnderline
                  navigation={[{name: "Clip video"}, {name: "Script Youtube"}, {name: "Evaluate TikTok"}]}
                  setSelectedLink={setSelectedLink}
                  selectedLink={selectedLink}
                />

                <div className="w-full min-h-[200px] bg-white/5  sm:backdrop-blur-sm border-primary border rounded-xl text-white p-4">
                    {
                      selectedLink == "Clip video" && <>
                          <p className="text-2xl font-bold">Clip Video</p>

                          <label
                            className="block my-2 text-sm font-medium text-gray-900 dark:text-white"
                            htmlFor="identificationFile"
                            onClick={openFileDialog}
                          >
                              Upload Video
                              <input
                                aria-describedby="user_avatar_help"
                                className="border text-sm rounded-lg block w-full bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500 file:border-0 file:bg-gray-900 file:text-white file:p-2.5 file:rounded file:h-full mt-2"
                                id="identificationFile"
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileInputChange}
                                onDrop={dropHandler}
                                onDragOver={dragOverHandler}
                              />
                          </label>
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
                      </>
                    }
                </div>

            </div>
        </div>

        {/* Bottom Recently Used Cards */}
        <ExistingProjects />
    </div>
}