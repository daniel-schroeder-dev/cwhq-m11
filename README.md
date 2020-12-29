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
