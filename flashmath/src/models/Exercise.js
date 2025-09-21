// Exercise model
class Exercise {
  constructor(data) {
    this.level = data.level || 'Basic'; // "Basic" | "Junior"
    this.group = data.group || '';
    this.questions = data.questions || [];
  }

  // Validate exercise data
  validate() {
    const errors = [];
    
    if (!['Basic', 'Junior'].includes(this.level)) errors.push('Level must be Basic or Junior');
    if (!this.group) errors.push('Group name is required');
    if (!Array.isArray(this.questions)) errors.push('Questions must be an array');
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Convert to Firestore document
  toFirestore() {
    return {
      level: this.level,
      group: this.group,
      questions: this.questions
    };
  }

  // Create from Firestore document
  static fromFirestore(data) {
    return new Exercise({
      ...data
    });
  }
}

// Question model
export class Question {
  constructor(data) {
    this.id = data.id || 0;
    this.numbers = data.numbers || []; // array of numbers to flash
    this.correctAnswer = data.correctAnswer || 0;
  }

  validate() {
    const errors = [];
    
    if (!Array.isArray(this.numbers) || this.numbers.length === 0) errors.push('Numbers array is required');
    if (typeof this.correctAnswer !== 'number') errors.push('Correct answer must be a number');
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default Exercise;