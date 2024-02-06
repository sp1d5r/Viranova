import React from "react";
import PlaygroundBackground from "../assets/playground-assets/PlaygroundBackground.png";

export interface PlaygroundPageProps {
    // NONE
}

export default function PlaygroundPage() {
    return <div className={"w-full h-[100vh]"}>
        {/* Main Green Top Part*/}
        <div className={"w-full h-1/2 max-h-[700px] relative"}>
            <img
                src={PlaygroundBackground}
                alt={"Oh no... I didn't load :( "}
                className={"absolute h-full w-full object-cover -z-0"}
            />
            <div
                className={"relative flex w-full h-full flex-col justify-center items-center gap-5 z-10"}
            >
                <p>Uplaod Video</p>
                <p>Upload Text</p>
            </div>
        </div>

        {/* Bottom Recently Used Cards */}
        <div className={"w-full h-full border-t border-accent flex justify-center items-center flex-col gap-[10] p-5"}>
            { /* Existing Projects Title */}
            <div className={"container h-full flex-col justify-center items-start"}>
                <div>
                    <h1 className={"text-title text-white"}>Existing Projects </h1>
                    <p className={"text-gray-500"}>Look through your existing projects to edit or export! </p>
                </div>
            </div>

            { /* Existing Projects Carousel */ }

            <div className={"grid grid-cols-3"}>


            </div>

        </div>

    </div>
}