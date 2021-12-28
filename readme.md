# Hachiware_TE (TemplateEngine)

Template engine for nimble web pages.

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
const hte = require("hachiware_te");
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
<?te echo("<input type=\"text\" name=\"your_name\">", false); ?>
```

However, please note that the output with sanitization stopped is a security risk.

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

---

### - Loading another hte file

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

---
