import {publicStats} from '../../server/public-stats.mjs';
export const onRequest=({request,env})=>publicStats(request,env);
