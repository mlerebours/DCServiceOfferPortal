import json
import os
from pathlib import Path

import lxml.etree as etree

import data.common as const

OUTPUT_FOLDER_DATA = 'out/data'
OUTPUT_FOLDER_LANG = 'out/lang/'
SRC_FOLDER_DATA = '../src/data'
SRC_FOLDER_LANG = '../src/locales/'
OUTPUT_FILE = 'poster.json'

# Load Posters
data = json.load(open('src/palettes.json'))

# Load Posters
translation = {const.LANG_EN: {}, const.LANG_FR: {}}

relations = []

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


def load_relations():
    return json.load(open('src/' + const.POSTERS + '/' + dir + '/relations.json'))


def load_relations_description(shortslug, lang):
    relation_poster = json.load(open('src/' + const.POSTERS + '/' + dir + '/relations_' + lang + '.json'))
    if shortslug in relation_poster:
        translation[lang][shortslug]['and'] = relation_poster[shortslug]


# write poster
for subdir, dirs, files in os.walk('src/' + const.POSTERS):
    dirs.sort()
    for dir in dirs:
        post = json.load(open('src/' + const.POSTERS + '/' + dir + '/' + 'poster.json'))

        shortslug = load_contents(const.LANG_EN)
        load_contents(const.LANG_FR)

        load_html_if_exist(shortslug, const.LANG_FR)
        load_html_if_exist(shortslug, const.LANG_EN)

        relation_poster = load_relations()
        relations = relations + relation_poster

        load_relations_description(shortslug, const.LANG_EN)
        load_relations_description(shortslug, const.LANG_FR)

        poster = {**{'SHORTSLUG': shortslug}, **post}
        posters.append(poster)


def sort_by_id(json):
    return int(json['id'])


posters.sort(key=sort_by_id)
data[const.POSTERS] = posters
data['relations'] = relations

with open(OUTPUT_FOLDER_DATA + OUTPUT_FILE, 'w') as f:
    json.dump(data, f, indent=2, sort_keys=False)
with open(SRC_FOLDER_DATA + OUTPUT_FILE, 'w') as f:
    json.dump(data, f, sort_keys=False)


def write_translation(lang_fr):
    global f
    with open(OUTPUT_FOLDER_LANG + lang_fr + '/' + OUTPUT_FILE, 'w') as f:
        json.dump(translation[lang_fr], f, indent=2, sort_keys=False)
    with open(SRC_FOLDER_LANG + lang_fr + '/' + OUTPUT_FILE, 'w') as f:
        json.dump(translation[lang_fr], f, sort_keys=False)


write_translation(const.LANG_FR)
write_translation(const.LANG_EN)
