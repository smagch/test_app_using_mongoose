require.config({
    'baseUrl' : '/javascripts'
  , 'paths' : {
        'jQuery' : 'libs/jquery/main'
      , 'underscore' : 'libs/underscore/underscore-min'
      , 'backbone' : 'libs/backbone/main'
    }
  , 'locale' : ( locale || 'root' )
});

require(['jQuery'], function ($) {
    'use strict';
    console.log('layout loaded');
    var transEndEventNames = {
        'WebkitTransition' : 'webkitTransitionEnd',
        'MozTransition'    : 'transitionend',
        'OTransition'      : 'oTransitionEnd',
        'msTransition'     : 'msTransitionEnd', // maybe?
        'transition'       : 'transitionEnd'
        }
      , transEndEventName = transEndEventNames[ Modernizr.prefixed('transition') ];
    console.log('transEndEventName : ' + transEndEventName);
    
    $(document).ready(function () {
        console.log('document loaded');
        $('#login-button').on('click', function () {
            console.log('click');
            $('#wrapper').toggleClass('login');
        })
        return;        
        var loginBox = $('#login-box');
        $('#login-button').toggle(function () {            
            console.log('clickd');            
            loginBox.queue(function () {
                $('#wrapper').addClass('login');
                var h = loginBox.innerHeight();
                loginBox.css({
                    overflow : 'hidden'
                  , height : 0
                });
                setTimeout(function () {  
                    console.log('h : ' + h);
                    loginBox.css('height', h);                     
                 }, 10);
                setTimeout(function () {
                    loginBox.dequeue();
                    console.log('dequeue');
                }, 3000);
            });                    
            return false;            
            
        }, function () {
            loginBox.queue(function () {
                loginBox.css('height', '0');          
                setTimeout(function () {                  
                    loginBox.css('height', '');
                    $('#wrapper').toggleClass('login');
                    loginBox.dequeue();
                    console.log('dequeue too');
                }, 3000);
            });            
            return false;
        });        
    });
    
    
    
    
    
    
    
    
    return;
});