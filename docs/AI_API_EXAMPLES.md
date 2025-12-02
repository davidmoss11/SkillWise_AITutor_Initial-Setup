# Example API Responses - AI Challenge Generation

This document shows real-world example responses from the AI challenge generation API.

## Example 1: Generate Easy Programming Challenge

### Request
```http
POST /api/ai/generateChallenge
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "category": "programming",
  "difficulty": "easy",
  "topic": "arrays",
  "saveToDatabase": true
}
```

### Response
```json
{
  "success": true,
  "message": "Challenge generated successfully",
  "data": {
    "challenge": {
      "title": "Find the Largest Number in an Array",
      "description": "Learn how to iterate through arrays and track maximum values. This challenge teaches basic array manipulation and comparison logic.",
      "instructions": "Write a function called `findLargest` that takes an array of numbers as input and returns the largest number in the array. Your function should handle both positive and negative numbers. If the array is empty, return null.",
      "category": "programming",
      "difficulty_level": "easy",
      "estimated_time_minutes": 15,
      "points_reward": 25,
      "max_attempts": 3,
      "tags": ["arrays", "loops", "comparison", "beginner"],
      "prerequisites": ["basic JavaScript syntax", "array basics", "if statements"],
      "learning_objectives": [
        "Understand how to iterate through arrays",
        "Practice using comparison operators",
        "Learn to track values during iteration",
        "Handle edge cases like empty arrays"
      ],
      "starter_code": "function findLargest(numbers) {\n  // Your code here\n  \n}",
      "solution_approach": "Initialize a variable to track the maximum value. Loop through the array, comparing each element with your current maximum. Update the maximum when you find a larger value. Remember to handle the empty array case.",
      "test_cases": [
        {
          "input": "[1, 5, 3, 9, 2]",
          "expected_output": "9",
          "description": "Should find the largest positive number"
        },
        {
          "input": "[-5, -1, -10, -3]",
          "expected_output": "-1",
          "description": "Should work with negative numbers"
        },
        {
          "input": "[42]",
          "expected_output": "42",
          "description": "Should handle single-element arrays"
        },
        {
          "input": "[]",
          "expected_output": "null",
          "description": "Should return null for empty arrays"
        }
      ]
    },
    "saved": true,
    "challengeId": 847
  }
}
```

## Example 2: Generate Medium Algorithm Challenge

### Request
```http
POST /api/ai/generateChallenge
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "category": "algorithms",
  "difficulty": "medium",
  "topic": "sorting",
  "saveToDatabase": false
}
```

### Response
```json
{
  "success": true,
  "message": "Challenge generated successfully",
  "data": {
    "challenge": {
      "title": "Implement Bubble Sort",
      "description": "Implement the classic bubble sort algorithm from scratch. This challenge teaches sorting fundamentals and nested loop patterns.",
      "instructions": "Create a function `bubbleSort` that takes an array of numbers and returns a new sorted array using the bubble sort algorithm. The original array should not be modified. Compare adjacent elements and swap them if they're in the wrong order, repeating until the array is sorted.",
      "category": "algorithms",
      "difficulty_level": "medium",
      "estimated_time_minutes": 45,
      "points_reward": 75,
      "max_attempts": 3,
      "tags": ["sorting", "algorithms", "bubble-sort", "nested-loops"],
      "prerequisites": [
        "array manipulation",
        "nested loops",
        "swapping values",
        "algorithm complexity basics"
      ],
      "learning_objectives": [
        "Implement a sorting algorithm from scratch",
        "Understand bubble sort mechanics",
        "Practice nested loop patterns",
        "Learn about time complexity O(n²)"
      ],
      "starter_code": "function bubbleSort(arr) {\n  // Create a copy of the array\n  const result = [...arr];\n  \n  // Implement bubble sort here\n  \n  return result;\n}",
      "solution_approach": "Use two nested loops. The outer loop runs n times, and the inner loop compares adjacent pairs. Swap elements if they're in the wrong order. The largest element 'bubbles up' to the end in each pass.",
      "test_cases": [
        {
          "input": "[64, 34, 25, 12, 22, 11, 90]",
          "expected_output": "[11, 12, 22, 25, 34, 64, 90]",
          "description": "Should sort a typical unsorted array"
        },
        {
          "input": "[5, 2, 8, 2, 9]",
          "expected_output": "[2, 2, 5, 8, 9]",
          "description": "Should handle duplicate values"
        },
        {
          "input": "[1, 2, 3, 4, 5]",
          "expected_output": "[1, 2, 3, 4, 5]",
          "description": "Should handle already sorted arrays"
        },
        {
          "input": "[]",
          "expected_output": "[]",
          "description": "Should handle empty arrays"
        }
      ]
    },
    "saved": false,
    "challengeId": null
  }
}
```

