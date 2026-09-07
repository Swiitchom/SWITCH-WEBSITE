import {googleAuth} from '../../../server/admin-auth.mjs';
export const onRequest=({request,env})=>googleAuth(request,env);
