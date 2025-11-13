// Quick test script for your F1 chat API
async function testF1Chat(question) {
  try {
    console.log(`\n🏎️ Question: ${question}`);
    console.log('=' .repeat(50));
    
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: question }),
    });

    const data = await response.json();
    console.log('📝 Response:');
    console.log(data.message);
    console.log(`\n📊 Found ${data.foundResults} results`);
    
    if (data.sources && data.sources.length > 0) {
      console.log('\n🔗 Sources:');
      data.sources.forEach((source, i) => {
        console.log(`${i + 1}. ${source}`);
      });
    }
    
  } catch (error) {
    console.error('Error testing chat:', error);
  }
}

async function runTests() {
  console.log('🚀 Testing F1 Chat API...\n');
  
  const questions = [
    "Tell me about F1 drivers",
    "How does F1 scoring work?", 
    "What are the current F1 teams?",
    "F1 technical regulations",
    "Recent F1 news"
  ];
  
  for (const question of questions) {
    await testF1Chat(question);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between tests
  }
}

// Run tests
runTests();
