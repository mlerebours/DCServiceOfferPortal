import json
import os
from pathlib import Path

import lxml.etree as etree

import data.common as const

OUTPUT_FOLDER = 'out/'
OUTPUT_FILE = 'poster.json'

# Load Posters
data = json.load(open('src/poster.json'))

# Load Posters
translation = {const.LANG_EN: {}, const.LANG_FR: {}}

posters = []


def load_html_if_exist(shortslug, lang):
    my_file = Path('src/' + const.POSTERS + '/' + dir + '/desc_' + lang + '.html')
    if my_file.is_file():
        # file exists
        desc = my_file.open('r').read()
        translation[lang][shortslug]['desc'] = desc


def load_contents(lang):
    itercontent = etree.iterparse('src/' + const.POSTERS + '/' + dir + '/' + 'content_' + lang + '.xml')
    content = {}
    for action, elem in itercontent:
        if elem.text:
            content[elem.tag] = elem.text

    content.pop('content', None)
    shortslug = content['SHORTSLUG']
    content.pop('SHORTSLUG', None)
    translation[lang][shortslug] = content
    return shortslug


# write poster
for subdir, dirs, files in os.walk('src/' + const.POSTERS):
    dirs.sort()
    for dir in dirs:
        post = json.load(open('src/' + const.POSTERS + '/' + dir + '/' + 'poster.json'))

        shortslug = load_contents(const.LANG_EN)
        load_contents(const.LANG_FR)

        load_html_if_exist(shortslug, const.LANG_FR)
        load_html_if_exist(shortslug, const.LANG_EN)

        poster = {**{'SHORTSLUG': shortslug}, **post}
        posters.append(poster)


def sort_by_id(json):
    return int(json['id'])


posters.sort(key=sort_by_id)
data[const.POSTERS] = posters

with open(OUTPUT_FOLDER + OUTPUT_FILE, 'w') as f:
    json.dump(data, f, indent=2, sort_keys=False)


def write_translation(lang_fr):
    global f
    with open(OUTPUT_FOLDER + 'lang/' + lang_fr + '/' + OUTPUT_FILE, 'w') as f:
        json.dump(translation[lang_fr], f, indent=2, sort_keys=False)


write_translation(const.LANG_FR)
write_translation(const.LANG_EN)
