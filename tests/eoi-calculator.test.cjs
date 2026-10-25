const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const html = fs.readFileSync(path.join(__dirname, '../docs/01-australia/eoi-calculator.html'), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const elements = new Map();
const context = {document: {
  querySelector: () => null,
  querySelectorAll: () => [],
  getElementById: id => {
    if (!elements.has(id)) elements.set(id, {checked:false,textContent:'',className:''});
    return elements.get(id);
  }
}};
vm.createContext(context);
vm.runInContext(script, context);
const score = context.calculateEOI;
const basic = {age:30,eng:0,overseas_work:0,au_work:0,edu:15,partner:10};
assert.equal(elements.get('score-189').textContent, '—');
assert.equal(score({}, {}).status, 'incomplete');
assert.equal(score({...basic,eng:null}, {}).status, 'incomplete');
assert.equal(score({...basic,age:-1}, {}).status, 'age');
assert.equal(score({...basic,eng:-1}, {}).status, 'english');
assert.equal(score(basic, {regional:true}).status, 'regional');
assert.equal(score(basic, {}).base, 55);
assert.equal(score(basic, {}).s190, 60);
assert.equal(score(basic, {}).s491, 70);
assert.equal(score({...basic,overseas_work:15,au_work:20}, {}).work, 20);
assert.equal(score({...basic,overseas_work:15,au_work:20}, {}).base, 75);
assert.equal(score({...basic,eng:10}, {}).base, 65);
assert.equal(score({...basic,eng:20,overseas_work:15,au_work:20,edu:20},
  {naati:true,asr:true,regional:true,stem:true,py:true}).base, 130);
assert.equal(score({...basic,eng:21}, {}).status, 'incomplete');
assert.doesNotMatch(script, /benchData|applyDeemingHelper|达到 189 获邀线/);
assert.doesNotMatch(html, /\bchecked\s*(?:>|\/?>)/);
console.log('EOI checks passed: empty inputs, eligibility, work cap, bonus dependency, 65-point boundary and separate nomination scenarios.');
