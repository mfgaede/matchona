---
# create lunr store for search page - transcripts only
---
{%- assign fields = site.data.config-search -%}
var store = [ 
{%- for item in site.transcripts -%}
{%- assign transcript_data = site.data.transcripts[item.object-id] -%}
{%- assign content_text = transcript_data | map: 'words' | join: ' ' -%}
{%- assign tags_text = transcript_data | map: 'tags' | join: ';' -%}
{ "id": {{ item.object-id | jsonify }}, 
  "title": {{ item.title | jsonify }},
  "date-interviewed": {{ item.date-interviewed | jsonify }},
  "interviewer": {{ item.interviewer | jsonify }},
  "location": {{ item.location | jsonify }},
  "content": {{ content_text | normalize_whitespace | jsonify }},
  "tags": {{ tags_text | normalize_whitespace | jsonify }}
}{%- unless forloop.last -%},{%- endunless -%}
{%- endfor -%}
];
