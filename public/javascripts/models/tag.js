define(['underscore', 'backbone'], function (_, Backbone) {
    return Backbone.Model.extend({      
        initialize : function () {
            this.set({
                tags : []
            });
        }
      , pushTag : function (tag) {
            this.get('tags').push(tag);
            this.trigger('change');
        }
      , resetTags : function (tags) {
            var currentTags = this.get('tags');
            _.each(tags, function(tag, index) { 
                currentTags[index] = tag;
            });
            this.trigger('change');
        } 
    });
});