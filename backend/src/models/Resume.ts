import { DataTypes, Model, ModelStatic, Optional } from 'sequelize';
import { Sequelize } from 'sequelize';

type DatabaseConnection = Sequelize;

type ResumeAttributes = {
    id: string;
    userId: string;
    name: string;
    templateId: string;
    content: any;
    createdAt: Date;
    updatedAt: Date;
};

type ResumeCreationAttributes = Optional<ResumeAttributes, 'id' | 'createdAt' | 'updatedAt'>;

export class Resume extends Model<ResumeAttributes, ResumeCreationAttributes> {
    public id!: string;
    public userId!: string;
    public name!: string;
    public templateId!: string;
    public content!: any;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    public static initialize(sequelize: DatabaseConnection): typeof Resume {
        Resume.init(
            {
                id: {
                    type: DataTypes.UUID,
                    defaultValue: DataTypes.UUIDV4,
                    primaryKey: true,
                },
                userId: {
                    type: DataTypes.UUID,
                    allowNull: false,
                },
                name: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                templateId: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                content: {
                    type: DataTypes.JSONB,
                    allowNull: false,
                },
                createdAt: {
                    type: DataTypes.DATE,
                    allowNull: false,
                    defaultValue: DataTypes.NOW,
                },
                updatedAt: {
                    type: DataTypes.DATE,
                    allowNull: false,
                    defaultValue: DataTypes.NOW,
                },
            },
            {
                sequelize,
                modelName: 'Resume',
                tableName: 'resumes',
                timestamps: true,
            }
        );

        return Resume;
    }

    public static associate(models: any) {
        // Define associations here
        Resume.hasMany(ResumeVersion, {
            foreignKey: 'resumeId',
            as: 'versions',
        });
    }
}

type ResumeVersionAttributes = {
    id: string;
    resumeId: string;
    content: any;
    changeSummary: string | null;
    createdAt: Date;
};

type ResumeVersionCreationAttributes = Optional<ResumeVersionAttributes, 'id' | 'createdAt'>;

export class ResumeVersion extends Model<ResumeVersionAttributes, ResumeVersionCreationAttributes> {
    public id!: string;
    public resumeId!: string;
    public content!: any;
    public changeSummary!: string | null;
    public readonly createdAt!: Date;

    public static initialize(sequelize: DatabaseConnection): typeof ResumeVersion {
        ResumeVersion.init(
            {
                id: {
                    type: DataTypes.UUID,
                    defaultValue: DataTypes.UUIDV4,
                    primaryKey: true,
                },
                resumeId: {
                    type: DataTypes.UUID,
                    allowNull: false,
                    references: {
                        model: 'resumes', // Table name
                        key: 'id',
                    },
                    onDelete: 'CASCADE',
                },
                content: {
                    type: DataTypes.JSONB,
                    allowNull: false,
                },
                changeSummary: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                createdAt: {
                    type: DataTypes.DATE,
                    allowNull: false,
                    defaultValue: DataTypes.NOW,
                },
            },
            {
                sequelize,
                modelName: 'ResumeVersion',
                tableName: 'resume_versions',
                timestamps: true,
                updatedAt: false,
            }
        );

        return ResumeVersion;
    }

    public static associate(models: any) {
        // Define associations here
        ResumeVersion.belongsTo(Resume, {
            foreignKey: 'resumeId',
            as: 'resume',
        });
    }
}
