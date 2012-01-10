define(['jQuery', 'text!views/layout/login-modal.html'], function ($, template) {
    var modal = {
        show : function () {
          $('body').append(template);
          $('#modal-delete').on('click', function (e) {
            $('.modal').remove();
          });
        }
    }    
    return modal;
});