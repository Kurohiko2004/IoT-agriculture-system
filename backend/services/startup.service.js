const db = require('../models');

const cleanupPendingActions = async () => {
    try {
        const [affectedCount] = await db.Action.update(
            { status: 'TIMEOUT' },
            { where: { status: 'PENDING' } }
        );
        if (affectedCount > 0) {
            console.log(`[STARTUP] Cleaned up ${affectedCount} pending actions.`);
        }
    } catch (error) {
        console.error('[STARTUP ERROR]', error);
    }
};

module.exports = { cleanupPendingActions };