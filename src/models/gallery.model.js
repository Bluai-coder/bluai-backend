module.exports = (sequelize, DataTypes) => {
  const Gallery = sequelize.define(
    'gallery',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM('images', 'videos', 'documents', 'products'),
        allowNull: false,
      },
      src: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'File path for images/documents; URL or file path for videos',
      },
      thumbnail: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Optional thumbnail path, primarily used for video entries',
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      timestamps: false,
      underscored: true,
      tableName: 'gallery',
      schema: 'public',
    }
  );

  return Gallery;
};
