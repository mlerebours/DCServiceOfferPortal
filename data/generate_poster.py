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
    my_file = Path('src/' + const.POSTERS + '/' + dir + '/' + lang + '/desc.html')
    if my_file.is_file():
        # file exists
        desc = my_file.open('r').read()
        translation[lang][shortslug]['desc'] = desc


def load_contents(lang):
    itercontent = etree.iterparse('src/' + const.POSTERS + '/' + dir + '/' + lang + '/content.xml')
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
    relation_poster = json.load(open('src/' + const.POSTERS + '/' + dir + '/' + lang + '/relations.json'))
    if shortslug in relation_poster:
        translation[lang][shortslug]['and'] = relation_poster[shortslug]


def walklevel(some_dir, level=1):
    some_dir = some_dir.rstrip(os.path.sep)
    assert os.path.isdir(some_dir)
    num_sep = some_dir.count(os.path.sep)
    for root, dirs, files in os.walk(some_dir):
        yield root, dirs, files
        num_sep_this = root.count(os.path.sep)
        if num_sep + level <= num_sep_this:
            del dirs[:]


# write poster
for subdir, dirs, files in walklevel('src/' + const.POSTERS, level=0):
    list1 = ["1","10","3","22","23","4","2","200"]
    dirs = [int(x) for x in dirs]
    dirs.sort()
    for dir_int in dirs:
        dir = str(dir_int)
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
