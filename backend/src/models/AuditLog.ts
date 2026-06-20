import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import User from './User';

class AuditLog extends Model {
    public id!: string;
    public user_id!: string;
    public action!: string; // "JOB_CREATED", "APPLICATION_SUBMITTED"
    public entity_id!: string;
    public details!: any;
    public readonly createdAt!: Date;
}

AuditLog.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: true, // System actions might be null
            references: {
                model: 'users', // table name
                key: 'id',
            },
        },
        action: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        entity_id: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        details: {
            type: DataTypes.JSONB,
            defaultValue: {},
        },
    },
    {
        sequelize,
        modelName: 'AuditLog',
        tableName: 'audit_logs',
        timestamps: true,
        updatedAt: false, // Audit logs are immutable
    }
);

AuditLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

export default AuditLog;
