#!/usr/bin/env node

/**
 * Test script for Firebase Functions v2
 * This script tests the HTTP functions locally
 */

const testFunctions = async () => {
  const baseUrl = 'http://localhost:5001/demo-chat/us-central1';

  console.log('🧪 Testing Firebase Functions v2...\n');

  try {
    // Test 1: Hello World
    console.log('1️⃣ Testing helloWorld...');
    const helloResponse = await fetch(`${baseUrl}/helloWorld`);
    const helloData = await helloResponse.json();
    console.log('✅ helloWorld:', helloData);
    console.log('');

    // Test 2: Sync User to Firestore
    console.log('2️⃣ Testing syncUserToFirestore...');
    const syncResponse = await fetch(`${baseUrl}/syncUserToFirestore`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uid: 'test-user-123',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: 'https://example.com/avatar.jpg',
        emailVerified: true
      })
    });
    const syncData = await syncResponse.json();
    console.log('✅ syncUserToFirestore:', syncData.success ? 'SUCCESS' : 'FAILED');
    console.log('');

    // Test 3: Update User Presence
    console.log('3️⃣ Testing updateUserPresence...');
    const presenceResponse = await fetch(`${baseUrl}/updateUserPresence`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uid: 'test-user-123',
        isOnline: true,
        status: 'online'
      })
    });
    const presenceData = await presenceResponse.json();
    console.log('✅ updateUserPresence:', presenceData.success ? 'SUCCESS' : 'FAILED');
    console.log('');

    console.log('🎉 All tests completed!');
    console.log('📍 Make sure Firebase emulators are running: npm run emulators');

  } catch (error) {
    console.error('❌ Error testing functions:', error.message);
    console.log('📍 Make sure Firebase emulators are running: npm run emulators');
  }
};

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testFunctions();
}

export { testFunctions };
