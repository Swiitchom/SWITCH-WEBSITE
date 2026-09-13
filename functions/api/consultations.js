import {consultationPublic} from '../../server/consultations.mjs';
import {sendNotifications} from '../../server/gmail.mjs';
export const onRequest=({request,env,waitUntil})=>consultationPublic(request,env,{notify:id=>waitUntil(sendNotifications(id,env).catch(()=>{}))});
