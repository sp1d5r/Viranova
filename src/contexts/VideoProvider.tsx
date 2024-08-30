import { useState, useEffect, useRef, useCallback } from 'react';
import { UserVideo, documentToUserVideo } from "../types/collections/UserVideo";
import { Transcript, documentToTranscript } from "../types/collections/Transcript";
import { Segment, documentToSegment } from "../types/collections/Segment";
import { useNotification } from "./NotificationProvider";
import FirebaseDatabaseService from "../services/database/strategies/FirebaseFirestoreService";

export const useVideoData = (videoId: string | null) => {
  const [video, setVideo] = useState<UserVideo | null>(null);
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const { showNotification } = useNotification();

  const videoRef = useRef<UserVideo | null>(null);
  const transcriptsRef = useRef<Transcript[]>([]);
  const segmentsRef = useRef<Segment[]>([]);
  const lastVideoIdRef = useRef<string | null>(null);

  const fetchVideo = useCallback((id: string) => {
    FirebaseDatabaseService.getDocument<UserVideo>(
      'videos',
      id,
      (document) => {
        if (document) {
          const newVideo = documentToUserVideo(document);
          if (JSON.stringify(newVideo) !== JSON.stringify(videoRef.current)) {
            videoRef.current = newVideo;
            setVideo(newVideo);
          }
        }
      },
      (error) => {
        console.error("Failed to fetch video:", error);
        showNotification("Document Collection", "Failed to get the document", "error", 5000);
      }
    );
  }, [showNotification]);

  const fetchTranscriptsAndSegments = useCallback((id: string) => {
    FirebaseDatabaseService.queryDocuments(
      "transcriptions",
      "video_id",
      id,
      "index",
      (transcriptDocs) => {
        const newTranscripts = transcriptDocs.map(documentToTranscript);
        if (JSON.stringify(newTranscripts) !== JSON.stringify(transcriptsRef.current)) {
          transcriptsRef.current = newTranscripts;
          setTranscripts(newTranscripts);
        }
      },
      (error) => {
        console.error("Failed to fetch transcripts:", error);
        showNotification("Transcript Error", "Failed to get transcripts", "error", 5000);
      }
    );

    FirebaseDatabaseService.queryDocuments<Segment>(
      "topical_segments",
      "video_id",
      id,
      "index",
      (segmentDocs) => {
        const newSegments = segmentDocs.map(documentToSegment);
        if (JSON.stringify(newSegments) !== JSON.stringify(segmentsRef.current)) {
          segmentsRef.current = newSegments;
          setSegments(newSegments);
        }
      },
      (error) => {
        console.error("Failed to fetch segments:", error);
        showNotification("Segments Error", "Failed to get segments", "error", 5000);
      }
    );
  }, [showNotification]);

  useEffect(() => {
    if (videoId && videoId !== lastVideoIdRef.current) {
      lastVideoIdRef.current = videoId;
      fetchVideo(videoId);
      fetchTranscriptsAndSegments(videoId);

      const videoUnsubscribe = FirebaseDatabaseService.listenToDocument<UserVideo>(
        "videos",
        videoId,
        (document) => {
          if (document) {
            const newVideo = documentToUserVideo(document);
            if (JSON.stringify(newVideo) !== JSON.stringify(videoRef.current)) {
              videoRef.current = newVideo;
              setVideo(newVideo);
            }
          }
        },
        (error) => {
          console.error("Failed to listen to video document:", error);
        }
      );

      const segmentsUnsubscribe = FirebaseDatabaseService.listenToQuery<Segment>(
        "topical_segments",
        "video_id",
        videoId,
        "index",
        (segmentDocs) => {
          console.log('Received segments update:', segmentDocs);
          if (segmentDocs){
            const newSegments = segmentDocs.map(doc => documentToSegment(doc));
            if (JSON.stringify(newSegments) !== JSON.stringify(segmentsRef.current)) {
              segmentsRef.current = newSegments;
              setSegments(newSegments);
            }
          }
        },
        (error) => {
          console.error("Failed to listen to segments:", error);
          showNotification("Segments Error", "Failed to listen to segments", "error", 5000);
        }
      );

      return () => {
        videoUnsubscribe();
        segmentsUnsubscribe();
      };
    }
  }, [videoId, fetchVideo, fetchTranscriptsAndSegments, showNotification]);

  return { video, transcripts, segments };
};