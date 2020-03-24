// support stuff

const fs = require('fs');

function readSchemaSync(file) {
    try {
        const jsonString = fs.readFileSync(file);
        return JSON.parse(jsonString);
    } catch(error) {
        return null
    }
}

function walk(dir, done) {
    var results = [];
    // console.log("walk: " + JSON.stringify(dir));
	fs.readdir(dir, function(err, list) {
	  if (err) return done(err);
	  var i = 0;
	  (function next() {
		var file = list[i++];
		if (!file) return done(null, results);
		file = dir + '/' + file;
		fs.stat(file, function(err, stat) {
		  if (stat && stat.isDirectory()) {
			walk(file, function(err, res) {
			  results = results.concat(res);
			  next();
			});
		  } else {
			results.push(file);
			next();
		  }
		});
	  })();
	});
};

//
// Support for collecting all errors from list of promises
// (inspired by https://stackoverflow.com/questions/30362733/handling-errors-in-promise-all) 
//  

function executeAllPromises(promises) {
    // Wrap all Promises in a Promise that will always "resolve"
    var resolvingPromises = promises.map(function(promise) {
      return new Promise(function(resolve) {
        var payload = new Array(2);
        promise.then(function(result) {
            payload[0] = result
          })
          .catch(function(error) {
            payload[1] = error
          })
          .then(function() {
            /* 
             * The wrapped Promise returns an array:
             * The first position in the array holds the result (if any)
             * The second position in the array holds the error (if any)
             */
            resolve(payload)
          })
      })
    })
  
    var errors = [];
    var results = [];
  
    // Execute all wrapped Promises
    return Promise.all(resolvingPromises)
      .then(function(items) {
        items.forEach(function(payload) {
          if (payload[1]) {
            errors.push(payload[1])
          } else {
            results.push(payload[0])
          }
        });
  
        return {
          errors: errors,
          results: results
        }
  
    })
}
  
module.exports = { readSchemaSync, walk, executeAllPromises };

