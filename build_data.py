"""Extract the provided Telegram HTML into an offline browser question bank."""
import json
import re
from pathlib import Path

blocks = json.loads(Path('source-blocks.json').read_text(encoding='utf-8'))
metadata = json.loads(Path('wai_questions.json').read_text(encoding='utf-8'))
source = {}
for block in blocks:
    match = re.match(r'\*([A-Za-z]+\d+)\s*\n', block)
    if match:
        source[match[1].replace('l', 'I')] = block[match.end():]
questions = []
issues = []
for entry in metadata:
    body = source.get(entry['id'], '')
    matches = list(re.finditer(r'(?:^|\n)\s*(الف|ب|ج)\s*[).:،]', body))
    options = []
    for index, match in enumerate(matches):
        end = matches[index+1].start() if index+1 < len(matches) else len(body)
        text = body[match.end():end].replace('🟨', '').strip()
        options.append({'value': match[1], 'text': text})
    if len(options) != entry['options_count']:
        issues.append({'id': entry['id'], 'metadata_count': entry['options_count'], 'actual_count': len(options), 'body': body})
    questions.append({**entry, 'options_count': len(options), 'text': body[:matches[0].start()].strip() if matches else body, 'options': options})
Path('data.js').write_text('/* Extracted from the supplied question HTML and JSON. */\nwindow.WAI_QUESTIONS = '+json.dumps(questions, ensure_ascii=False, indent=2)+';\n', encoding='utf-8')
Path('data-audit.json').write_text(json.dumps(issues, ensure_ascii=False, indent=2), encoding='utf-8')
print('Extracted',len(questions),'questions;',len(issues),'count mismatches. Missing:',[q['id'] for q in questions if not q['text']])
