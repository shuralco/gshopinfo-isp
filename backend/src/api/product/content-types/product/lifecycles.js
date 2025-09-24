/**
 * Product lifecycle hooks for real-time updates
 */

module.exports = {
  async afterUpdate(event) {
    const { result } = event;
    
    const { broadcastUpdate } = require('../../../../middlewares/sse-updates');
    const { runPrefetch } = require('../../../../utils/prefetch-runner');
    
    broadcastUpdate({
      type: 'product',
      action: 'updated',
      data: result
    });
    
    console.log('Product updated, broadcasted to clients');

    runPrefetch('product afterUpdate');
  },

  async afterCreate(event) {
    const { result } = event;
    
    const { broadcastUpdate } = require('../../../../middlewares/sse-updates');
    const { runPrefetch } = require('../../../../utils/prefetch-runner');
    
    broadcastUpdate({
      type: 'product',
      action: 'created',
      data: result
    });
    
    console.log('Product created, broadcasted to clients');

    runPrefetch('product afterCreate');
  },

  async afterDelete(event) {
    const { result } = event;
    
    const { broadcastUpdate } = require('../../../../middlewares/sse-updates');
    const { runPrefetch } = require('../../../../utils/prefetch-runner');
    
    broadcastUpdate({
      type: 'product',
      action: 'deleted',
      data: result
    });
    
    console.log('Product deleted, broadcasted to clients');

    runPrefetch('product afterDelete');
  }
};
