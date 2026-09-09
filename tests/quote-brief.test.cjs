const {test}=require('node:test'),assert=require('node:assert/strict');
const {validateBrief}=require('../server/quote-brief.cjs');
const parse=(key,brief)=>{const out={kind:'contact'};validateBrief({packageKey:key,briefJson:JSON.stringify(brief)},out);return out;};
test('quote details are bounded, schema-specific and canonical; legacy requests stay unchanged',()=>{
 const old={kind:'contact'};validateBrief({},old);assert.deepEqual(old,{kind:'contact'});
 assert.deepEqual(JSON.parse(parse('training',{date:'2028-02-29',topic:'  AI  ',participants:'20',location:''}).briefJson),{topic:'AI',participants:'20',date:'2028-02-29'});
 assert.equal(parse('web',{interaction:'camera',organization:'School',event:'Science fair'}).packageKey,'web');
 assert.equal(parse('innovation',{stage:'prototype'}).packageKey,'innovation');
 for(const [key,brief] of [['training',{participants:'0'}],['training',{participants:'10001'}],['training',{participants:'2.5'}],['training',{date:'2026-02-29'}],['training',{topic:'x'.repeat(181)}],['web',{interaction:'arbitrary'}],['innovation',{topic:'not allowed'}],['innovation',{stage:3}],['unknown',{}],['training',[]],[['training'],{}]])assert.throws(()=>parse(key,brief));
 assert.throws(()=>validateBrief({packageKey:'training',briefJson:'{}'},{kind:'store'}));
 assert.throws(()=>validateBrief({packageKey:'training',briefJson:'not json'},{kind:'contact'}));
});
