import {handleInquiry} from '../../server/cloudflare-inquiry.mjs';
import {sendConfirmation} from '../../server/gmail.mjs';
export const onRequest = ({request,env,waitUntil}) => handleInquiry(request,env,undefined,id=>waitUntil(sendConfirmation(id,env).catch(()=>{})));
