const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:5000/api';

async function run() {
    try {
        const token = 'dev_token'; // Ensure dev token is enabled in auth.js temporarily if needed, or use existing flow.
        // Wait, I reverted dev token. I should re-enable it or assumes it works.
        // Actually, for this specific test, let's just re-enable it quickly or assume I have it if I didn't revert fully?
        // I did revert it. Let's re-enable it for this test.
        console.log('Using DEV_TOKEN');

        // 3. Upload File
        console.log('--- Step 3: Upload File ---');
        const form = new FormData();
        const blob = new Blob(['Test DB content'], { type: 'application/pdf' });
        form.append('file', blob, 'test_db_upload.pdf');

        let uploadRes = await fetch(`${API_URL}/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: form
        });

        let fileData;
        if (uploadRes.ok) {
            fileData = await uploadRes.json();
            console.log('Upload OK:', fileData);

            // 4. Verification: Download File
            console.log('--- Step 4: Verify Download ---');
            // fileData.filePath should be /api/upload/files/<id>
            let downloadUrl = `http://localhost:5000${fileData.filePath}`;
            console.log('Downloading from:', downloadUrl);
            let downloadRes = await fetch(downloadUrl);
            if (downloadRes.ok) {
                let text = await downloadRes.text();
                console.log('Download Content:', text);
                if (text === 'Test DB content') {
                    console.log('SUCCESS: content matches.');
                } else {
                    console.error('FAILURE: content mismatch.');
                }
            } else {
                console.error('Download Failed:', downloadRes.status);
            }

        } else {
            console.error('Upload Failed:', uploadRes.status, await uploadRes.text());
            return;
        }

    } catch (e) {
        console.error('Script Error:', e);
    }
}

run();
