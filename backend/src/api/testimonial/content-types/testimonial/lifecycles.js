/**
 * Testimonial lifecycle hooks for real-time updates
 */

module.exports = {
  async afterUpdate(event) {
    const { result } = event;
    
    const { broadcastUpdate } = require('../../../../middlewares/sse-updates');
    const { runPrefetch } = require('../../../../utils/prefetch-runner');
    
    broadcastUpdate({
      type: 'testimonial',
      action: 'updated',
      data: result
    });
    
    console.log('Testimonial updated, broadcasted to clients');

    runPrefetch('testimonial afterUpdate');
  },

  async afterCreate(event) {
    const { result } = event;
    
    const { broadcastUpdate } = require('../../../../middlewares/sse-updates');
    const { runPrefetch } = require('../../../../utils/prefetch-runner');
    
    broadcastUpdate({
      type: 'testimonial',
      action: 'created',
      data: result
    });
    
    console.log('Testimonial created, broadcasted to clients');

    runPrefetch('testimonial afterCreate');
  },

  async afterDelete(event) {
    const { result } = event;
    
    const { broadcastUpdate } = require('../../../../middlewares/sse-updates');
    const { runPrefetch } = require('../../../../utils/prefetch-runner');
    
    broadcastUpdate({
      type: 'testimonial',
      action: 'deleted',
      data: result
    });
    
    console.log('Testimonial deleted, broadcasted to clients');

    runPrefetch('testimonial afterDelete');
  }
};
