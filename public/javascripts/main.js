console.log('main.js load');
require.config({
  baseUrl: "/javascripts"
// , paths : {
//     'some' : 'some/v1.0'
//   }
, waitSeconds: 15
// , locale : 'fr-fr'
, packagePaths: {
      ".packages": ["Porter", 'jquery', 'underscore', 'backbone']
  }
, packages: ["ui"]
});