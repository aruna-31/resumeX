import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import User from './User';
import Job from './Job';

class Application extends Model {
    public id!: string;
    public job_id!: string;
    public candidate_id!: string;
    public resume_url!: string;
    public parsed_data!: any; // JSONB
    public match_score!: number;
    public ai_explanation!: string;
    public status!: 'APPLIED' | 'SHORTLISTED' | 'REJECTED' | 'HIRED';

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Application.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        job_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'jobs',
                key: 'id',
            },
        },
        candidate_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
        },
        resume_url: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        parsed_data: {
            type: DataTypes.JSONB,
            defaultValue: {},
        },
        match_score: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        ai_explanation: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM('APPLIED', 'SHORTLISTED', 'REJECTED', 'HIRED'),
            defaultValue: 'APPLIED',
        },
    },
    {
        sequelize,
        modelName: 'Application',
        tableName: 'applications',
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ['job_id', 'candidate_id'],
            },
        ],
    }
);

// Associations
Application.belongsTo(Job, { foreignKey: 'job_id', as: 'job' });
Job.hasMany(Application, { foreignKey: 'job_id', as: 'applications' });

Application.belongsTo(User, { foreignKey: 'candidate_id', as: 'candidate' });
User.hasMany(Application, { foreignKey: 'candidate_id', as: 'applications' });

export default Application;