## Example 3: Get AI Feedback

### Request
```http
POST /api/ai/feedback
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "challengeId": 847,
  "submissionText": "function findLargest(numbers) {\n  if (numbers.length === 0) return null;\n  let max = numbers[0];\n  for (let i = 1; i < numbers.length; i++) {\n    if (numbers[i] > max) {\n      max = numbers[i];\n    }\n  }\n  return max;\n}"
}
```

### Response
```json
{
  "success": true,
  "data": {
    "feedback": {
      "overall_assessment": "Excellent implementation! Your solution is clean, efficient, and handles all the requirements correctly.",
      "strengths": [
        "Proper handling of empty array edge case",
        "Efficient O(n) time complexity",
        "Clear variable naming (max)",
        "Correct loop initialization starting from index 1"
      ],
      "areas_for_improvement": [
        "Could add input validation to check if the input is actually an array",
        "Consider using Math.max() with spread operator as an alternative approach"
      ],
      "specific_suggestions": [
        "Add a check: if (!Array.isArray(numbers)) return null;",
        "For a more functional approach, try: return numbers.length === 0 ? null : Math.max(...numbers);",
        "Consider adding comments for clarity in production code"
      ],
      "code_quality_score": 9,
      "meets_requirements": true,
      "next_steps": [
        "Try solving 'Find K Largest Elements' to extend this concept",
        "Learn about reduce() method for array operations",
        "Explore time and space complexity analysis"
      ]
    }
  }
}
```

## Example 4: Get Hints

### Request
```http
GET /api/ai/hints/847
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Response (First Attempt)
```json
{
  "success": true,
  "data": {
    "hints": {
      "hint": "Think about how you would find the largest number if you were looking at the array on paper. You'd probably go through each number one by one, keeping track of the biggest one you've seen so far. Try implementing that logic in code.",
      "hint_level": "gentle nudge",
      "resources": [
        "MDN Web Docs: Array.prototype.forEach()",
        "JavaScript for-loop tutorial",
        "Comparison operators in JavaScript"
      ]
    }
  }
}
```

### Response (Second Attempt)
```json
{
  "success": true,
  "data": {
    "hints": {
      "hint": "Create a variable called 'max' and initialize it with the first element of the array. Then loop through the rest of the array starting from index 1. For each element, compare it with 'max' and update 'max' if you find a larger value. Don't forget to handle the empty array case at the beginning.",
      "hint_level": "more specific",
      "resources": [
        "How to initialize variables in JavaScript",
        "Working with array indices",
        "The Math.max() function as an alternative"
      ]
    }
  }
}
```

## Example 5: Get Challenge Suggestions

### Request
```http
GET /api/ai/suggestions
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Response
```json
{
  "success": true,
  "data": {
    "suggestions": [
      {
        "category": "algorithms",
        "difficulty": "medium",
        "topic": "searching",
        "reason": "Build on your array manipulation skills by learning binary search algorithms"
      },
      {
        "category": "data-structures",
        "difficulty": "medium",
        "topic": "linked lists",
        "reason": "Expand your knowledge to other data structures beyond arrays"
      },
      {
        "category": "programming",
        "difficulty": "hard",
        "topic": "recursion",
        "reason": "Challenge yourself with more advanced programming concepts"
      }
    ]
  }
}
```

## Example 6: Get Learning Analysis

