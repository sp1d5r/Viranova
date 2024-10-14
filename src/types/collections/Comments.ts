import {DocumentData, Timestamp} from "firebase/firestore";
import FirebaseDatabaseService from "../../services/database/strategies/FirebaseFirestoreService";
import FirebaseStorageService from "../../services/storage/strategies/FirebaseStorageService";
import {BoundingBoxes, Logs, Short, TwoBoundingBoxes} from "./Shorts";

interface CommentTag {
  tag: string;
  explanation: string;
}

export interface Comment {
  id?: string;
  avatarThumbnail: string;
  comment_cid: string;
  comment_uid: string;
  createTime: Timestamp,
  likes: number;
  replyCommentTotal: number;
  shortId: string;
  text: string;
  uid: string;
  uniqueId: string;
  // Tag information
  tags?: CommentTag[];
  tagsParsed?: boolean;
}

export function documentToComment(docData: DocumentData): Comment {
  return {
    id: docData.id,
    avatarThumbnail: docData.avatarThumbnail,
    comment_cid: docData.comment_cid,
    comment_uid: docData.comment_uid,
    createTime: docData.createTime,
    likes: docData.diggCount,
    replyCommentTotal: docData.replyCommentTotal,
    shortId: docData.shortId,
    text: docData.text,
    uid: docData.uid,
    uniqueId: docData.uniqueId,
    tags: docData.tagsParsed ? docData.tags as CommentTag[] : [],
    tagsParsed: docData.tagsParsed,
  };
}

