import { AIProviderResponse } from "./src/modules/interview/providers/AIProvider/AIProviderResponse.js";
import { QuestionResponseParser } from "./src/modules/interview/parsers/QuestionResponseParser.js";
import { QuestionResponseValidator } from "./src/modules/interview/validators/QuestionResponseValidator.js";

const scenarios = [
  {
    name: "1. Successful Parsing (Valid JSON Array)",
    input: `[{"id": 1, "question": "What is JS?", "topic": "JS", "difficulty": "Medium", "type": "text"}]`,
    expectError: null
  },
  {
    name: "2. Markdown Handling (JSON wrapped in ```json)",
    input: `\`\`\`json
[{"id": 2, "question": "What is React?", "topic": "React", "difficulty": "Hard", "type": "text"}]
\`\`\``,
    expectError: null
  },
  {
    name: "3. Whitespace Handling",
    input: `   
    
    [{"id": 3, "question": "What is Node?", "topic": "Node", "difficulty": "Easy", "type": "text"}]
    
    `,
    expectError: null
  },
  {
    name: "4. Malformed JSON",
    input: `[{"id": 4, "question": "Missing quote, "topic": "Node"}`,
    expectError: "ParsingError"
  },
  {
    name: "5. Missing Fields (Missing topic)",
    input: `[{"id": 5, "question": "What?", "difficulty": "Easy", "type": "text"}]`,
    expectError: "ValidationError"
  },
  {
    name: "6. Wrong Types (Difficulty as object)",
    input: `[{"id": 6, "question": "What?", "topic": "JS", "difficulty": {"level": "Hard"}, "type": "text"}]`,
    expectError: "ValidationError"
  }
];

console.log("=== Response Parsing Pipeline Smoke Tests ===\n");

let passed = 0;

scenarios.forEach((scenario) => {
  console.log(`Testing: ${scenario.name}`);
  const response = new AIProviderResponse({ text: scenario.input });
  
  try {
    const parsed = QuestionResponseParser.parse(response);
    const validated = QuestionResponseValidator.validate(parsed);
    
    if (scenario.expectError) {
      console.log(`❌ Failed: Expected ${scenario.expectError} but succeeded.`);
    } else {
      console.log(`✅ Success: Validated ${validated.length} question(s).`);
      passed++;
    }
  } catch (error) {
    if (scenario.expectError && error.name === scenario.expectError) {
      console.log(`✅ Success: Caught expected ${error.name} (${error.message})`);
      passed++;
    } else if (scenario.expectError) {
      console.log(`❌ Failed: Expected ${scenario.expectError}, but got ${error.name}.`);
    } else {
      console.log(`❌ Failed: Expected success, but caught ${error.name} (${error.message}).`);
    }
  }
  console.log("--------------------------------------------------");
});

console.log(`\nResults: ${passed}/${scenarios.length} tests passed.`);
if (passed !== scenarios.length) {
  process.exit(1);
}
