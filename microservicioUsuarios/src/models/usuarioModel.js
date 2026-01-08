const mongoose = require('mongoose');

const UsuarioSchema = new mongoose.Schema(
  {
    idUsuario: {
      type: Number,
      required: true,
      unique: true,
    },
    nomUsuario: {
      type: String,
      required: true,
      maxlength: 25,
      trim: true,
    },
    contrasenia: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      maxlength: 40,
      trim: true,
      lowercase: true,
    },
    createdAt: {
      type: String,
    },
  },
  {
    versionKey: false,
    collection: 'usuarios',
  }
);

module.exports = mongoose.model('Usuario', UsuarioSchema);
