import os, time

dirname = os.path.dirname(__file__).replace("\\", "\\\\")

time.sleep(5)

print("""{
    "issues": [{
    "level": "info",
    "title": "another title from script",
    "description": "another description",
    "fileReference": \"""" + dirname + "\\\\..\\\\test-file.txt:7\"" + """
    },
    {
    "level": "info",
    "title": "title from script",
    "description": "description",
    "fileReference": \"""" + dirname + "\\\\..\\\\test-file.txt:9\"" + """
    },
    {
    "level": "warning",
    "title": "warning title",
    "description": "warning description",
    "fileReference": \"""" + dirname + "\\\\..\\\\test-file.txt:3\"" + """
    },
    {
    "level": "error",
    "title": "error title",
    "description": "error description",
    "fileReference": \"""" + dirname + "\\\\..\\\\test-file.txt:5\"" + """
    }
    ]
}""")