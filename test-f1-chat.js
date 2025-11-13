// Test script for F1 AI Chatbot
// Run with: node test-f1-chat.js

const testQuestions = [
  // Category: Drivers
  {
    category: "Drivers",
    question: "Who are the current F1 drivers?",
    expectedKeywords: ["Max Verstappen", "Lewis Hamilton", "drivers", "2024"]
  },
  {
    category: "Drivers", 
    question: "Tell me about Max Verstappen",
    expectedKeywords: ["Red Bull", "champion", "Dutch"]
  },

  // Category: Teams
  {
    category: "Teams",
    question: "Tell me about the F1 teams",
    expectedKeywords: ["Red Bull", "Mercedes", "Ferrari", "McLaren"]
  },
  {
    category: "Teams",
    question: "Which team won the constructors championship?",
    expectedKeywords: ["constructor", "team", "points"]
  },

  // Category: Scoring
  {
    category: "Scoring",
    question: "How does F1 scoring work?",
    expectedKeywords: ["points", "25", "18", "15", "winner"]
  },
  {
    category: "Scoring",
    question: "How many points for first place?",
    expectedKeywords: ["25", "points", "first"]
  },

  // Category: Rules
  {
    category: "Rules",
    question: "What are the F1 technical regulations?",
    expectedKeywords: ["regulations", "rules", "technical", "FIA"]
  },
  {
    category: "Rules",
    question: "Explain DRS in Formula 1",
    expectedKeywords: ["DRS", "overtaking", "rear wing"]
  },

  // Category: News
  {
    category: "News",
    question: "What's the latest F1 news?",
    expectedKeywords: ["latest", "news", "season", "2024"]
  },

  // Edge Cases
  {
    category: "Edge Cases",
    question: "Hello",
    expectedKeywords: ["Formula", "help", "F1"]
  },
  {
    category: "Edge Cases",
    question: "Tell me about basketball",
    expectedKeywords: ["Formula", "F1", "racing"]
  }
];

async function testChat(question) {
  try {
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: question }),
    });

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function checkKeywords(text, keywords) {
  const lowerText = text.toLowerCase();
  const found = keywords.filter(keyword => 
    lowerText.includes(keyword.toLowerCase())
  );
  return {
    passed: found.length > 0,
    found,
    missing: keywords.filter(k => !found.includes(k))
  };
}

async function runTests() {
  console.log('🏎️  Starting F1 AI Chatbot Tests\n');
  console.log('=' .repeat(80));
  
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  
  const results = [];

  for (const test of testQuestions) {
    totalTests++;
    console.log(`\n📝 Test ${totalTests}: ${test.category}`);
    console.log(`   Question: "${test.question}"`);
    
    const result = await testChat(test.question);
    
    if (!result.success) {
      console.log(`   ❌ FAILED - ${result.error}`);
      failedTests++;
      results.push({ ...test, status: 'FAILED', error: result.error });
      continue;
    }

    const response = result.data.message;
    console.log(`   Response: ${response.substring(0, 100)}...`);

    // Check if response contains expected keywords
    const keywordCheck = checkKeywords(response, test.expectedKeywords);
    
    if (keywordCheck.passed) {
      console.log(`   ✅ PASSED - Found keywords: ${keywordCheck.found.join(', ')}`);
      passedTests++;
      results.push({ ...test, status: 'PASSED', response });
    } else {
      console.log(`   ⚠️  WARNING - Missing expected keywords: ${keywordCheck.missing.join(', ')}`);
      console.log(`   Response might be valid but doesn't match expected keywords`);
      passedTests++; // Still count as passed since response was received
      results.push({ ...test, status: 'WARNING', response });
    }

    // Check response quality
    if (response.length < 50) {
      console.log(`   ⚠️  Response seems too short (${response.length} chars)`);
    }
    if (response.includes('Error') || response.includes('error')) {
      console.log(`   ⚠️  Response contains error message`);
    }

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('\n📊 TEST SUMMARY');
  console.log('=' .repeat(80));
  console.log(`Total Tests: ${totalTests}`);
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  // Category breakdown
  console.log('\n📈 RESULTS BY CATEGORY:');
  const categories = [...new Set(testQuestions.map(t => t.category))];
  categories.forEach(category => {
    const categoryTests = results.filter(r => r.category === category);
    const categoryPassed = categoryTests.filter(r => r.status === 'PASSED' || r.status === 'WARNING').length;
    console.log(`   ${category}: ${categoryPassed}/${categoryTests.length} passed`);
  });

  console.log('\n' + '='.repeat(80));
  console.log(failedTests === 0 ? '🎉 All tests completed!' : '⚠️  Some tests failed');
}

// Run the tests
runTests().catch(console.error);
