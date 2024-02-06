import React, {ChangeEventHandler, DragEventHandler, useContext, useState} from "react";
import PlaygroundBackground from "../assets/playground-assets/PlaygroundBackground.png";
import {ExistingProjectCard} from "../components/cards/existing-project-card/existing-project-card";
import {DragDropFileUpload} from "../components/input/drag-drop-file-upload/drag-drop-file-upload";
import {NotificationContext} from "../contexts/NotificationProvider";

export interface PlaygroundPageProps {
    // NONE
}

function getRandomString(strings: string[]): string {
    const randomIndex = Math.floor(Math.random() * strings.length);
    return strings[randomIndex];
}

export default function PlaygroundPage() {
    const { showNotification } = useContext(NotificationContext);
    const [files, setFiles] = useState<File[]>([]);

    const validateAndProcessFiles = (newFiles: FileList) => {
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

        const fileSizeLimit = 5 * 1024 * 1024; // 5 MB
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

        // If all validations pass, reset any previous error and update state with the new file
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