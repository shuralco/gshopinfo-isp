/**
 * Hero Section lifecycle hooks for real-time updates
 */

module.exports = {
  async afterUpdate(event) {
    const { result } = event;
    
    const { broadcastUpdate } = require('../../../../middlewares/sse-updates');
    const { runPrefetch } = require('../../../../utils/prefetch-runner');
    
    broadcastUpdate({
      type: 'hero-section',
      action: 'updated',
      data: result
    });
    
    console.log('Hero section updated, broadcasted to clients');

    runPrefetch('hero-section afterUpdate');
  },

  async afterCreate(event) {
    const { result } = event;
    
    const { broadcastUpdate } = require('../../../../middlewares/sse-updates');
    const { runPrefetch } = require('../../../../utils/prefetch-runner');
    
    broadcastUpdate({
      type: 'hero-section',
      action: 'created',
      data: result
    });
    
    console.log('Hero section created, broadcasted to clients');

    runPrefetch('hero-section afterCreate');
  }
};
