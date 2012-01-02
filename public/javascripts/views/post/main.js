



require(
  [ 'jQuery'   
  , 'underscore'
  , 'backbone'
  , 'text!../templates/tag.html'
  , 'models/tag'  
  ], function($, _, Backbone, tagTemplate, Tag){
  'use strict';      
  console.log('postId : ' + postId);
  console.log('tags : ' + tags);
  console.log('typeof tags : ' + typeof tags);
  
  
  var Tags = new Tag();
  Tags.url = '/tags/' + postId;

  var TagView = Backbone.View.extend({
      el : $('#tag-list')
    , model : Tags
    , template : _.template(tagTemplate)
    , events : {
          //'click .tag-delete' : 'clear'
      }
    , initialize : function () {
          console.log('tag view initialize');
          this.model.bind('change', this.render, this);
          this.el.on('click', '.tag-delete', function (e) {
              $(this).parent('.tag-item')
                .addClass('delete');
          });
          this.el.on('click', '.tag-item.delete', function (e) {
              $(this).removeClass('delete')
          });            
      }
    , pushItem : function (tag) {
          this.model.get('tags').push(tag);
      }
    , removeItemByIndex : function (index) {                    
          console.log('index : ' + index);                              
          this.model.get('tags').splice(index, 1);
      }
    , toggleEdit : function () {
      
      }
    , render : function () {
          console.log('tagView render');    
          var model = { tags : this.model.get('tags') };
          this.el.html(this.template(model));                    
          return this;
      }
    , clear : function () {
          console.log('tagView clear');
          
      }        
  });
  
  var AppView = Backbone.View.extend({
      el : $('#wrapper')
    , editButton : $('#tag-edit')
    , createButton : $('#tag-create')
    , tagList : $('#tag-list')
    , tagView : null
    , contentView : null
    , events : {
          'click #tag-edit' : 'toggleEdit'
        , 'click #tag-create' : 'createTag'
      }
    , initialize : function () {
          console.log('initalize wrapper');
          this.tagView = new TagView();
          $('#tag-list').append(this.tagView);
          Tags.bind('reset', this.addAll, this);
          Tags.bind('change', this.save, this);
          Tags.set({ tags : tags });
          
        //  $('wrapper.editing').
      }
    , render : function () {
          console.log('render wrapper');
      }
    , toggleEdit : function () {
          console.log('toggleEdit');
          if( this.isEditing() ) {
              this.editButton.text('edit tag');
              this.el.removeClass('editing');
              this.updateTags();              
          } else {             
              this.editButton.text('save');
              this.el.addClass('editing');
          }
      }
    , isEditing : function () {
          return this.el.hasClass('editing');
      }
    , createTag : function () {
          Tags.pushTag('new tag');
      }
    , updateTags : function () {      
          var model = $('.tag-item').map(function(index){
              return $(this).children('input').val();
          });    
          Tags.resetTags(model);
          Tags.save(); 
      }
    , save : function () {
          
      }
  }); 
  
  window.App = new AppView();
  //Backbone.history.start();

  
});

