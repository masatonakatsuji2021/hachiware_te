const hte = require("hachiware_te");
const http = require("http");

var h = http.createServer(function(req,res){

    if(req.url == "/"){
        var url = "/index.hte";
    }
    else{
        var url = req.url + ".hte";
    }

    new hte({
        errorDebug: true,
        path: __dirname + "/htmls",
        load: url,
        request: req,
        response: res,
        callback: function(html, req, res,error){
            res.write(html);
            res.end();
        },
    });

});

h.listen(1122);

