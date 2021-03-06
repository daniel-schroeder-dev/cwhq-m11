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


