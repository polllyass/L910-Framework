const fs = require('fs');
const path = require('path');
class JsonHandler {
  constructor(filename) {
    this.filepath = path.join(__dirname, '../..', 'data', filename);
  }
  readSync() {
    try {
      const data = fs.readFileSync(this.filepath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading file:', error);
      return [];
    }
  }
  writeSync(data) {
    try {
      fs.writeFileSync(this.filepath, JSON.stringify(data, null, 2), 'utf8');
      return true;
    } catch (error) {
      console.error('Error writing file:', error);
      return false;
    }
  }
  generateId(items) {
    if (items.length === 0) return 1;
    const maxId = Math.max(...items.map(item => item.id || 0));
    return maxId + 1;
  }
}
module.exports = JsonHandler;