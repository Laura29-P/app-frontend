import test from 'node:test';
import assert from 'node:assert/strict';
import { checkoutReturnPath } from '../src/native.js';

test('valid payment deep link only supplies a session for server verification', () => {
  assert.equal(checkoutReturnPath('aventurakids://billing/return?subscription=success&session_id=cs_test_123&plan=premium'), '/?subscription=success&session_id=cs_test_123');
});
test('cancelled checkout returns without activating a plan', () => {
  assert.equal(checkoutReturnPath('aventurakids://billing/return?subscription=cancelled'), '/?subscription=cancelled');
});
test('untrusted links and malformed sessions cannot redirect the WebView', () => {
  for (const url of [
    'https://evil.example/?subscription=success&session_id=cs_test_123',
    'aventurakids://evil/return?subscription=success&session_id=cs_test_123',
    'aventurakids://billing/return?subscription=success',
    'aventurakids://billing/return?subscription=success&session_id=javascript:alert(1)',
    'aventurakids://billing/other?subscription=cancelled',
  ]) assert.equal(checkoutReturnPath(url), null);
});
