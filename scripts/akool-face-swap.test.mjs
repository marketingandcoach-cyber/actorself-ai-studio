import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generate, mediaUrl } from './akool-face-swap.mjs';
const config = {key:'test-only',source:'https://example.com/face.jpg',target:'https://example.com/scene.mp4',consent:'true',pause:async()=>{}};
test('rejects missing consent and credentials before any request', async()=>{
  let calls=0; const fetcher=async()=>{calls++;};
  await assert.rejects(generate({...config,consent:'false',fetcher}), /consent/);
  await assert.rejects(generate({...config,key:'',fetcher}), /secret/);
  assert.equal(calls,0);
});
test('rejects insecure or credential-bearing media URLs',()=>{
  assert.throws(()=>mediaUrl('http://example.com/a'));
  assert.throws(()=>mediaUrl('https://name:secret@example.com/a'));
});
test('submits once then polls queued job and returns matching successful result', async()=>{
  const calls=[]; const replies=[{_id:'job1'},{result:[{_id:'job1',faceswap_status:2}]},{result:[{_id:'other',faceswap_status:3,url:'https://example.com/wrong.mp4'},{_id:'job1',faceswap_status:3,url:'https://example.com/result.mp4'}]}];
  const fetcher=async(url,options)=>{calls.push({url,options});return {ok:true,json:async()=>({code:1000,data:replies.shift()})};};
  assert.equal(await generate({...config,fetcher}),'https://example.com/result.mp4');
  assert.equal(calls.filter(c=>c.options.method==='POST').length,1);
  assert.equal(JSON.parse(calls[0].options.body).single_face_mode,true);
  assert.match(calls[1].url, /_ids=job1/);
});
test('quota rejection is reported without retries or private provider message',async()=>{
  let count=0; const fetcher=async()=>{count++;return {ok:true,json:async()=>({code:1006,msg:'private-url'})};};
  await assert.rejects(generate({...config,fetcher}), /^Error: AKOOL error code 1006$/);
  assert.equal(count,1);
});
test('failed job never returns an output',async()=>{
  let count=0;const fetcher=async()=>({ok:true,json:async()=>({code:1000,data:count++?{result:[{_id:'job1',faceswap_status:4}]}:{_id:'job1'}})});
  await assert.rejects(generate({...config,fetcher}), /could not process/);
});
