import json
import os
from pathlib import Path

import lxml.etree as etree

import data.common as const

OUTPUT_FILE = '../src/data/poster.json'

# Load Posters
data = json.load(open('src/poster.json'))

# Load commons
commons = json.load(open('src/' + const.POSTERS + '/common.json'))

posters = []

# write poster
for subdir, dirs, files in os.walk('src/' + const.POSTERS):
    dirs.sort()
    for dir in dirs:
        post = json.load(open('src/' + const.POSTERS + '/' + dir + '/' + 'poster.json'))

        itercontent = etree.iterparse('src/' + const.POSTERS + '/' + dir + '/' + 'content.xml')
        content = {}
        for action, elem in itercontent:
            if elem.text:
                content[elem.tag] = elem.text

        my_file = Path('src/' + const.POSTERS + '/' + dir + '/' + const.DESC_FR + '.html')
        if my_file.is_file():
            # file exists
            content[const.DESC_FR] = my_file.open('r').read()

        poster = {**content, **commons, **post}
        posters.append(poster)


def sort_by_id(json):
    return int(json['id'])


posters.sort(key=sort_by_id)
data[const.POSTERS] = posters

with open(OUTPUT_FILE, 'w') as f:
    json.dump(data, f, indent=2, sort_keys=False)
