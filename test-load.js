// Load test for F1 AI Chatbot - Test concurrent requests
// Run with: node test-load.js

async function sendRequest(question, id) {
  const startTime = Date.now();
  
  try {
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: question }),
    });

    const data = await response.json();
    const endTime = Date.now();

    return {
      id,
      success: true,
      responseTime: endTime - startTime,
      responseLength: data.message.length
    };
  } catch (error) {
    const endTime = Date.now();
    return {
      id,
      success: false,
      responseTime: endTime - startTime,
      error: error.message
    };
  }
}

async function runLoadTest(concurrentRequests = 5) {
  console.log('🔥 F1 AI Chatbot Load Testing\n');
  console.log('='.repeat(80));
  console.log(`Testing with ${concurrentRequests} concurrent requests\n`);

  const questions = [
    "Tell me about F1 teams",
    "How does scoring work?",
    "Who are the current drivers?",
    "What's the latest news?",
    "Explain DRS"
  ];

  const startTime = Date.now();
  
  // Send concurrent requests
  const promises = [];
  for (let i = 0; i < concurrentRequests; i++) {
    const question = questions[i % questions.length];
    console.log(`🚀 Launching request ${i + 1}: "${question}"`);
    promises.push(sendRequest(question, i + 1));
  }

  console.log('\n⏳ Waiting for all responses...\n');
  const results = await Promise.all(promises);
  const endTime = Date.now();
  const totalTime = endTime - startTime;

  // Analyze results
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log('='.repeat(80));
  console.log('\n📊 LOAD TEST RESULTS:');
  console.log('='.repeat(80));
  console.log(`Total requests: ${concurrentRequests}`);
  console.log(`✅ Successful: ${successful.length}`);
  console.log(`❌ Failed: ${failed.length}`);
  console.log(`⏱️  Total time: ${totalTime}ms`);
  console.log(`📈 Throughput: ${(concurrentRequests / (totalTime / 1000)).toFixed(2)} requests/second`);

  if (successful.length > 0) {
    const avgResponseTime = successful.reduce((sum, r) => sum + r.responseTime, 0) / successful.length;
    const minResponseTime = Math.min(...successful.map(r => r.responseTime));
    const maxResponseTime = Math.max(...successful.map(r => r.responseTime));

    console.log(`\nResponse Times:`);
    console.log(`   Average: ${avgResponseTime.toFixed(0)}ms`);
    console.log(`   Minimum: ${minResponseTime}ms`);
    console.log(`   Maximum: ${maxResponseTime}ms`);
  }

  if (failed.length > 0) {
    console.log(`\n❌ Failed Requests:`);
    failed.forEach(f => {
      console.log(`   Request ${f.id}: ${f.error}`);
    });
  }

  console.log('\n' + '='.repeat(80));
  
  // System health assessment
  if (failed.length === 0) {
    console.log('✅ System handled load perfectly!');
  } else if (failed.length < concurrentRequests * 0.1) {
    console.log('⚠️  System mostly stable with minor issues');
  } else {
    console.log('❌ System struggled with concurrent load');
  }
}

// Get concurrent requests from command line or use default
const concurrentRequests = parseInt(process.argv[2]) || 5;
runLoadTest(concurrentRequests).catch(console.error);
