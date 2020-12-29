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
