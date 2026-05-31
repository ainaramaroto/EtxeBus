const mongoose = require('mongoose');

const PreferenciaSchema = new mongoose.Schema(
  {
    idPreferencia: {
      type: Number,
      required: true,
      unique: true,
    },
    idUsuario: {
      type: Number,
      required: true,
      index: true,
    },
    tipo: {
      type: String,
      required: true,
      maxlength: 10,
      trim: true,
    },
    paradaOrigen: {
      type: String,
      maxlength: 120,
      trim: true,
      default: null,
    },
    paradaDestino: {
      type: String,
      maxlength: 120,
      trim: true,
      default: null,
    },
    nomParadaOrigen: {
      type: String,
      maxlength: 120,
      trim: true,
      default: null,
    },
    nomParadaDestino: {
      type: String,
      maxlength: 120,
      trim: true,
      default: null,
    },
    createdAt: {
      type: String,
    },
  },
  {
    versionKey: false,
    collection: 'preferencias',
  }
);

PreferenciaSchema.index(
  { idUsuario: 1, paradaOrigen: 1, paradaDestino: 1 },
  { unique: true, sparse: true, name: 'uniq_usuario_trayecto_v2' }
);

module.exports = mongoose.model('Preferencia', PreferenciaSchema);
