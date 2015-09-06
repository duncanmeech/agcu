/**
 * application configuration settings
 */
module.exports = {

    mongourl: "",

    mongourlProduction : 'mongodb://admin:j4f6d2e9@ds035573.mongolab.com:35573/heroku_gwg1zrlq',

    // local DB for development, cubool-local
    mongourlDevelopment: 'mongodb://127.0.0.1/nucleotides',

    // cookie secret
    cookieSecret: '8f56a5ce-4c6d-44bb-bf3c-fecd5c50b810',

    // the port number passed to the listen handler for the app, set in app.js at startup
    PORT              : null,

    // if true we are running in production. Value is set at startup
    production        : false,

};
