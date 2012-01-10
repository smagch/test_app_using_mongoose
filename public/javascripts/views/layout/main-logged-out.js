require.config({
    'baseUrl' : '/javascripts'
  , 'paths' : {
        'jQuery' : 'libs/jquery/main'
      , 'underscore' : 'libs/underscore/underscore-min'
      , 'backbone' : 'libs/backbone/main'
    }
  , 'locale' : ( locale || 'jp' )
});

require(['jQuery', 'i18n!views/layout/nls/content'], function ($, content) {
  $(document).ready(function () {
		$('#login-button').on('click', function (e) {
			console.log('click');
			require(['views/layout/login-modal'], function (modal) {
					modal.show();
			});		
		});
		
		for(var id in content) {
		  $('#'+id).text(content[id]);
		}
	});
});