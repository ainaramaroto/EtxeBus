class Preferencia {
  /**
   * @param {Object} opts
   * @param {number|string} [opts.idPreferencia]
   * @param {number|string} opts.idUsuario
   * @param {string} opts.tipo
   * @param {string|null} [opts.origin_slug]
   * @param {string|null} [opts.destination_slug]
   * @param {string|null} [opts.origin_label]
   * @param {string|null} [opts.destination_label]
   */
  constructor({
    idPreferencia = null,
    idUsuario,
    tipo,
    origin_slug = null,
    destination_slug = null,
    origin_label = null,
    destination_label = null,
  } = {}) {
    if (idUsuario === undefined || idUsuario === null) {
      throw new Error('idUsuario requerido');
    }
    if (!tipo) {
      throw new Error('tipo requerido');
    }
    if (!Preferencia.validarTipo(tipo)) {
      throw new Error('tipo invalido');
    }

    const parsedUsuario = Number(idUsuario);
    if (!Number.isFinite(parsedUsuario)) {
      throw new Error('idUsuario invalido');
    }

    this.idPreferencia =
      idPreferencia !== null && idPreferencia !== undefined
        ? Number(idPreferencia)
        : Preferencia.generarIdNumerico();
    this.idUsuario = parsedUsuario;
    this.tipo = String(tipo).trim();
    this.origin_slug = Preferencia.parseNullableString(origin_slug, 120);
    this.destination_slug = Preferencia.parseNullableString(destination_slug, 120);
    this.origin_label = Preferencia.parseNullableString(origin_label, 120);
    this.destination_label = Preferencia.parseNullableString(destination_label, 120);
    this.createdAt = new Date().toISOString();
  }

  static generarIdNumerico() {
    const base = Number(String(Date.now()).slice(-9));
    const rand = Math.floor(Math.random() * 90) + 10;
    return base * 100 + rand;
  }

  static parseNullableString(value, maxLength) {
    if (value === null || value === undefined) return null;
    const trimmed = String(value).trim();
    if (!trimmed.length) return null;
    if (maxLength && trimmed.length > maxLength) {
      return trimmed.slice(0, maxLength);
    }
    return trimmed;
  }

  static validarTipo(tipo) {
    if (typeof tipo !== 'string') return false;
    const t = tipo.trim();
    return t.length > 0 && t.length <= 10;
  }

  toObject() {
    return {
      idPreferencia: this.idPreferencia,
      idFavorito: this.idPreferencia,
      idUsuario: this.idUsuario,
      tipo: this.tipo,
      origin_slug: this.origin_slug,
      destination_slug: this.destination_slug,
      origin_label: this.origin_label,
      destination_label: this.destination_label,
      createdAt: this.createdAt,
    };
  }

  toJSON() {
    return this.toObject();
  }

  static fromObject(obj = {}) {
    if (!obj) throw new Error('obj requerido');
    return new Preferencia({
      idPreferencia: obj.idPreferencia ?? obj.idFavorito ?? obj.id ?? null,
      idUsuario: obj.idUsuario,
      tipo: obj.tipo,
      origin_slug: obj.origin_slug ?? null,
      destination_slug: obj.destination_slug ?? null,
      origin_label: obj.origin_label ?? null,
      destination_label: obj.destination_label ?? null,
    });
  }
}

module.exports = Preferencia;
