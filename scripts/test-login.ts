// Lightweight diagnostic script (Node) to test login via fetch (when run with ts-node or transpiled)
async function main() {
  const res = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'example@example.com', password: 'wrong' })
  });
  const text = await res.text();
  console.log('Status:', res.status);
  console.log('Raw body:', text);
}
main().catch(e => { console.error(e); process.exit(1); });
