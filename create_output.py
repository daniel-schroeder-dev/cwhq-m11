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


