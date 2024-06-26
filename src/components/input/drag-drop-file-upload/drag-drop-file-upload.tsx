import React, {ChangeEventHandler, DragEventHandler, useRef} from "react";
import "./drag-and-drop.css";

export interface DragDropFileUploadProps {
    text: string;
    dropHandler: DragEventHandler<HTMLDivElement>;
    dragOverHandler: DragEventHandler<HTMLDivElement>;
    handleFileInputChange: ChangeEventHandler<HTMLInputElement>;
}

export const DragDropFileUpload:React.FC<DragDropFileUploadProps> = ({text, dropHandler, dragOverHandler, handleFileInputChange}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const openFileDialog = () => {
        fileInputRef.current?.click();
    };

    return <div
        id="drop_zone"
        onDrop={dropHandler}
        onDragOver={dragOverHandler}
        onClick={openFileDialog}
        className={"border-white border hover:border-2 hover:bg-white/5 flex justify-center  items-center relative w-[250px] h-[100px] hover:rounded-3xl overflow-hidden hover:scale-105 transition-all"}
    >
        {/*<div className={"rotate-45  rounded-full  border-primary border hover:border-2  absolute w-[250px] h-[150px] overflow-hidden hover:scale-105 transition-all hoverable"} />*/}
        {/*<div className={"-rotate-45  rounded-full border-primary border hover:border-2 absolute w-[250px] h-[150px]  overflow-hidden hover:scale-105 transition-all hoverable"} />*/}
        <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange} // Reuse the dropHandler or define a separate handler for file selection
            style={{ display: 'none' }} // Hide the file input
        />
        <p className={"font-bold text-white z-10 hover:underline transition-all"}>{text}</p>
    </div>
}