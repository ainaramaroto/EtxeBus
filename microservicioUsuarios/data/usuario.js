const crypto = require('crypto');

class Usuario {
    /**
     * Campos según el modelo:
     * - idUsuario    integer(10) PK (se genera si no se pasa)
     * - nomUsuario   varchar(25) NOT NULL
     * - email        varchar(40) NOT NULL
     * - contrasenia  varchar(15) NOT NULL (en esta implementación se guarda hasheada => se recomienda ampliar campo en BD)
     * - telf         varchar(15) NULL
     *
     * @param {Object} opts
     * @param {number|string} [opts.idUsuario]
     * @param {string} opts.nomUsuario
     * @param {string} opts.contrasenia - texto plano (se guardará hasheada)
     * @param {string} opts.email
     * @param {string} [opts.telf]
     */
    constructor({ idUsuario = null, nomUsuario, contrasenia, email, telf = null } = {}) {
        if (!nomUsuario) throw new Error('nomUsuario requerido');
        if (!contrasenia) throw new Error('contrasenia requerida');
        if (!email) throw new Error('email requerido');

        if (!Usuario.validarNomUsuario(nomUsuario)) throw new Error('nomUsuario inválido (max 25 caracteres)');
        if (!Usuario.validarContrasenia(contrasenia)) throw new Error('contrasenia inválida (6-15 caracteres)');
        if (!Usuario.validarEmail(email)) throw new Error('email inválido');
        if (telf !== null && !Usuario.validarTelf(telf)) throw new Error('telf inválido (max 15 caracteres)');

        this.idUsuario = idUsuario != null ? Number(idUsuario) : Usuario.generarIdNumerico();
        this.nomUsuario = String(nomUsuario).trim();
        this.contrasenia = Usuario.hashContrasenia(contrasenia);
        this.email = String(email).trim();
        this.telf = telf !== null ? String(telf).trim() : null;
        this.createdAt = new Date().toISOString();
    }

    // Genera un id numérico compatible con integer(10). No garantizo unicidad absoluta en cluster; ajustar según BD.
    static generarIdNumerico() {
        // toma los últimos 10 dígitos del timestamp y añade un componente aleatorio pequeño
        const base = Number(String(Date.now()).slice(-10));
        const rand = Math.floor(Math.random() * 90) + 10; // 10..99
        // asegurar que siga siendo <= 10 dígitos
        const id = (base % 1e8) * 100 + rand; // valor en rango < 1e10
        return id;
    }

    static hashContrasenia(plain) {
        return crypto.createHash('sha256').update(String(plain)).digest('hex');
    }

    setContrasenia(plain) {
        if (!Usuario.validarContrasenia(plain)) throw new Error('contrasenia inválida (6-15 caracteres)');
        this.contrasenia = Usuario.hashContrasenia(plain);
    }

    verificarContrasenia(plain) {
        return Usuario.hashContrasenia(plain) === this.contrasenia;
    }

    static validarEmail(email) {
        if (typeof email !== 'string') return false;
        const s = String(email).trim();
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
        const s = c;
        return s.length >= 6 && s.length <= 15;
    }

    static validarTelf(t) {
        if (t === null || t === undefined) return true;
        if (typeof t !== 'string') return false;
        return t.trim().length > 0 && t.trim().length <= 15;
    }

    toObject(includeContrasenia = false) {
        const base = {
            idUsuario: this.idUsuario,
            nomUsuario: this.nomUsuario,
            email: this.email,
            telf: this.telf,
            createdAt: this.createdAt
        };
        if (includeContrasenia) base.contrasenia = this.contrasenia;
        return base;
    }

    toJSON() {
        // por defecto no incluimos la contrasenia
        return this.toObject(false);
    }

    /**
     * Construye un Usuario a partir de un objeto (por ejemplo registro BD).
     * Si el campo contrasenia parece ser un hash (hex 64 chars), se conserva tal cual.
     */
    static fromObject(obj = {}) {
        if (!obj) throw new Error('obj requerido');

        const id = obj.idUsuario != null ? obj.idUsuario : (obj.id != null ? obj.id : null);
        const nom = obj.nomUsuario || obj.nom || obj.username;
        const email = obj.email;
        const telf = obj.telf !== undefined ? obj.telf : (obj.telefono || null);

        // si contrasenia es hash de 64 hex chars, lo usamos como "contrasenia" al construir y evitamos doble-hash
        const contr = obj.contrasenia || obj.password || '';
        const u = new Usuario({
            idUsuario: id,
            nomUsuario: nom,
            contrasenia: contr || 'temporal123', // si viene vacío, forzamos valor para constructor; se reemplazará abajo si procede
            email,
            telf
        });

        if (obj.contrasenia && /^[a-f0-9]{64}$/i.test(String(obj.contrasenia))) {
            u.contrasenia = String(obj.contrasenia);
        } else if (obj.password && /^[a-f0-9]{64}$/i.test(String(obj.password))) {
            u.contrasenia = String(obj.password);
        } else if (obj.contrasenia && !/^[a-f0-9]{64}$/i.test(String(obj.contrasenia))) {
            // si se pasó la contraseña en texto plano, re-hashearla correctamente
            u.contrasenia = Usuario.hashContrasenia(String(obj.contrasenia));
        }

        return u;
    }
}

module.exports = Usuario;