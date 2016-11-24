var mbaasApi = require('fh-mbaas-api');
var express = require('express');
var mbaasExpress = mbaasApi.mbaasExpress();
var cors = require('cors');
var mongo_express = require('mongo-express/lib/middleware');
var mongo_express_config = require('./mongo_express_config');

// list the endpoints which you want to make securable here
var securableEndpoints;
securableEndpoints = [];

var app = express();

// Enable CORS for all requests
app.use(cors());

// Note: the order which we add middleware to Express here is important!
app.use('/sys', mbaasExpress.sys(securableEndpoints));
app.use('/mbaas', mbaasExpress.mbaas);

// allow serving of static files from the public directory
app.use(express.static(__dirname + '/public'));

// Note: important that this is added just before your own Routes
app.use(mbaasExpress.fhmiddleware());

function checkEnvVar(req, res, next) {
	if (typeof process.env.MONGO_CONN_URL_APP !== 'string') {
		res.redirect('/mongo-url-error.hthml');
	} else {
		return next();
	}
}


app.use('/', checkEnvVar, mongo_express(mongo_express_config));

// Important that this is last!
app.use(mbaasExpress.errorHandler());

var port = process.env.FH_PORT || process.env.OPENSHIFT_NODEJS_PORT || 8001;
var host = process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';
app.listen(port, host, function() {
  console.log("App started at: " + new Date() + " on port: " + port); 
});
