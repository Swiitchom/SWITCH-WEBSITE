import {adminAPI} from '../../../server/admin-api.mjs';
export const onRequest=({request,env})=>adminAPI(request,env);
