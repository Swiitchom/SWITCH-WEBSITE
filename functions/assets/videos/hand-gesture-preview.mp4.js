import {serveHandGestureVideo} from '../../../server/hand-gesture-video.mjs';
export const onRequest=({request})=>serveHandGestureVideo(request);
