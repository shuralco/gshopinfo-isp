/**
 * Site Setting lifecycle hooks for real-time updates
 */

module.exports = {
  async afterUpdate(event) {
    const { result } = event;
    
    // Import the broadcast function
    const { broadcastUpdate } = require('../../../../middlewares/sse-updates');
    const { runPrefetch } = require('../../../../utils/prefetch-runner');
    
    // Broadcast the update to all connected clients
    broadcastUpdate({
      type: 'site-setting',
      action: 'updated',
      data: result
    });
    
    console.log('Site setting updated, broadcasted to clients');

    runPrefetch('site-setting afterUpdate');
  },

  async afterCreate(event) {
    const { result } = event;
    
    const { broadcastUpdate } = require('../../../../middlewares/sse-updates');
    const { runPrefetch } = require('../../../../utils/prefetch-runner');
    
    broadcastUpdate({
      type: 'site-setting',
      action: 'created',
      data: result
    });
    
    console.log('Site setting created, broadcasted to clients');

    runPrefetch('site-setting afterCreate');
  }
};
