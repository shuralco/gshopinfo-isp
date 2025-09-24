/**
 * Feature lifecycle hooks for real-time updates and cache refresh
 */

module.exports = {
  async afterUpdate(event) {
    const { result } = event;

    const { broadcastUpdate } = require('../../../../middlewares/sse-updates');
    const { runPrefetch } = require('../../../../utils/prefetch-runner');

    broadcastUpdate({
      type: 'feature',
      action: 'updated',
      data: result,
    });

    console.log('Feature updated, broadcasted to clients');

    runPrefetch('feature afterUpdate');
  },

  async afterCreate(event) {
    const { result } = event;

    const { broadcastUpdate } = require('../../../../middlewares/sse-updates');
    const { runPrefetch } = require('../../../../utils/prefetch-runner');

    broadcastUpdate({
      type: 'feature',
      action: 'created',
      data: result,
    });

    console.log('Feature created, broadcasted to clients');

    runPrefetch('feature afterCreate');
  },

  async afterDelete(event) {
    const { result } = event;

    const { broadcastUpdate } = require('../../../../middlewares/sse-updates');
    const { runPrefetch } = require('../../../../utils/prefetch-runner');

    broadcastUpdate({
      type: 'feature',
      action: 'deleted',
      data: result,
    });

    console.log('Feature deleted, broadcasted to clients');

    runPrefetch('feature afterDelete');
  },
};
