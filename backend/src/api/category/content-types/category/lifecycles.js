/**
 * Category lifecycle hooks for real-time updates
 */

module.exports = {
  async afterUpdate(event) {
    const { result } = event;
    
    const { broadcastUpdate } = require('../../../../middlewares/sse-updates');
    const { runPrefetch } = require('../../../../utils/prefetch-runner');
    
    broadcastUpdate({
      type: 'category',
      action: 'updated',
      data: result
    });
    
    console.log('Category updated, broadcasted to clients');

    runPrefetch('category afterUpdate');
  },

  async afterCreate(event) {
    const { result } = event;
    
    const { broadcastUpdate } = require('../../../../middlewares/sse-updates');
    const { runPrefetch } = require('../../../../utils/prefetch-runner');
    
    broadcastUpdate({
      type: 'category',
      action: 'created',
      data: result
    });
    
    console.log('Category created, broadcasted to clients');

    runPrefetch('category afterCreate');
  },

  async afterDelete(event) {
    const { result } = event;
    
    const { broadcastUpdate } = require('../../../../middlewares/sse-updates');
    const { runPrefetch } = require('../../../../utils/prefetch-runner');
    
    broadcastUpdate({
      type: 'category',
      action: 'deleted',
      data: result
    });
    
    console.log('Category deleted, broadcasted to clients');

    runPrefetch('category afterDelete');
  }
};
