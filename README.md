# Hachiware_TE (TemplateEngine)

Template engine for nimble web pages.  
I think it's better than "EJS".

---

## # Sample source

Place the sample source in the test directory in the package.

---

## # How do you use this?

* As of December 2021, it has not been released as an npm package.

First, install the npm package with the following command.

```
npm i hachiware_te
```

All you have to do is add the package require code to index.js etc. and you're ready to go.

```javascript
const hachiware_te = require("hachiware_te");
```

---

## # Using a simple template engine

Let's prepare a sample that can easily check the template engine processing.

Place the ``index.js`` file in any directory and write the following code.

```javascript
const hachiware_te = require("hachiware_te");

var hte = new hachiware_te({
    path: __dirname + "/hte",
    load: "main.hte",
    errorDebug: true,
});

console.log(hte.out());
```

Create a ``hte/main.hte`` file from the directory containing the above indedx.js file and write the following code.

```php
Hallo World..!

<?te var nowDate = d.getFullYear() + "/" + ("0" + (d.getMonth() + 1)).slice(-2) + "/" + ("0" + d.getDate()).slice(-2); ?>

NowDate = <?te echo(nowDate); ?>

..... Exit;
```

As a result of executing index.js with node.js in this state, the result is output as shown below.

```php
Hallo World..!



NowDate = 2021/12/28

..... Exit;
```

The part surrounded by `` <? Te`` and ``?> `` Is the script execution part.

By implementing the code in the template engine file in this way, you can easily create a template.  
More detailed usage is described below.


---

## # Settings for various constructors

The outline of the argument when specifying the constructor of hte class is as follows.

|item|require|Overview|
|:--|:--|:--|
|path|〇|Current directory path|
|load|〇|Template file name to be read|
|errorDebug|-|Error debugging settings|
|request|-|Request object<br>Taken over from http module or https module|
|response|-|Response object<br>Taken over from http module or https module|
|callback|-|Execution callback after the conversion of the template file is completed<br>Use this callback if sync support is not included|

---

## # Output after template conversion

If you want to output the character string after converting the template file, use the ``out`` method.

After initializing the hachiware_te class as shown in the code below, it will be output by using the out method.

```javascript
const hachiware_te = require("hachiware_te");

var hte = new hachiware_te({
    path: __dirname + "/hte",
    load: "main.hte",
    errorDebug: true,
});

console.log(hte.out());
```

As a caveat, if the template contains code that requires synchronization such as wait processing, it will not be output.  
In that case, it is recommended to use a callback as shown below.

```javascript
const hachiware_te = require("hachiware_te");

var hte = new hachiware_te({
    path: __dirname + "/hte",
    load: "main.hte",
    errorDebug: true,
    callback: function(html){

        console.log(html);
    },
});
```

---

## # Functions on the template

### - Text output (echo)

Dynamic results can be output anywhere by using the ``echo`` method.  
Specify the character string to be output as an argument.


```php
Hallo World!

<?te echo("My Name Is cat!"); ?>

....

<?te echo("Who Are You?"); ?>

...

<?te echo("....Oh!"); ?>

......Exit!
```

In the case of the above template file, when it is executed on the template engine, it will be output with the following contents.

```
Hallo World!

My Name Is cat!

....

Who Are You?

...

....Oh!

......Exit!
```

If you specify a tag in the `` echo`` method, it is safely sanitized by default.

```php
<?te echo("<input type=\"text\" name=\"your_name\">"); ?>
```

In the above case, the output will be as follows.

```php
&lt;input type=\"text\" name=\"your_name\"&gt;
```

By specifying true for the second argument, sanitization can be temporarily stopped and the raw character string can be output.  


```php
<?te echo("<input type=\"text\" name=\"your_name\">", true); ?>
```

However, please note that the output with sanitization stopped is a security risk.

---

### - Get sanitized results (sanitize)

If you want to sanitize the string once, use the `` sanitize`` method.

Specify a character string as an argument, and the character string after sanitization processing is returned as the return value.

```php
<?te 
var text = sanitize("< input type=\"text\">"); 
echo(text);
?>

```

---

### - About the hotness of variables

Variables can be placed anywhere between `` <? Te ~?> ``.

```php
<?te
var test = "abcdefg";
?>

.... sampletexttext.....

<?te echo(test); ?>
```

Variables can be inherited even if the script part is separated as described above.

The above results are as follows.

```php


.... sampletexttext.....

abcdefg
```

However, as a caveat, this rule does not apply to logic that involves synchronization support depending on the standby state.

The correspondence of synchronous processing will be described later, but
For example, in the following cases, the result will output an empty string.

```php
<?te

setTimeout(function(){

    value = "abcdefg";

},2000);
?>


.... sampletexttext.....

<?te echo(value); ?>
```

