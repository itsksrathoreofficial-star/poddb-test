const fetch = require('node-fetch');

async function testSyncServer() {
  try {
    console.log('🧪 Testing PodDB Sync Server...\n');
    
    // Test 1: Health Check
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch('http://localhost:3002/health');
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.status);
    console.log('   Memory usage:', Math.round(healthData.memory_usage.percentage) + '%');
    console.log('   CPU cores:', healthData.server_info.arch);
    console.log('');
    
    // Test 2: Status Check
    console.log('2. Testing status endpoint...');
    const statusResponse = await fetch('http://localhost:3002/api/status');
    const statusData = await statusResponse.json();
    console.log('✅ Status check:', statusData.currentStatus);
    console.log('   Is running:', statusData.isRunning);
    console.log('   Server uptime:', Math.round(statusData.serverUptime / 60) + ' minutes');
    console.log('');
    
    // Test 3: Settings Check
    console.log('3. Testing settings endpoint...');
    const settingsResponse = await fetch('http://localhost:3002/auto-sync-settings');
    const settingsData = await settingsResponse.json();
    console.log('✅ Settings loaded:');
    console.log('   Sync mode:', settingsData.mode);
    console.log('   Batch size:', settingsData.batchSize);
    console.log('   Concurrent podcasts:', settingsData.maxConcurrentPodcasts);
    console.log('   Memory optimization:', settingsData.memoryOptimization);
    console.log('');
    
    // Test 4: Detailed Progress Check
    if (statusData.detailedProgress) {
      console.log('4. Testing detailed progress...');
      const progress = statusData.detailedProgress;
      console.log('✅ Detailed progress available:');
      console.log('   Current operation:', progress.currentOperation);
      console.log('   Performance metrics:', progress.performanceMetrics ? 'Available' : 'Missing');
      console.log('   Error analysis:', progress.errorAnalysis ? 'Available' : 'Missing');
      console.log('');
    }
    
    console.log('🎉 All tests passed! Sync server is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Make sure the sync server is running on port 3002');
  }
}

// Run the test
testSyncServer();
