import React from "react";
import {Frame} from "./Frame";
import {SegmentationMask} from "./SegmentationMask";

export interface SegmentationGroup {
    frames: Frame[];
    segmentationMasks: SegmentationMask[][];
    spacialGroups: number[][]; // For each frame we have groups of segments
    temporalGroups: number[]; // across frames we have groups of groups.
    videoId: string;
}
