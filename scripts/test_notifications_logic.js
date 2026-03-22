require('dotenv').config({ path: '.env.local' })
const { sendUpdateNotification } = require('../lib/email')

async function testEmail() {
    console.log('--- TESTING EMAIL NOTIFICATION LOGIC ---')
    
    // This will use the real RESEND_API_KEY from .env.local if present
    // but we are mostly interested in seeing the logs I added.
    
    const result = await sendUpdateNotification({
        clientName: 'Test Client',
        clientEmail: 'test@example.com',
        projectName: 'Test Project',
        updateTitle: 'Título de Teste com Ação',
        updateMessage: 'Esta é uma mensagem de teste para verificar o encoding e o disparo.',
        updateStage: 3,
        authorName: 'Antigravity AI',
        isRevision: true
    })

    console.log('Result:', JSON.stringify(result, null, 2))
}

// Mocking db if it causes issues in the test environment
// But since lib/email uses it, it might fail unless we mock it properly.
// For now, let's just see if it runs.

testEmail().catch(console.error);
