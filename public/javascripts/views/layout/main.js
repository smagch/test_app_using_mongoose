require.config({
    'baseUrl' : '/javascripts'
  , 'paths' : {
        'jQuery' : 'libs/jquery/main'
      , 'underscore' : 'libs/underscore/underscore-min'
      , 'backbone' : 'libs/backbone/main'
    }
  , 'locale' : ( locale || 'root' )
});

// require(['jQuery'], function ($) {
//     'use strict';
//     console.log('layout loaded');
//     var transEndEventNames = {
//         'WebkitTransition' : 'webkitTransitionEnd',
//         'MozTransition'    : 'transitionend',
//         'OTransition'      : 'oTransitionEnd',
//         'msTransition'     : 'msTransitionEnd', // maybe?
//         'transition'       : 'transitionEnd'
//         }
//       , transEndEventName = transEndEventNames[ Modernizr.prefixed('transition') ];
//     console.log('transEndEventName : ' + transEndEventName);
//     
//     // $(document).ready(function () {
//     //     console.log('document loaded');
//     //     $('#login-button').on('click', function () {
//     //         console.log('click');
//     //         $('#wrapper').toggleClass('login');
//     //     })
//     // 
//     // });
//     $(document).ready(function () {
//         
//         $('#login-button').on('click', function (e) {
//             
// 
//             
//         });
//     });
// });


