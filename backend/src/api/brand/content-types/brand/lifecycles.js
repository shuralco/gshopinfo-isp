/**
 * Brand lifecycle hooks for real-time updates
 */

module.exports = {
  async afterUpdate(event) {
    const { result } = event;
    
    const { broadcastUpdate } = require('../../../../middlewares/sse-updates');
    const { runPrefetch } = require('../../../../utils/prefetch-runner');
    
    broadcastUpdate({
      type: 'brand',
      action: 'updated',
      data: result
    });
    
    console.log('Brand updated, broadcasted to clients');

    runPrefetch('brand afterUpdate');
  },

  async afterCreate(event) {
    const { result } = event;
    
    const { broadcastUpdate } = require('../../../../middlewares/sse-updates');
    const { runPrefetch } = require('../../../../utils/prefetch-runner');
    
    broadcastUpdate({
      type: 'brand',
      action: 'created',
      data: result
    });
    
    console.log('Brand created, broadcasted to clients');

    runPrefetch('brand afterCreate');
  },

  async afterDelete(event) {
    const { result } = event;
    
    const { broadcastUpdate } = require('../../../../middlewares/sse-updates');
    const { runPrefetch } = require('../../../../utils/prefetch-runner');
    
    broadcastUpdate({
      type: 'brand',
      action: 'deleted',
      data: result
    });
    
    console.log('Brand deleted, broadcasted to clients');

    runPrefetch('brand afterDelete');
  }
};
