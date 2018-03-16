const crypto = require('crypto');

var returnJsonResponse = (response, status, content) => {
    response.status(status);
    response.json(content);
};

module.exports.hashToken = function(request, response) {
    console.log(request.body)
    if(request.body.token) {
        var obj = request.body.token;
        var hash = crypto.createHash('sha256').update(obj, 'utf8').digest().toString('hex');
        console.log(hash);
        returnJsonResponse(response, 200, hash);
    } else {
        returnJsonResponse(response, 400, "Nothing to hash");
    }
}
    