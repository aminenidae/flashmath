// CSV File metadata model
class CSVFile {
  constructor(data) {
    this.id = data.id || '';
    this.fileName = data.fileName || '';
    this.level = data.level || 'Basic'; // "Basic" | "Junior"
    this.uploadedBy = data.uploadedBy || '';
    this.createdAt = data.createdAt || new Date().toISOString();
  }

  // Validate CSV file metadata
  validate() {
    const errors = [];
    
    if (!this.fileName) errors.push('File name is required');
    if (!['Basic', 'Junior'].includes(this.level)) errors.push('Level must be Basic or Junior');
    if (!this.uploadedBy) errors.push('Uploaded by is required');
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Convert to Firestore document
  toFirestore() {
    return {
      fileName: this.fileName,
      level: this.level,
      uploadedBy: this.uploadedBy,
      createdAt: this.createdAt
    };
  }

  // Create from Firestore document
  static fromFirestore(data, id) {
    return new CSVFile({
      id,
      ...data
    });
  }
}

export default CSVFile;