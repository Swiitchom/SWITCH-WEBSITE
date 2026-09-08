import {serveProjectVideo} from '../../../server/project-video.mjs';
export const onRequest=({request,env})=>serveProjectVideo(request,env);
