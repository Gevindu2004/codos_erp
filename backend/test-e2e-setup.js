async function setup() {
  try {
    const res = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Test',
        lastName: 'Admin',
        email: 'testadmin@codos.com',
        password: 'password123',
        role: 'Admin'
      })
    });
    const data = await res.json();
    console.log(data);
  } catch (err) {
    console.error(err);
  }
}
setup();
