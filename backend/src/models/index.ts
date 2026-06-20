import { Sequelize } from 'sequelize';
import { sequelize } from '../config/database';
import User from './User';
import Job from './Job';
import Application from './Application';
import { Resume, ResumeVersion } from './Resume';

// Initialize models
const models = {
  User: User,
  Job: Job,
  Application: Application,
  Resume: Resume.initialize(sequelize),
  ResumeVersion: ResumeVersion.initialize(sequelize),
  sequelize
};

// Set up associations
Object.values(models).forEach(model => {
  if (model && typeof model === 'object' && 'associate' in model && typeof model.associate === 'function') {
    model.associate(models);
  }
});

// Export models and sequelize instance
export {
  User,
  Job,
  Application,
  Resume,
  ResumeVersion,
  sequelize
};

export default models;
