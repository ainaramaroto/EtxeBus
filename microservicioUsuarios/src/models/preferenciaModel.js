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
    origin_slug: {
      type: String,
      maxlength: 120,
      trim: true,
      default: null,
    },
    destination_slug: {
      type: String,
      maxlength: 120,
      trim: true,
      default: null,
    },
    origin_label: {
      type: String,
      maxlength: 120,
      trim: true,
      default: null,
    },
    destination_label: {
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
  { idUsuario: 1, origin_slug: 1, destination_slug: 1 },
  { unique: true, sparse: true, name: 'uniq_usuario_trayecto' }
);

module.exports = mongoose.model('Preferencia', PreferenciaSchema);
