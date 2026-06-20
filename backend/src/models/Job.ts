import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import User from './User';

class Job extends Model {
    public id!: string;
    public hr_id!: string;
    public ats_job_id!: string; // e.g., "JOB-12345"
    public title!: string;
    public description!: string;
    public requirements!: any; // JSONB: { skills: [], minExp: 2 }
    public status!: 'OPEN' | 'CLOSED' | 'ARCHIVED';
    public location!: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Job.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        hr_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
        },
        ats_job_id: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        requirements: {
            type: DataTypes.JSONB,
            defaultValue: {},
        },
        status: {
            type: DataTypes.ENUM('OPEN', 'CLOSED', 'ARCHIVED'),
            defaultValue: 'OPEN',
        },
        location: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        sequelize,
        modelName: 'Job',
        tableName: 'jobs',
        timestamps: true,
    }
);

// Define Association
Job.belongsTo(User, { foreignKey: 'hr_id', as: 'hr' });
User.hasMany(Job, { foreignKey: 'hr_id', as: 'jobs' });

export default Job;
