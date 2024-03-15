// TODO: Hardcoded for now
const isLocal = window.location.protocol === 'http:' && window.location.port === '8081';

export const CHAOS_ARCHIVES_ROOT = isLocal ? 'http://local.chaosarchives.org:8080' : 'https://chaosarchives.org';
export const CENTRAL_ARCHIVES_ROOT = isLocal ? 'http://local.centralarchives.org:8080' : 'https://centralarchives.org';
