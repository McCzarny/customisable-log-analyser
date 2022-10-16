import os

dirname = os.path.dirname(__file__).replace("\\", "\\\\")

print("""{
    "issues": [{
    "level": "info",
    "title": "title from script",
    "description": "description",
    "fileReference": \"""" + dirname + "\\\\..\\\\test-file.txt:1\"}]}")