### Request
```http
GET /api/ai/analysis
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Response
```json
{
  "success": true,
  "data": {
    "analysis": {
      "learning_pace": "Excellent progress! You're completing challenges consistently and showing steady improvement in your scores.",
      "strengths": [
        "Strong understanding of array operations",
        "Good problem-solving approach",
        "Attention to edge cases",
        "Clean code style"
      ],
      "growth_areas": [
        "Advanced algorithm design patterns",
        "Time and space complexity optimization",
        "Recursive problem-solving techniques",
        "Working with complex data structures"
      ],
      "recommended_focus": [
        "Practice more medium-difficulty algorithm challenges",
        "Study Big O notation and complexity analysis",
        "Learn about dynamic programming",
        "Explore tree and graph data structures"
      ],
      "motivation_tips": [
        "Set a goal to complete 3 challenges per week",
        "Join the community leaderboard competition",
        "Try teaching concepts to solidify your understanding",
        "Celebrate your 10-challenge streak!"
      ]
    }
  }
}
```

## Example 7: Generate Hard Data Structures Challenge

### Request
```http
POST /api/ai/generateChallenge
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "category": "data-structures",
  "difficulty": "hard",
  "topic": "binary search tree",
  "saveToDatabase": true
}
```

### Response
```json
{
  "success": true,
  "message": "Challenge generated successfully",
  "data": {
    "challenge": {
      "title": "Implement BST Insertion and Search",
      "description": "Build a binary search tree from scratch with insertion and search operations. This challenge teaches tree structure fundamentals and recursive algorithms.",
      "instructions": "Create a BinarySearchTree class with methods `insert(value)` and `search(value)`. The insert method should add a new node in the correct position maintaining BST properties. The search method should return true if the value exists, false otherwise. Implement both methods using recursion.",
      "category": "data-structures",
      "difficulty_level": "hard",
      "estimated_time_minutes": 90,
      "points_reward": 150,
      "max_attempts": 5,
      "tags": ["binary-search-tree", "recursion", "data-structures", "trees"],
      "prerequisites": [
        "understanding of tree data structures",
        "recursion",
        "object-oriented programming",
        "BST properties"
      ],
      "learning_objectives": [
        "Implement a binary search tree from scratch",
        "Practice recursive algorithms",
        "Understand tree node relationships",
        "Master BST insertion logic"
      ],
      "starter_code": "class Node {\n  constructor(value) {\n    this.value = value;\n    this.left = null;\n    this.right = null;\n  }\n}\n\nclass BinarySearchTree {\n  constructor() {\n    this.root = null;\n  }\n  \n  insert(value) {\n    // Your code here\n  }\n  \n  search(value) {\n    // Your code here\n  }\n}",
      "solution_approach": "For insertion: If tree is empty, create root. Otherwise, recursively traverse left if value is smaller, right if larger. For search: Recursively check if current node matches, or search left/right subtree based on comparison.",
      "test_cases": [
        {
          "input": "insert(5), insert(3), insert(7), search(3)",
          "expected_output": "true",
          "description": "Should find inserted values"
        },
        {
          "input": "insert(10), insert(5), insert(15), search(20)",
          "expected_output": "false",
          "description": "Should return false for non-existent values"
        },
        {
          "input": "insert(8), insert(3), insert(10), insert(1), search(1)",
          "expected_output": "true",
          "description": "Should handle multiple insertions and searches"
        }
      ]
    },
    "saved": true,
    "challengeId": 848
  }
}
```

## Error Response Examples

### Invalid API Key
```json
{
  "success": false,
  "message": "AI service configuration error. Please contact administrator."
}
```

### Rate Limit Exceeded
```json
{
  "success": false,
  "message": "Rate limit exceeded. Please try again in 60 seconds.",
  "error": "Too many requests"
}
```

### Invalid Difficulty
```json
{
  "success": false,
  "message": "Invalid difficulty level. Must be one of: easy, medium, hard, expert"
}
```

### Missing Authentication
```json
{
  "success": false,
  "message": "User authentication required"
}
```

## Notes

- All timestamps are in ISO 8601 format
- Responses typically arrive in 5-10 seconds
- The `saveToDatabase` flag determines if the challenge is persisted
- Challenge IDs are only provided when saved to database
- All code examples are properly escaped in JSON
- Tags and prerequisites are arrays of strings
- Learning objectives are typically 3-5 items
- Test cases include input, expected output, and description

---

These examples represent typical responses from the AI challenge generation system. Actual responses may vary based on the AI model's output and the specific request parameters.
