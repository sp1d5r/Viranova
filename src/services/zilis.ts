import axios, {AxiosResponse} from 'axios';
import {VectorVideo, VectorSimilarity} from "../types/Video";

const url = process.env.REACT_APP_ZILLIZ_URI
const headers = {
    Authorization: 'Bearer ' + process.env.REACT_APP_ZILLIZ_BEARER_TOKEN,
    Accept: 'application/json',
    'Content-Type': 'application/json'
}

interface VectorVideoResponse {
    code: number;
    data: VectorVideo[];
}

interface VectorSimilaritiesResponse {
    code: number;
    data: VectorSimilarity[];
}


const getRelatedOriginalVideos = async (videoEmbedding: number[]) : Promise<VectorSimilarity[] | undefined> => {
    const options = {
        method: 'POST',
        url:  url + 'v1/vector/search',
        headers: headers,
        data: `{"collectionName":"video_embeddings","vector":${JSON.stringify(videoEmbedding)},"limit":10,"outputFields":["video_id","video_type"],"filter":"video_type==\'ORIGINAL\'"}`
    };

    try {
        const response : AxiosResponse<VectorSimilaritiesResponse>= await axios.request(options);
        return response.data.data;
    } catch (error) {
        console.error(error);
    }
}

const  getShorts = async () => {
    const options = {
        method: 'POST',
        url: url + 'v1/vector/query',
        headers: headers,
        data: '{"collectionName":"video_embeddings","filter":"video_type==\'SHORT\'"}'
    };

    try {
        const response: AxiosResponse<VectorVideoResponse> = await axios.request(options);
        return response.data.data;
    } catch (error) {
        console.error(error);
    }
}


export { getShorts, getRelatedOriginalVideos};
