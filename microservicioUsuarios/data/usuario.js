const crypto = require('crypto');

class Usuario {
    /**
     * @param {Object} opts
     * @param {number|string} [opts.idUsuario]
     * @param {string} opts.nomUsuario
     * @param {string} opts.contrasenia
     * @param {string} opts.email
     * @param {string|null} [opts.telf]
     */
    constructor({ idUsuario = null, nomUsuario, contrasenia, email, telf = null } = {}) {
        if (!nomUsuario) throw new Error('nomUsuario requerido');
        if (!contrasenia) throw new Error('contrasenia requerida');
        if (!email) throw new Error('email requerido');

        if (!Usuario.validarNomUsuario(nomUsuario)) throw new Error('nomUsuario invalido (max 25 caracteres)');
        if (!Usuario.validarContrasenia(contrasenia)) throw new Error('contrasenia invalida (6-15 caracteres)');
        if (!Usuario.validarEmail(email)) throw new Error('email invalido');
        if (telf !== null && !Usuario.validarTelf(telf)) throw new Error('telf invalido (max 15 caracteres)');

        this.idUsuario = idUsuario != null ? Number(idUsuario) : Usuario.generarIdNumerico();
        this.nomUsuario = String(nomUsuario).trim();
        this.contrasenia = Usuario.hashContrasenia(contrasenia);
        this.email = String(email).trim();
        this.telf = telf !== null ? String(telf).trim() : null;
        this.createdAt = new Date().toISOString();
    }

    static generarIdNumerico() {
        const base = Number(String(Date.now()).slice(-10));
        const rand = Math.floor(Math.random() * 90) + 10;
        const id = (base % 1e8) * 100 + rand;
        return id;
    }

    static hashContrasenia(plain) {
        return crypto.createHash('sha256').update(String(plain)).digest('hex');
    }

    setContrasenia(plain) {
        if (!Usuario.validarContrasenia(plain)) throw new Error('contrasenia invalida (6-15 caracteres)');
        this.contrasenia = Usuario.hashContrasenia(plain);
    }

    verificarContrasenia(plain) {
        return Usuario.hashContrasenia(plain) === this.contrasenia;
    }

    static validarEmail(email) {
        if (typeof email !== 'string') return false;
        const s = email.trim();
        if (s.length === 0 || s.length > 40) return false;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.toLowerCase());
    }

    static validarNomUsuario(nom) {
        if (typeof nom !== 'string') return false;
        const s = nom.trim();
        return s.length > 0 && s.length <= 25;
    }

    static validarContrasenia(c) {
        if (typeof c !== 'string') return false;
        const s = c.trim();
        return s.length >= 6 && s.length <= 15;
    }

    static validarTelf(t) {
        if (t === null || t === undefined) return true;
        if (typeof t !== 'string') return false;
        const s = t.trim();
        return s.length > 0 && s.length <= 15;
    }

    toObject(includeContrasenia = false) {
        const base = {
            idUsuario: this.idUsuario,
            nomUsuario: this.nomUsuario,
            email: this.email,
            telf: this.telf,
            createdAt: this.createdAt,
        };
        if (includeContrasenia) base.contrasenia = this.contrasenia;
        return base;
    }

    toJSON() {
        return this.toObject(false);
    }

    static fromObject(obj = {}) {
        if (!obj) throw new Error('obj requerido');

        const id = obj.idUsuario != null ? obj.idUsuario : (obj.id != null ? obj.id : null);
        const nom = obj.nomUsuario || obj.nom || obj.username;
        const email = obj.email;
        const telf = obj.telf !== undefined ? obj.telf : (obj.telefono || null);

        const rawPassword = obj.contrasenia || obj.password || '';
        const isHash = /^[a-f0-9]{64}$/i.test(String(rawPassword));
        const contraseniaBase = isHash ? 'temporal123' : rawPassword || 'temporal123';

        const usuario = new Usuario({
            idUsuario: id,
            nomUsuario: nom,
            contrasenia: contraseniaBase,
            email,
            telf,
        });

        if (isHash) {
            usuario.contrasenia = String(rawPassword);
        } else if (!rawPassword) {
            usuario.contrasenia = Usuario.hashContrasenia('temporal123');
        }

        return usuario;
    }
}

module.exports = Usuario;