[Here](#sync) explains about synchronization support.

---

### - Debug output (debug)

You can easily debug variables using the ``debug`` method.  
Specify the variable or character string to be debugged in the argument

```php
<?te debug(this); ?>
```

If the variable is an object or an array value, it will automatically output the parsed result.

---

### - Loading another hte file (load)

If you want to load another template engine file (hte file) and output it, use the ``load`` method.

Specify the path of the hte file as an argument

```php
<?te load("common/header.hte"); ?>

contents area....

<?te load("common/footer.hte"); ?>
```

Set the following code for the ``common/header.hte`` file and the ``common/footer.hte`` respectively on the directory where the ``main.hte`` file is located.

First, `` common / header.hte``.

```php
--------------------------
Header Area...
--------------------------
```

``common/footer.hte``.

```php
--------------------------
Footer Area...
--------------------------
```

The output result of `` main.hte`` is as follows.

```
--------------------------
Header Area...
--------------------------

contents area....

--------------------------
Footer Area...
--------------------------
```

If you want to inherit some data, specify the variable in the second argument.

```php
<?te
var data = {
    name:"test",
    title:"load test",
};
load("testload.hte",data); ?>
```

``testload.hte``.

```php
--------------------------
name = <?te echo(this.name); ?>
title = <?te echo(this.title); ?>
--------------------------
```
---

### - Load another hte file (get result without output) (loadBuffer)

The ``load`` method reads the hte file separately and outputs its contents,
If you want to get the load result temporarily instead of output, use the ``loadBuffer`` method instead.

The argument specification is almost the same as the ``load`` method.

The result of reading the hte file is returned as the return value.

```php
<?te
var text = loadBuffer("get_text.hte");
echo("[" + text + "]");
?>
```

---

### - Read external JS file (loadJs)

Use the ``loadJs`` method to load an external js file other than modules (node_modules).
Normally, it can be read by using ``require``, but the difference is that the method of specifying the path is different.

For example, in the following cases, even if the ``load_test.js`` file is prepared, an error "If the file does not exist" is output.

```php
<?te var data = require("load_test.js"); ?>
```

Replace it with loadJS as shown below.

```php
<?te var data = loadJs("load_test.js"); ?>
```

The return value data is the same as the return value of require.

---

<a id="sync"></a>

### - Support for synchronous processing

It corresponds to the case where processing with a temporary wait state such as an external request or setTimeout occurs.

In that case, use the ``<?sync~?> `` Tag instead of the ``<?te~?> ``.

If the ``<?sync`` tag is present in the hte file, the code in the ``<?sync`` tab will be executed first.  
By executing the ``resolve`` method when all the wait processes are completed,  
The rest of the text and HTML tags are displayed and the processing inside the ``<?te`` method is performed.

If the execution form is ``<?sync``, it will be roughly divided into two stages: back-end processing, and if it is ``<?te``, it will be front-end processing.

```php
<?sync

    /**
     * 
     * Synchronous processing compatible part
     * 
     * This is the priority execution
     * 
     */

    resolve();      // <= End synchronization process
?>

------------------------------------------------------------------

Display this content after the synchronization process resolves

------------------------------------------------------------------
```

※　For backends that would normally perform standby processing, execute them in advance, and then after the backend processing is completed.  
Template engines are commonly used for screen display.  
This specification assumes the case of endpoint expansion for each file like php.

As an installation example, the code is written as follows.  
To reproduce the standby state, setTimeout acquires the current time after a blank for 2 seconds and outputs it.

```php
<?sync

var text = null;
setTimeout(function(){

    var d = new Date();
    text = d.getFullYear() + "/" + (d.getMonth() + 1) + "/" + d.getDate();

    resolve();

},2000);
?>
----
now Date = <?te echo(text); ?>
```

This makes it possible to output with the following contents after a waiting time of 2 seconds.

```

----
now Date = 2021/12/28
```

---

### - Web requests and responses

Via the http or https module
You can use the request object or response object as it is.

First, write ``index.js`` as follows.

```javascript
const hte = require("hachiware_te");
const http = require("http");

var h = http.createServer(function(req,res){

    new hte({
        errorDebug: true,
        path: __dirname,
        load: "index.hte",
        request: req,                   // <= Set the request object here
        response: res,                  // <= Set the response object here
        callback: function(html, req, res,error){

            res.write(html);
            res.end();
        },
    });

});

h.listen(1122);

```

Set the ``index.hte`` file as shown below.

```html
<p>METHOD = <?te echo(request.method); ?></p>
<p>URL = <?te echo(request.url); ?></p>
```

After that, with index.js executed and the server started,
Access ``http://localhost: 1122`` in your browser.

This will output the following results.

```
METHOD = GET

URL = /page_5
```

Response objects can be used as well.  
You can change the status code on ``index.hte`` as shown below.

```html
<?te
response:statusCode = 404;
?>
<p>404 Page Not Found.</p>
```
If an error occurs, it will be carried over to the callback argument.

---

AutAuthor : Nakatsuji Masato.
