import React, {ChangeEventHandler, DragEventHandler, useRef} from "react";
import BGDots from "../../../assets/input/dots-background.svg";
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
        className={"border-accent border-2 flex justify-center items-center relative w-[250px] h-[150px] rounded-3xl overflow-hidden hover:scale-105 transition-all"}
    >
        <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange} // Reuse the dropHandler or define a separate handler for file selection
            style={{ display: 'none' }} // Hide the file input
        />
        <img src={BGDots} alt={""} className={"absolute z-0 w-[110%] h-[110%] object-cover hover:scale-125 transition-all"} />
        <p className={"font-bold text-accent z-10 hover:underline transition-all"}>{text}</p>
    </div>
}