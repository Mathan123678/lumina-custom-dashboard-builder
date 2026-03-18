const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../data');
if (!fs.existsSync(DB_PATH)) fs.mkdirSync(DB_PATH);

const getFile = (collection) => path.join(DB_PATH, `${collection}.json`);

const read = (collection) => {
  const file = getFile(collection);
  if (!fs.existsSync(file)) return [];
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    return [];
  }
};

const write = (collection, data) => {
  fs.writeFileSync(getFile(collection), JSON.stringify(data, null, 2));
};

class MockModel {
  constructor(collection) {
    this.collection = collection;
    
    // Support 'new Model(data)'
    const self = this;
    const ModelConstructor = function(data) {
      Object.assign(this, data);
      this.save = async function() {
        let allData = read(self.collection);
        const newDoc = {
          ...this,
          _id: this._id || `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: this.createdAt || new Date(),
          updatedAt: new Date()
        };
        // Remove the save function from the stored data
        delete newDoc.save; 
        allData.push(newDoc);
        write(self.collection, allData);
        return newDoc;
      };
      return this;
    };

    // Copy methods to constructor
    ModelConstructor.find = this.find.bind(this);
    ModelConstructor.findOne = this.findOne.bind(this);
    ModelConstructor.findByIdAndUpdate = this.findByIdAndUpdate.bind(this);
    ModelConstructor.findByIdAndDelete = this.findByIdAndDelete.bind(this);
    ModelConstructor.countDocuments = this.countDocuments.bind(this);
    ModelConstructor.insertMany = this.insertMany.bind(this);
    
    this.ModelConstructor = ModelConstructor;
    return ModelConstructor;
  }

  _wrap(data) {
    const chain = {
      data,
      sort: (sortObj) => {
        if (sortObj) {
          const key = Object.keys(sortObj)[0];
          const dir = sortObj[key];
          chain.data.sort((a, b) => {
            if (a[key] < b[key]) return -1 * dir;
            if (a[key] > b[key]) return 1 * dir;
            return 0;
          });
        }
        return chain;
      },
      limit: (num) => {
        chain.data = chain.data.slice(0, num);
        return chain;
      },
      then: (resolve) => resolve(chain.data),
      catch: (reject) => {}
    };
    return chain;
  }

  find(query = {}) {
    let data = read(this.collection);
    // Apply basic filtering if query is provided
    if (Object.keys(query).length > 0) {
      data = data.filter(item => {
        return Object.entries(query).every(([key, value]) => {
          if (key === '_id' || key === 'id') {
            return item._id === value || item.id === value;
          }
          return item[key] === value;
        });
      });
    }
    return this._wrap(data);
  }

  async findOne(query = {}) {
    const data = read(this.collection);
    const item = data.find(item => {
      return Object.entries(query).every(([key, value]) => {
        if (key === '_id' || key === 'id') {
          return item._id === value || item.id === value;
        }
        return item[key] === value;
      });
    });
    return item ? new (this.ModelConstructor)(item) : null;
  }

  async findByIdAndUpdate(id, update, options = {}) {
    let data = read(this.collection);
    const index = data.findIndex(item => item._id === id || item.id === id);
    if (index === -1) return null;
    data[index] = { ...data[index], ...update, updatedAt: new Date() };
    write(this.collection, data);
    return data[index];
  }

  async findByIdAndDelete(id) {
    let data = read(this.collection);
    const item = data.find(i => i._id === id || i.id === id);
    if (!item) return null;
    write(this.collection, data.filter(i => i._id !== id && i.id !== id));
    return item;
  }

  async countDocuments() {
    return read(this.collection).length;
  }

  async insertMany(docs) {
    let data = read(this.collection);
    const newDocs = docs.map(doc => ({
      ...doc,
      _id: doc._id || `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: doc.createdAt || new Date(),
      updatedAt: new Date()
    }));
    data.push(...newDocs);
    write(this.collection, data);
    return newDocs;
  }
}

module.exports = {
  Order: new MockModel('orders'),
  DashboardConfig: new MockModel('dashboard_configs'),
  MockModel,
  DB_PATH
};
