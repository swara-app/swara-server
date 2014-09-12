'use strict';

var express = require('express'),
    path = require('path'),
    nedb = require('nedb'),
    compress = require('compression'),
    methodOverride = require('method-override'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    databaseUrl = 'db/items.db';

var db = {
    items : new nedb({
        filename : databaseUrl,
        autoload : true
    })
};

var app = express();

app.set('port', process.env.PORT || 3000);

// Should be placed before express.static
app.use(compress({
    filter : function (req, res) {
        return (/json|text|javascript|css/).test(res.getHeader('Content-Type'));
    },
    level  : 9
}));

// Environment dependent middleware
if (process.env.NODE_ENV === 'development') {
    // Enable logger (morgan)
    app.use(morgan('dev'));

    // Disable views cache
    app.set('view cache', false);
} else if (process.env.NODE_ENV === 'production') {
    app.locals.cache = 'memory';
}

// Request body parsing middleware should be above methodOverride
app.use(bodyParser.urlencoded({
    extended : true
}));
app.use(bodyParser.json());
app.use(methodOverride());

// Setting the app router and static folder
app.use(express.static(path.join(__dirname, '.')));

app.get('/api', function (req, res) {
    res.send('API is running');
});

app.get('/items', function (req, res) {
    db.items.find({}, function (err, result) {
        res.send(result);
    });
});

app.post('/items', function (req, res) {
    var item = req.body;
    db.items.insert(item, function (err, result) {
        if (err) {
            res.send({
                'error' : 'An error has occurred'
            });
        } else {
            console.log('Success: ' + JSON.stringify(result));
            res.send(result);
        }
    });
});

app.delete('/items/:id', function (req, res) {
    var id = req.params.id;
    db.items.remove({
        _id : id
    }, {}, function (err, result) {
        if (err) {
            res.send({
                'error' : 'An error has occurred - ' + err
            });
        } else {
            console.log('' + result + ' document(s) deleted');
            res.send(req.body);
        }
    });
});

app.listen(app.get('port'));
console.log('Server listening on port ' + app.get('port'));
