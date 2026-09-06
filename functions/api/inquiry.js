import {handleInquiry} from '../../server/cloudflare-inquiry.mjs';
export const onRequest = ({request,env}) => handleInquiry(request,env);
