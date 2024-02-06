import React, {ChangeEventHandler, DragEventHandler, useState} from "react";
import PlaygroundBackground from "../assets/playground-assets/PlaygroundBackground.png";
import {ExistingProjectCard} from "../components/cards/existing-project-card/existing-project-card";
import {DragDropFileUpload} from "../components/input/drag-drop-file-upload/drag-drop-file-upload";

export interface PlaygroundPageProps {
    // NONE
}

export default function PlaygroundPage() {
    const [files, setFiles] = useState<File[]>([]);
    const [error, setError] = useState<string | null>(null); // For displaying error messages

    const validateAndProcessFiles = (newFiles: FileList) => {
        if (newFiles.length !== 1) {
            setError('Please upload only one file.');
            return;
        }

        const file = newFiles[0];

        if (!file.type.includes('mp4')) {
            setError('File must be an MP4 video.');
            return;
        }

        const fileSizeLimit = 1024 * 1024; // For example, 1MB
        if (file.size > fileSizeLimit) {
            setError(`File must be smaller than ${fileSizeLimit / 1024 / 1024}MB.`);
            return;
        }

        // If all validations pass, reset any previous error and update state with the new file
        setError(null);
        setFiles([file]); // Replace the current file(s) with the new file
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
            validateAndProcessFiles(event.target.files); // Corrected to use validateAndProcessFiles
        }
    };

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
                <DragDropFileUpload dragOverHandler={dragOverHandler} dropHandler={dropHandler} handleFileInputChange={handleFileInputChange}/>
                {files.map((file) => (
                    <p>{file.name}</p>
                ))}
                {error && <p style={{ color: 'red' }}>{error}</p>}
            </div>
        </div>

        {/* Bottom Recently Used Cards */}
        <div className={"w-full min-h-full border-t border-accent flex justify-center items-center flex-col gap-[10] p-5"}>
            { /* Existing Projects Title */}
            <div className={"container h-full flex-col justify-center items-start"}>
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
                        projectId={elem.toString()}
                    />
                })}

            </div>

        </div>

    </div>
}