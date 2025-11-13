// Performance test for F1 AI Chatbot
// Run with: node test-performance.js

async function measureResponseTime(question) {
  const startTime = Date.now();
  
  try {
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: question }),
    });

    const data = await response.json();
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    return {
      success: true,
      responseTime,
      responseLength: data.message.length,
      question
    };
  } catch (error) {
    const endTime = Date.now();
    return {
      success: false,
      responseTime: endTime - startTime,
      error: error.message,
      question
    };
  }
}

async function runPerformanceTests() {
  console.log('⚡ F1 AI Chatbot Performance Testing\n');
  console.log('='.repeat(80));

  const questions = [
    "Tell me about F1 teams",
    "How does scoring work?",
    "Who are the current drivers?",
    "What's the latest news?",
    "Explain the technical regulations"
  ];

  const results = [];

  console.log('\n🔄 Running performance tests...\n');

  for (let i = 0; i < questions.length; i++) {
    console.log(`Test ${i + 1}/${questions.length}: "${questions[i]}"`);
    const result = await measureResponseTime(questions[i]);
    results.push(result);
    
    if (result.success) {
      console.log(`   ✅ Response time: ${result.responseTime}ms`);
      console.log(`   📏 Response length: ${result.responseLength} chars`);
    } else {
      console.log(`   ❌ Failed: ${result.error}`);
    }

    // Wait between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Calculate statistics
  const successfulResults = results.filter(r => r.success);
  const responseTimes = successfulResults.map(r => r.responseTime);
  
  if (responseTimes.length > 0) {
    const avgTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const minTime = Math.min(...responseTimes);
    const maxTime = Math.max(...responseTimes);

    console.log('\n' + '='.repeat(80));
    console.log('\n📊 PERFORMANCE SUMMARY:');
    console.log('='.repeat(80));
    console.log(`Total Requests: ${questions.length}`);
    console.log(`Successful: ${successfulResults.length}`);
    console.log(`Failed: ${results.length - successfulResults.length}`);
    console.log(`\nResponse Times:`);
    console.log(`   Average: ${avgTime.toFixed(0)}ms`);
    console.log(`   Minimum: ${minTime}ms`);
    console.log(`   Maximum: ${maxTime}ms`);
    
    // Performance rating
    if (avgTime < 500) {
      console.log(`\n⚡ Excellent performance! (< 500ms average)`);
    } else if (avgTime < 1000) {
      console.log(`\n✅ Good performance (500-1000ms average)`);
    } else if (avgTime < 2000) {
      console.log(`\n⚠️  Acceptable performance (1-2s average)`);
    } else {
      console.log(`\n❌ Slow performance (> 2s average) - consider optimization`);
    }
  }

  console.log('\n' + '='.repeat(80));
}

runPerformanceTests().catch(console.error);
