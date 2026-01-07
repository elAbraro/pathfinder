async function testRegister() {
    const email = `test_${Date.now()}@example.com`;
    const payload = {
        email: email,
        firstName: "Test",
        lastName: "User",
        // backend ignores password, but let's send it anyway
        password: "password123"
    };

    try {
        console.log("Sending registration request to backend:", payload);
        const response = await fetch('http://localhost:5000/api/students/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
            console.log("Success:", response.status, data);
        } else {
            console.error("Error Response:", response.status, data);
        }
    } catch (error) {
        console.error("Error:", error.message);
    }
}

testRegister();
