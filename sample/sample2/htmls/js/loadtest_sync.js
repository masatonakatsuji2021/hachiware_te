module.exports = function(callback){

    setTimeout(function(){

        var value = "OK RESPONSE!";
        callback(value);

    },500);

};