import assert from 'node:assert/strict';
import { resultVideoUrl, remoteErrorMessage } from '../src/utils/remoteFaceSwap.ts';
assert.equal(resultVideoUrl([null,{video:{url:'https://poxvnn-faceswap-zero.hf.space/gradio_api/file=/tmp/result.mp4'}}]),'https://poxvnn-faceswap-zero.hf.space/gradio_api/file=/tmp/result.mp4');
assert.equal(resultVideoUrl([null,{video:'/gradio_api/file=/tmp/result.mp4'}]),'https://poxvnn-faceswap-zero.hf.space/gradio_api/file=/tmp/result.mp4');
for(const data of [null,[],[null,{video:{url:'https://example.com/video.mp4'}}],[null,{video:'javascript:alert(1)'}],[null,{video:'https://poxvnn-faceswap-zero.hf.space/invalid'}]]) assert.throws(()=>resultVideoUrl(data));
assert.match(remoteErrorMessage(new Error('GPU quota exceeded')),/cuota gratuita/);
assert.ok(!remoteErrorMessage(new Error('private-photo-url')).includes('private-photo-url'));
console.log('Remote face swap: valid outputs, invalid URLs, missing video and quota errors passed.');
