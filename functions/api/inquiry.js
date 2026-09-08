import {handleInquiry} from '../../server/cloudflare-inquiry.mjs';
import {sendNotifications} from '../../server/gmail.mjs';
export const onRequest = ({request,env,waitUntil}) => handleInquiry(request,env,undefined,id=>waitUntil(sendNotifications(id,env).catch(()=>{})));
