/**
 * ===================================================================================================
 * hachiware_te
 * 
 * node.js Template Engine.
 * 
 * License : MIT License. 
 * Since   : 2022.01.15
 * Author  : Nakatsuji Masato 
 * Email   : nakatsuji@teastalk.jp
 * HP URL  : https://hachiware-js.com/
 * GitHub  : https://github.com/masatonakatsuji2021/hachiware_te
 * npm     : https://www.npmjs.com/package/hachiware_te
 * ===================================================================================================
 */

const tool = require("hachiware_tool");
const path0 = require("path");
const fs = require("fs");

module.exports = function(Hachiware_TE, _html, _sync, _syncScript, option, callback){

    if(option.data){
        var colums = Object.keys(option.data);
        for(var n = 0 ; n < colums.length ; n++){
            var field = colums[n];
            var value = option.data[field];
            this[field] = value;
        }
    }

    var _string = "";
    var _exited = false;
    var _resolved = false;
    var _exitData = null;

    if(option.request){
        var request = option.request;
    }
            
    if(option.response){
        var response = option.response;
    }

    /**
     * sanitize
     * @param {*} str 
     * @returns 
     */
    const sanitize = function(str){

        if(_exited){ return ; }

        if(
            str == undefined || 
            str == null || 
            str == NaN
        ){
            str = "";
        }

        var sList = {
            "<": "&lt;",
            ">": "&gt;",
        };

        var colums = Object.keys(sList);
        for(var n = 0 ; n < colums.length ; n++){
				var field = colums[n];
				var value = sList[field];
				str = str.toString().split(field).join(value);
        }
        return str;
    };

    /**
     * echo
     * @param {*} str 
     * @param {*} unSanitaized 
     * @returns 
     */
    const echo = function(str, unSanitaized){

        if(_exited){ return ; }

        if(
            str == undefined || 
            str == null || 
            str == NaN
        ){
            str = "";
        }

        if(!unSanitaized){
            str = sanitize(str);
        }
        _string += str;
    };

			/**
			 * debug
			 * @param {*} object 
			 */
    const debug = function(object){

				if(_exited){ return ; }

				var className = "";
				var end = "";
				if(tool.objExists(object,"constructor.name")){
					className = object.constructor.name + " (";
					end = "}";
				}

				const getCircularReplacer = () => {
					const seen = new WeakSet();
					return (key, value) => {
						if (typeof value === "object" && value !== null) {
							if (seen.has(value)) {
							return;
						}
						seen.add(value);
					  }
					  return value;
					};
				};
				
				echo(className + JSON.stringify(object,getCircularReplacer(),"    ") + end);
			};

			/**
			 * load
			 * @param {*} filePath 
			 * @param {*} data
			 */
			const load = function(filePath, data){
				
				if(_exited){ return ; }

				var buffer = loadBuffer(filePath, data);
				_string += buffer;
			};
			this.load = load;

			/**
			 * loadBuffer
			 * @param {*} filePath 
			 * @param {*} data 
			 * @returns 
			 */
			const loadBuffer = function(filePath, data){

				if(_exited){ return ; }

				if(filePath.substring(0,1) == "/"){
					var nextOption = {
						path: option.currentPath,
						currentPath: option.currentPath,
						$parent: option,
					};

					var filePath2 = filePath;
				}
				else{
					var nextOption = {
						path: option.path + "/" + path0.dirname(filePath),
						currentPath: option.currentPath,
						$parent: option,
					};

					var filePath2 = path0.basename(filePath);
				}
			
				nextOption.data = option.data;
				if(data){
					var colums =Object.keys(data);
					for(var n = 0 ; n < colums.length ; n++){
						var field = colums[n];
						var value = data[field];
						
						nextOption.data[field] = value;
					}
				}

				var path = nextOption.path + "/" + filePath2;

				try{

					if(!fs.existsSync(path)){
						throw Error("\"" + filePath + "\" is not found.");
					}
			
					if(!fs.statSync(path).isFile()){
						throw Error("\"" + filePath + "\" is not file.");
					}
	
				}catch(error){

					if(option.errorDebug){
						echo(error.toString());
					}

					return;
				}

				var hte = new Hachiware_TE(nextOption);
				return hte.setFile(filePath2).out();
			};

			/**
			 * loadJs
			 * @param {*} filePath 
			 * @returns 
			 */
			const loadJs = function(filePath){
				if(_exited){ return ; }
	
				if(filePath.substring(0,1) == "/"){
					var _path = option.currentPath;
					var filePath2 = filePath;
				}
				else{
					var _path = option.path + "/" + path0.dirname(filePath);
					var filePath2 = path0.basename(filePath);
				}
			
				var path = _path + "/" + filePath2;

				try{

					if(!fs.existsSync(path)){
						throw Error("\"" + filePath + "\" is not found.");
					}
			
					if(!fs.statSync(path).isFile()){
						throw Error("\"" + filePath + "\" is not file.");
					}
	
				}catch(error){

					if(option.errorDebug){
						echo(error.toString());
					}
					return;
				}

				return require(path);
			};

			/**
			 * _outToBase64
			 * @param {*} bstr
			 */
			const _outToBase64 = function(bstr){
				var str = tool.base64Decode(bstr);
				_string += str;
			};

			/**
			 * _getHtmlSource
			 * @returns 
			 */
			this._getHtmlSource = function(){
				return _string;
			};

			var cond = this;

			const throws = function(error){

				if(option.errorDebug){
					console.log(error);
				}

				var output = false;
				if(option.errorOutput){
					output = true;
				}

				if(option.$parent){
					if(option.$parent.errorDebug){
						console.log(error);
					}
					if(option.$parent.errorOutput){
						output = true;
					}
				}

				if(output){
					if(error.stack){
						_string += error.stack;
					}
					else{
						_string += error;
					}
				}

				if(option.response){

					if(option.response.statusCode == 200){
						option.response.statusCode = 500;
					}
					if(callback){
						callback.bind(cond)(_string, option.request, option.response, error);
					}
				}
			};

			/**
			 * resolve
			 * @returns 
			 */
			var resolve = function(data){

				_exitData = data;

				if(!_sync){
					_exited = true;
					return;
				}
			
				if(_resolved){ return;}

				_resolved = true;
	
				try{
					eval(_html);
					callback.bind(cond)(_string, option.request, option.response);
				}catch(error){
					throws(error);
				}
			};

			resolve = resolve.bind(this);

			try{
				if(_sync){
					eval(_syncScript);
				}
				else{
					eval(_html);
					if(callback){
						callback.bind(cond)(_string, option.request, option.response);
					}
				}
			}catch(error){
				throws(error);
			}
		};