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

const fs = require("fs");
const tool = require("hachiware_tool");

const Hachiware_TE = function(option){

	var templateEngines = null;
	var _sync = false;

	if(!option){
		option = {};
	}

	/**
	 * setContents
	 * @param {*} source 
	 */
	this.setContents = function(source, callback){

		const startTag = "<?hte";
		const startSyncTag = "<?sync";
		const endTag = "?>";

		var scripts = [];
		var contents = [];
		var syncScriptStr = "";

		var syncBuffers = source.split(startSyncTag);

		if(syncBuffers.length > 1){

			_sync = true;

			for(var n = 1 ; n < syncBuffers.length ; n++){
				var b_ = syncBuffers[n];

				var bsplit = b_.split(endTag);
				syncScriptStr += bsplit[0];

				source = source.replace(startSyncTag + bsplit[0] + endTag, "");
			}
		}

		var buffers = source.split(startTag);

		contents.push(buffers[0]);

		for(var n = 1 ; n < buffers.length ; n++){
			var b_ = buffers[n];

			var bsplit = b_.split(endTag);
			scripts.push(bsplit[0]);
			contents.push(bsplit[1]);
		}

		var convertHtml = "";
		for(var n = 0 ; n < contents.length ; n++){
			var c_ = contents[n];

			convertHtml += "\n_outToBase64(\"" + tool.base64Encode(c_) + "\");";

			if(scripts[n]){
				convertHtml += scripts[n];
			}
		}

		const TemplateEngines = require("./te.js");
		templateEngines = new TemplateEngines(Hachiware_TE, convertHtml, _sync, syncScriptStr, option, callback);

		return this;
	};

	/**
	 * setFile
	 * @param {*} filePath 
	 * @returns 
	 */
	this.setFile = function(filePath, callback){

		if(!option.path){
			option.path = "";
		}

		if(!option.currentPath){
			option.currentPath = option.path;
		}

		var path = option.path + "/" + filePath;

		path = path.split("//").join("/");

		try{

			if(!fs.existsSync(path)){
				throw Error("\"" + filePath + "\" is not found.");
			}
	
			if(!fs.statSync(path).isFile()){
				throw Error("\"" + filePath + "\" is not file.");
			}
	
		}catch(error){
						
			if(callback){

				if(option.response){
					option.response.statusCode = 404;
				}

				callback("", option.request, option.response, error);
			}

			return;
		}

		var text = fs.readFileSync(path).toString();
		return this.setContents(text, callback);
	};

	/**
	 * out
	 * @returns 
	 */
	this.out = function(){
		
		if(!templateEngines){
			return;
		}

		return templateEngines._getHtmlSource();
	};

	/**
	 * load
	 * @param {*} filePath 
	 * @param {*} callback 
	 * @returns 
	 */
	this.load = function(filePath, callback){

		if(callback){
			this.setFile(filePath, callback);
		}
		else{
			return this.setFile(filePath).out();
		}

	};

	if(option.load){
		if(option.callback){
			this.load(option.load, option.callback);
		}
		else{
			this.load(option.load);
		}
	}

};
module.exports = Hachiware_TE;