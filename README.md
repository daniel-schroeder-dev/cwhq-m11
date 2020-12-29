# M11 Revamp Repo

## Installation

### Setting up Skulpt

First, fork [Skulpt](https://github.com/skulpt/skulpt). Clone that to your local machine, and then install Node 10.4:

```bash
nvm install 10.4
nvm use 10.4
```
Open the Skulpt directory and run:

```bash
cd skulpt
npm install
npm run dist
```

To create your own modules, you'll need to create a directory with the top-level module name like so:

```bash
➜  skulpt pwd
/home/daniel/Public/cwhq/src/skulpt
➜  skulpt cd src
➜  src cd lib
➜  lib mkdir wizardlib
```
Then, create a `__init__.py` file in that directory. It doesn't need anything in it:

```bash
➜  wizardlib pwd
/home/daniel/Public/cwhq/src/skulpt/src/lib/wizardlib
➜  wizardlib touch __init__.py
```
Now, you're ready to create your sub-modules. For example, here's how we could start rebuilding wizardlib by making a sub-module called `builtins.js`:

```bash
➜  wizardlib pwd
/home/daniel/Public/cwhq/src/skulpt/src/lib/wizardlib
➜  wizardlib touch builtins.js
```

In that file, add the following starter code:

```javascript
var id = 0

function getNextId() {
  return id++;
}

var $builtinmodule = function(name) {
    
    var mod = {};

    var addText = function(text, size) {
        if (size === undefined) {
            size = 18;
        }
        var element = document.createElement("p");
        element.textContent = text;
        element.style.fontSize = size + 'px';
        element.id = getNextId();
        document.getElementById('output').appendChild(element);
        return element.id;
    };

    mod.add_text = new Sk.builtin.func(function(text, size="") {
        return addText(text.v, size.v);
    });

    return mod;
}
```
Great, now, we have everything we need on the Skulpt side setup.

### Setting Up M11

To get your M11 repo ready, create a another directory on the same level as the Skulpt project. I've got all my stuff in an `src` folder

```bash
➜  src pwd
/home/daniel/Public/cwhq/src
➜  src ls | grep -w "^skulpt$"
skulpt
➜  src mkdir m11
➜  src cd m11
```
OK, now we have m11 and skulpt directories side-by-side. Create an empty file to hold your server: 

```bash
➜  m11 touch server.py
```

Here is the code for `server.py`:

```python
import http.server
import socketserver

class MyHttpRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/':
            self.path = 'index.html'
        return http.server.SimpleHTTPRequestHandler.do_GET(self)



PORT = 8000
my_server = socketserver.TCPServer(("", PORT), MyHttpRequestHandler)

# Start the server
print("Server up at port: ", PORT)
my_server.serve_forever()
```
Next, create a file holding the Skulpt config for the JS frontend:

```bash
➜  m11 touch script.js
```

Here's the code for `script.js`:

```javascript
// output functions are configurable.  This one just adds some text
// to the output element
function outf(text) { 
    var outputElement = document.getElementById("output"); 
    outputElement.innerHTML = text; 
} 
function builtinRead(x) {
    if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined)
            throw "File not found: '" + x + "'";
    return Sk.builtinFiles["files"][x];
}

function regexCheck (el) {
    var found = el.match(/.*(var).*(prog).*(=)/g);
    if(found){
        return true;
    } else {
        return false;
    }

}

// Here's everything you need to run a python program in skulpt
// get a reference to your element for output
// configure the output function
// call Sk.importMainWithBody()
// I've set this to use python3 with that __future__ option
function runit() {
	document.getElementById("start-button").remove();
	var outputElement = document.getElementById("output"); 
	outputElement.innerHTML = ''; 
	Sk.pre = "output";
	Sk.configure({output:outf, read:builtinRead, __future__: Sk.python3}); 
	var myPromise = Sk.misceval.asyncToPromise(function() {
	   return Sk.importMainWithBody("<stdin>", false, prog, true);
	});
	myPromise.then(function(mod) {
	   console.log('success');
	}, function(err) {
			var entireFile = document.querySelector('html').innerHTML;
			var fileArray = entireFile.split('\n');
			var errorLine = err.traceback[0].lineno;
			var errorMessage = document.getElementById('errorMessage');

			// YES, that space is supposed to be there
			errorMessage.textContent = ` ${err.args.v[0].v} on line no ${errorLine}`;
			errorMessage.style.cssText = `
			   background-color: #c0392b;
			   color: white;
			   padding: 24px;
			   position: absolute;
			   border-radius: 10px;
			   font-size: 18px;
			   font-family: monospace;
			   display: block;
			   max-width: 500px;
			   text-align: center;
			   right: calc(50vw - 250px);
			   z-index: 10;
			   line-height: 1.5;
			   top: 10px;
		`;
	});
} 

```
We'll do all of our work in an `index.py` file, so create one:

```bash
➜  m11 touch index.py
```

Next, we need the file that will build the HTML we will view in the browser. Create a file called `create_output.py`:

```bash
➜  m11 touch create_output.py
```

Then, add this code:

```python
import sys
sys.stdout = open("index.html", "w")

with open("script.js", "r") as s_f:
    head_script = s_f.read()

with open("index.py", "r") as p_f:
    prog = p_f.read()


print(f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
  <title></title>
  <script src="skulpt.min.js" type="text/javascript"></script> 
  <script src="skulpt-stdlib.js" type="text/javascript"></script> 
  <script>
var prog = `{prog}`;
{head_script}
  </script>
</head>
<body>
<div id="errorMessage"></div>
<div id="output"></div>
<button id="start-button" onclick="runit();">Start</button>
</body>
</html>
''')
```
OK, at this point, we're close! Now, we need to wire up the build script that will build our Skulpt modules and include the `skulpt.min.js` files and `skulpt-stdlib.js` files in our M11 directory.

Create a file called `build.py` and give it execute permissions:

```bash
➜  m11 touch build.py
➜  m11 chmod +x build.py
```

Drop this code in `build.py` and replace `skulpt_dir_path` with the result of running `pwd` in your `skulpt` directory:

```python
#!/usr/bin/python

import subprocess
import os

skulpt_dir_path = "/home/daniel/Public/cwhq/src/skulpt/"
skulpt_dist_path = os.path.join(skulpt_dir_path, "dist")

skulpt_lib_files = [
    "skulpt.min.js",
    "skulpt-stdlib.js",
    "skulpt.min.js.map",
]

subprocess.call(["npm","run", "build"], cwd=skulpt_dir_path)

for skulpt_lib_file in skulpt_lib_files:
    subprocess.call(["cp", os.path.join(skulpt_dist_path, skulpt_lib_file), "./"])

subprocess.call(["python", "create_output.py"])
subprocess.call(["python", "-m", "webbrowser", "-t", "http://127.0.0.1:8000/"])

```
Now, fire up the python server:

```bash
