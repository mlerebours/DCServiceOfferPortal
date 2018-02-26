import json
import os

import lxml.etree as etree

import data.common as const

from pprint import pprint

data = json.load(open('poster.json'))


def extract_content(poster):
    global f
    content = etree.Element('content')
    extract_xml_field(content, poster, 'NOM')
    extract_xml_field(content, poster, 'SHORTSLUG')
    extract_xml_field(content, poster, 'SUBTITLE')
    extract_xml_field(content, poster, const.DESC_FR)
    extract_xml_field(content, poster, const.DESC_EN)

    with open(directory + '/' + 'content.xml', 'w') as f:
        my_data = etree.tostring(content, encoding="unicode", pretty_print=True)
        f.write(my_data)


def extract_xml_field(content, poster, field):
    name = etree.SubElement(content, field)
    name.text = poster[field]
    poster.pop(field, None)


def extract_field(common, poster, field):
    common[field] = poster[field]
    poster.pop(field, None)


def extract_common(poster, first):
    common = {}

    for field in const.COMMON_FIELDS:
        extract_field(common, poster, field)

    if first:
        dir = 'src/' + const.POSTERS + '/'
        with open(dir + '/common.json', 'w') as f:
            json.dump(common, f, indent=4)


for poster in data[const.POSTERS]:
    directory = 'src/' + const.POSTERS + '/' + poster['id']
    if not os.path.exists(directory):
        os.makedirs(directory)

    extract_common(poster, '1' == poster['id'])

    extract_content(poster)

    with open(directory + '/poster.json', 'w') as f:
        json.dump(poster, f, indent=4)

    pprint(poster)

pprint(data)

data.pop(const.POSTERS, None)

with open('src/poster.json', 'w') as f:
    json.dump(data, f, indent=4)
