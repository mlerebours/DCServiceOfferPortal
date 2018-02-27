import os
from pathlib import Path

from googletrans import Translator
import data.common as const

my_translator = Translator

# translate 'en' files to 'fr'
for subdir, dirs, files in os.walk('src/' + const.POSTERS):
    dirs.sort()
    for dir in dirs:

        my_file = Path('src/' + const.POSTERS + '/' + dir + '/' + const.DESC_EN + '.html')
        if my_file.is_file():
            # file exists
            desc_en = my_file.open('r').read()
            desc_fr = my_translator.translate(Translator(), text=desc_en, src='en', dest='fr')

            with open('src/' + const.POSTERS + '/' + dir + '/' + const.DESC_FR + '.html', 'w') as f:
                f.write(desc_fr.text)
