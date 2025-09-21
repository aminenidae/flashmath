// Progress model
class Progress {
  constructor(data) {
    this.studentId = data.studentId || '';
    this.level = data.level || 'Basic';
    this.exerciseGroup = data.exerciseGroup || '';
    this.questionId = data.questionId || 0;
    this.response = data.response || '';
    this.isCorrect = data.isCorrect || false;
    this.timestamp = data.timestamp || new Date().toISOString();
  }

  // Validate progress data
  validate() {
    const errors = [];
    
    if (!this.studentId) errors.push('Student ID is required');
    if (!this.level) errors.push('Level is required');
    if (!this.exerciseGroup) errors.push('Exercise group is required');
    if (!this.questionId) errors.push('Question ID is required');
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Convert to Firestore document
  toFirestore() {
    return {
      studentId: this.studentId,
      level: this.level,
      exerciseGroup: this.exerciseGroup,
      questionId: this.questionId,
      response: this.response,
      isCorrect: this.isCorrect,
      timestamp: this.timestamp
    };
  }

  // Create from Firestore document
  static fromFirestore(data) {
    return new Progress({
      ...data
    });
  }
}

export default Progress;