import os
import json
import sys
import datetime

from shutil import copytree
from jinja2 import Template


def render_template(jsonPuzzlePath, context, templateFilepath, outputFilepath):
    with open(jsonPuzzlePath) as jsonFile, open(templateFilepath) as tfile, open(outputFilepath, 'w') as fout:
        t = Template(tfile.read())
        x = t.render(jpuzzle=json.load(jsonFile),
                     dayOfWeekIndex=context["dayOfWeekIndex"],
                     dayOfWeekName=context["dayOfWeekName"],
                     expirationDate=context["expirationDate"],
                     puzzleId=context["puzzleId"])
        fout.write(x)


def render_page(templateFolder, jsonPuzzlePath, outputFolder, dayOfWeekName="sunday"):
    dirs_to_copy = ['assets',
                    'css',
                    'js']

    for n in dirs_to_copy:
        copytree("{}/{}".format(templateFolder, n),
                 "{}/{}".format(outputFolder, n),dirs_exist_ok=True)

    dayOfWeekIndex = 0
    if dayOfWeekName == "monday":
        dayOfWeekIndex = 0
    elif dayOfWeekName == "tuesday":
        dayOfWeekIndex = 1
    elif dayOfWeekName == "wednesday":
        dayOfWeekIndex = 2
    elif dayOfWeekName == "thursday":
        dayOfWeekIndex = 3
    elif dayOfWeekName == "friday":
        dayOfWeekIndex = 4
    elif dayOfWeekName == "saturday":
        dayOfWeekIndex = 5
    elif dayOfWeekName == "sunday":
        dayOfWeekIndex = 6

    d = datetime.datetime.today()

    td = datetime.timedelta(days=360)
    expirationDate = (d+td).isoformat()

    context = {
        "dayOfWeekIndex": dayOfWeekIndex,
        "dayOfWeekName": dayOfWeekName,
        "expirationDate": expirationDate,
        "puzzleId": d.isoformat()
    }

    files_to_render = ['index.html', 'js/main.js']
    for n in files_to_render:
        render_template(jsonPuzzlePath,
                        context,
                        "{}/{}".format(templateFolder, n),
                        "{}/{}".format(outputFolder, n)
                        )


if __name__ == "__main__":
    render_page(*sys.argv[1:])
