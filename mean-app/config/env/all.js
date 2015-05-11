'use strict';

var MINUTE = 60000,
  HOUR = 60 * MINUTE,
  DAY = 24 * HOUR,
  YEAR = 365 * DAY;

module.exports = {
  app                 : {
    title       : 'Swara Server',
    description : 'A MEAN.js based node-webkit desktop/server application that catalogs your music collection and streams it to the Swara client apps.',
    keywords    : 'swara, swara-server, mp3-streaming, self-hosted, nodejs, meanjs, node-webkit, music-streaming, music-library'
  },
  appLogFile          : 'swara-server.log',
  libraryLogFile      : 'swara-server-library.log',
  libraryLogSeparator : '\n\n**** SEPARATOR ****\n\n\n',
  port                : process.env.PORT || 3000,
  templateEngine      : 'swig',
  cookieMaxAge        : YEAR,
  sessionSecret       : 'swara-asdkjadsknasd-server',
  sessionCollection   : 'sessions',
  assets              : {
    lib   : {
      css : [
        'public/lib/bootstrap/dist/css/bootstrap.css',
        'public/lib/bootstrap/dist/css/bootstrap-theme.css',
        'public/lib/angular-busy/dist/angular-busy.css'
      ],
      js  : [
        'public/lib/angular/angular.js',
        'public/lib/angular-resource/angular-resource.js',
        'public/lib/angular-cookies/angular-cookies.js',
        'public/lib/angular-animate/angular-animate.js',
        'public/lib/angular-touch/angular-touch.js',
        'public/lib/angular-sanitize/angular-sanitize.js',
        'public/lib/angular-ui-router/release/angular-ui-router.js',
        'public/lib/angular-ui-utils/ui-utils.js',
        'public/lib/angular-bootstrap/ui-bootstrap-tpls.js',
        'public/lib/angular-prompt/dist/angular-prompt.js',
        'public/lib/angular-utils-pagination/dirPagination.js',
        'public/lib/angular-breadcrumb/release/angular-breadcrumb.js',
        'public/lib/angular-scroll-glue/src/scrollglue.js',
        'public/lib/angular-busy/dist/angular-busy.js'
      ]
    },
    css   : [
      'public/modules/**/css/*.css'
    ],
    js    : [
      'public/config.js',
      'public/application.js',
      'public/modules/*/*.js',
      'public/modules/*/*[!tests]*/*.js'
    ],
    tests : [
      'public/lib/angular-mocks/angular-mocks.js',
      'public/modules/*/tests/*.js'
    ]
  }
};
