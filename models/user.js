var jsonfile = require('jsonfile')

module.exports.writeJSONData = function (username, password, callback) {
    var obj = readJSONData();
    var userid = obj.length + 1;
    var file = 'models/userdata/data.json';
    var nObj = {
        "userid": userid,
        "username": username,
        "password": password
    }
    obj.push(nObj);

    jsonfile.writeFile(file, obj, {
        spaces: 2,
        EOL: '\r\n'
    }, function (err) {
        console.error("write json file : " + err)
    })
}

module.exports.getUserData = function () {
    return readJSONData();
}

readJSONData = function () {
    var file = 'models/userdata/data.json';
    var obj = jsonfile.readFileSync(file);
    //console.log(obj);
    return obj;
}