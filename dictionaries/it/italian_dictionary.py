#! /usr/bin/env python3

import sys
import html
import requests
import re

def get_html():
  with open('page-examples/istituto.html') as f:
    return f.read()

def get_word_definition(word):
  first_letter = word[0].upper()

  try:
    url = f'https://dizionari.corriere.it/dizionario_italiano/{first_letter}/{word}.shtml'
    r = requests.get(url)
    html = r.text
    # html = get_html()

    html_no_newlines = re.sub(r'\n','',html)
    html_no_trailling_spaces = re.sub(r'\s\s+',' ',html_no_newlines)
    html_new_line_after_ul = re.sub(r'</dd>','</dd>\n',html_no_trailling_spaces)

    m = re.findall(r'<dd><p.*</dd>', html_new_line_after_ul)

    definition_without_tags = re.sub(r'<.*?>','',m[0])
    for candidate in m:
      definition_without_tags = re.sub(r'<.*?>','',candidate)
      if len(definition_without_tags) > 25:
        break

    return definition_without_tags
  except:
    return ''

  return ''


def main():
  definition = get_word_definition(sys.argv[1])
  print(html.unescape(definition))



if __name__=='__main__':
  main()