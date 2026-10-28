"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SERVICE_TYPE_LABELS = exports.DEFAULT_SERVICE_TIMES = exports.SERVICE_ROLES = void 0;
exports.getServiceRoles = getServiceRoles;
exports.isRoleForService = isRoleForService;
/**
 * The roles of each service, in the order the service runs
 * (CONTEXT.md section 3). One source of truth: the assignment screen, the
 * details screen and the validator all read this list.
 *
 * There is no multimedia role. It was removed on purpose.
 */
exports.SERVICE_ROLES = {
    saturday: ['Exhortation', 'Songlead', 'Guitarist', 'Moderator/Host'],
    sunday: ['Song leader', 'Guitarist', 'Bassist', 'Drummer', 'Preacher']
};
/** Default start times in Manila (CONTEXT.md section 9), as HH:mm. */
exports.DEFAULT_SERVICE_TIMES = {
    saturday: '15:00',
    sunday: '09:00'
};
exports.SERVICE_TYPE_LABELS = {
    saturday: 'Saturday Prayer Meeting',
    sunday: 'Sunday Service'
};
function getServiceRoles(type) {
    return exports.SERVICE_ROLES[type];
}
/**
 * Only one member per role for now. PLAN.md section 2 allows a repeatable role
 * (more than one Guitarist); that is deferred until the team asks for it, so
 * the rule stays simple and the app can never drop a duplicate silently.
 */
function isRoleForService(type, role) {
    return getServiceRoles(type).includes(role);
}
