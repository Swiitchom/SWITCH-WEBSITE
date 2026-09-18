import {recordVisit} from '../../server/public-stats.mjs';
export const onRequest=({request,env})=>recordVisit(request,env);
