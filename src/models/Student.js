// Student model
class Student {
  constructor(data) {
    this.id = data.id || '';
    this.name = data.name || '';
    this.password = data.password || ''; // hashed
    this.age = data.age || 0;
    this.classroom = data.classroom || 'Basic'; // "Basic" | "Junior"
    this.flashSpeed = data.flashSpeed || 2; // seconds between flashes
    this.responseTime = data.responseTime || 10; // allowed response time in seconds
  }

  // Validate student data
  validate() {
    const errors = [];
    
    if (!this.name) errors.push('Name is required');
    if (!this.password) errors.push('Password is required');
    if (!this.age || this.age < 5 || this.age > 18) errors.push('Age must be between 5 and 18');
    if (!['Basic', 'Junior'].includes(this.classroom)) errors.push('Classroom must be Basic or Junior');
    if (this.flashSpeed < 0.5 || this.flashSpeed > 5) errors.push('Flash speed must be between 0.5 and 5 seconds');
    if (this.responseTime < 5 || this.responseTime > 30) errors.push('Response time must be between 5 and 30 seconds');
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Convert to Firestore document
  toFirestore() {
    return {
      name: this.name,
      password: this.password,
      age: this.age,
      classroom: this.classroom,
      flashSpeed: this.flashSpeed,
      responseTime: this.responseTime
    };
  }

  // Create from Firestore document
  static fromFirestore(data, id) {
    return new Student({
      id,
      ...data
    });
  }
}

export default Student;