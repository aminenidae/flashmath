import Papa from 'papaparse';

// Parse CSV file and convert to exercise format
export const parseCSVToExercises = (csvData, level) => {
  try {
    const parsed = Papa.parse(csvData, {
      header: false,
      skipEmptyLines: true
    });
    
    if (parsed.errors.length > 0) {
      throw new Error('CSV parsing errors: ' + parsed.errors.map(e => e.message).join(', '));
    }
    
    const exercises = [];
    let currentGroup = '';
    let questions = [];
    
    // Process each row
    parsed.data.forEach((row, index) => {
      // Skip header row if it exists
      if (index === 0 && row[0].toLowerCase().includes('group')) {
        return;
      }
      
      // Check if this is a group header row
      if (row[0] && row[0].toLowerCase().includes('group')) {
        // If we have accumulated questions, save the previous group
        if (currentGroup && questions.length > 0) {
          exercises.push({
            level,
            group: currentGroup,
            questions
          });
        }
        
        // Start new group
        currentGroup = row[1] || `Group ${exercises.length + 1}`;
        questions = [];
        return;
      }
      
      // Process question row
      // Assuming columns C-I contain numbers, and column J contains the answer
      const numbers = [];
      for (let i = 2; i <= 8; i++) { // Columns C-I (0-indexed: 2-8)
        if (row[i] && row[i].trim() !== '') {
          const num = parseFloat(row[i]);
          if (!isNaN(num)) {
            numbers.push(num);
          }
        }
      }
      
      // Get correct answer from column J (0-indexed: 9)
      const correctAnswer = parseFloat(row[9]);
      
      if (numbers.length > 0 && !isNaN(correctAnswer)) {
        questions.push({
          id: questions.length + 1,
          numbers,
          correctAnswer
        });
      }
    });
    
    // Save the last group
    if (currentGroup && questions.length > 0) {
      exercises.push({
        level,
        group: currentGroup,
        questions
      });
    }
    
    // If no groups were defined, create a default group
    if (exercises.length === 0 && questions.length > 0) {
      exercises.push({
        level,
        group: 'Default Group',
        questions
      });
    }
    
    return exercises;
  } catch (error) {
    console.error('Error parsing CSV:', error);
    throw error;
  }
};

// Convert exercises to CSV format
export const exercisesToCSV = (exercises) => {
  try {
    const csvData = [];
    
    // Add header row
    csvData.push(['Group', 'Question ID', 'Num1', 'Num2', 'Num3', 'Num4', 'Num5', 'Num6', 'Num7', 'Answer']);
    
    exercises.forEach(exercise => {
      // Add group header
      csvData.push([`Group: ${exercise.group}`, '', '', '', '', '', '', '', '', '']);
      
      // Add questions
      exercise.questions.forEach(question => {
        const row = [
          exercise.group,
          question.id,
          ...question.numbers,
          question.correctAnswer
        ];
        
        // Pad row to ensure it has 10 columns
        while (row.length < 10) {
          row.push('');
        }
        
        csvData.push(row);
      });
    });
    
    return Papa.unparse(csvData);
  } catch (error) {
    console.error('Error converting exercises to CSV:', error);
    throw error;
  }
};