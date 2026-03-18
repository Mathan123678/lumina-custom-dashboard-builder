/* eslint-disable no-console */
// Minimal API smoke test for local dev.
// Run: node smoke-test.js

const baseUrl = process.env.BASE_URL || 'http://localhost:5000';

async function main() {
  const health = await fetch(`${baseUrl}/api/health`).then((r) => r.json());
  console.log('health', health);

  const email = `smoke.${Date.now()}@example.com`;
  const reg = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Smoke', email, password: 'Passw0rd!' }),
  }).then((r) => r.json());

  if (!reg.token) throw new Error(`register failed: ${JSON.stringify(reg)}`);

  const headers = { Authorization: `Bearer ${reg.token}` };
  const orders = await fetch(`${baseUrl}/api/orders`, { headers }).then((r) => r.json());
  const dash = await fetch(`${baseUrl}/api/dashboard`, { headers }).then((r) => r.json());
  const db = await fetch(`${baseUrl}/api/db-status`).then((r) => r.json());

  console.log('orders_count', Array.isArray(orders) ? orders.length : orders?.Count);
  console.log('dashboard_widgets', dash?.widgets?.length ?? 0);
  console.log('db_status', db);

  console.log('OK');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

