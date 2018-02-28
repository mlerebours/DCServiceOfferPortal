import json
import os

import lxml.etree as etree

import data.common as const

from pprint import pprint

data = json.load(open('poster.json'))


relations = data[const.RELATIONS]

poster_id_map = {}

for poster in data[const.POSTERS]:
    poster_id_map[poster['id']] = poster

for poster in data[const.POSTERS]:

    directory = 'src/' + const.POSTERS + '/' + poster['id']
    if not os.path.exists(directory):
        os.makedirs(directory)

    relation_array = []

    for r in relations :
        if r['poster_id_1'] == poster['id']:
            relation = {}
            linked_id = r['poster_id_2']
            relation['poster_id'] = linked_id
            relation['SHORTSLUG'] = poster_id_map[poster['id']]['SHORTSLUG']
            relation['weight'] = r['weight']
            relation['description'] = r['description']
            relation_array.append(relation)

    with open(directory + '/relations.json', 'w') as f:
        json.dump(relation_array, f, indent=4)

    pprint(relation_array)
