const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const app = require('../src/app');

process.env.JWT_SECRET = 'test-secret-with-more-than-thirty-two-characters';

function testToken() {
  return jwt.sign({}, process.env.JWT_SECRET, {
    subject: '1',
    issuer: 'prestamos-laboratorio',
    audience: 'prestamos-laboratorio-api'
  });
}

test('health endpoint responds with JSON without database access', async (t) => {
  const server = app.listen(0);
  t.after(() => server.close());
  await new Promise((resolve) => server.once('listening', resolve));

  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: 'ok' });
});

test('protected equipment endpoint rejects missing bearer token', async (t) => {
  const server = app.listen(0);
  t.after(() => server.close());
  await new Promise((resolve) => server.once('listening', resolve));

  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/equipment`);
  assert.equal(response.status, 401);
  assert.match((await response.json()).error, /token/i);
});

test('unknown API route returns JSON 404', async (t) => {
  const server = app.listen(0);
  t.after(() => server.close());
  await new Promise((resolve) => server.once('listening', resolve));

  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/missing`);
  assert.equal(response.status, 404);
  assert.ok((await response.json()).error);
});

test('loan validation rejects invalid input before database access', async (t) => {
  const server = app.listen(0);
  t.after(() => server.close());
  await new Promise((resolve) => server.once('listening', resolve));

  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/loans`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${testToken()}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify({ equipmentId: 0, borrowerName: '', loanDate: 'invalid', dueDate: 'invalid' })
  });
  assert.equal(response.status, 400);
  assert.ok((await response.json()).details.length >= 3);
});
