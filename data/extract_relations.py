import json
import os

import lxml.etree as etree

import data.common as const

from pprint import pprint

data = json.load(open('out/poster.json'))

relations = data[const.RELATIONS]

poster_id_map = {}

for poster in data[const.POSTERS]:
    poster_id_map[poster['id']] = poster

for poster in data[const.POSTERS]:

    directory = 'src/' + const.POSTERS + '/' + poster['id']
    if not os.path.exists(directory):
        os.makedirs(directory)

    relation_array = []
    translation_dict = {}

    for r in relations:
        if r['poster_id_1'] == poster['id']:
            relation = {}
            linked_id = r['poster_id_2']
            relation['poster_id_1'] = poster['id']
            relation['poster_id_2'] = linked_id
            relation['weight'] = r['weight']
            relation['desc_key'] = poster['SHORTSLUG'] + '.and.' + poster_id_map[linked_id]['SHORTSLUG']
            relation_array.append(relation)

            if poster['SHORTSLUG'] not in translation_dict:
                translation_dict[poster['SHORTSLUG']] = {}

            translation_dict[poster['SHORTSLUG']][poster_id_map[linked_id]['SHORTSLUG']] = r['description']

    with open(directory + '/relations.json', 'w') as f:
        json.dump(relation_array, f, indent=4)

    with open(directory + '/relations_en.json', 'w') as f:
        json.dump(translation_dict, f, indent=4)

    with open(directory + '/relations_fr.json', 'w') as f:
        json.dump(translation_dict, f, indent=4)

    pprint(relation_array)
