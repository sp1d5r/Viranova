import React, {useEffect, useRef, useState} from 'react';
import {TransparentNavigationBar} from '../components/navigation-bar/transparent-navigation-bar';
import {ExistingProjects} from '../components/playground/ExistingProjects';
import {CreateProject} from '../components/playground/CreateProject';
import LogoIcon from "../assets/logo/Scissors.svg";
import gsap from "gsap";
import {SquigglyUnderline} from "../components/ui/squiggly-line";
import {BackgroundBeams} from "../components/ui/background-beams";

export default function PlaygroundPage() {
    const comp = useRef(null);
    const [selectedLink, setSelectedLink] = useState("Clip video");

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

        {/* New Project */}
        {/*<div className={'w-full h-1/2 max-h-[700px] min-h-[500px] relative'}>*/}


        {/*    <img*/}
        {/*        src={PlaygroundBackground}*/}
        {/*        alt={'Oh no... I didn\'t load :( '}*/}
        {/*        className={'absolute h-full w-full object-cover -z-0'}*/}
        {/*    />*/}
        {/*    <CreateProject />*/}
        {/*</div>*/}

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

                          <label className="block my-2 text-sm font-medium text-gray-900 dark:text-white" htmlFor="identificationFile">
                              Upload Video
                              <input
                                aria-describedby="user_avatar_help"
                                className="border text-sm rounded-lg block w-full bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500 file:border-0 file:bg-gray-900 file:text-white file:p-2.5 file:rounded file:h-full mt-2"
                                id="identificationFile"
                                type="file"
                                // onChange={handleFileChange}
                              />
                          </label>
                          <div className="w-full border-b border-accent/20 my-2"/>
                          <label htmlFor="helper-text" className="block my-2 text-sm font-medium text-gray-900 dark:text-white">
                              Or send a YouTube link
                              <input type="email" id="helper-text" aria-describedby="helper-text-explanation" className="border my-1 text-sm rounded-lg block w-full px-2.5 py-1  bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" placeholder="youtube.com/w?dsjknvsfv" />
                          </label>
                          <p id="helper-text-explanation" className="mt-2 text-sm text-gray-500 dark:text-gray-400">Only use YouTube videos you have permission to select.</p>
                          <button type="button" className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 my-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">Continue</button>

                      </>
                    }
                </div>

            </div>
        </div>

        {/* Bottom Recently Used Cards */}
        <ExistingProjects />
    </div>
}