const crypto = require('crypto');

class Preferencia {
    /**
     * @param {Object} opts
     * @param {string} [opts.idPreferencia] - id interno (si no se pasa se genera)
     * @param {number|string} opts.idUsuario - id del usuario (requerido)
     * @param {number|string} [opts.idParada] - id de la parada (opcional)
     * @param {number|string} [opts.idTrayecto] - id del trayecto (opcional)
     * @param {string} opts.tipo - tipo de preferencia (requerido, max 10 chars)
     */
    constructor({ idPreferencia = null, idUsuario, idParada = null, idTrayecto = null, tipo } = {}) {
        if (!idUsuario) throw new Error('idUsuario requerido');
        if (!tipo) throw new Error('tipo requerido');
        if (!Preferencia.validarTipo(tipo)) throw new Error('tipo inválido');

        this.idPreferencia = idPreferencia || Preferencia.generarId();
        this.idUsuario = idUsuario;
        this.idParada = idParada;
        this.idTrayecto = idTrayecto;
        this.tipo = String(tipo);
        this.createdAt = new Date().toISOString();
    }

    static generarId() {
        if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
        return `${Date.now().toString(36)}-${crypto.randomBytes(6).toString('hex')}`;
    }

    /**
     * Valida que el tipo sea una cadena no vacía y de longitud <= 10
     * (coincide con el esquema mostrado en la imagen)
     */
    static validarTipo(tipo) {
        if (typeof tipo !== 'string') return false;
        const t = tipo.trim();
        return t.length > 0 && t.length <= 10;
    }

    toObject() {
        return {
            idPreferencia: this.idPreferencia,
            idUsuario: this.idUsuario,
            idParada: this.idParada,
            idTrayecto: this.idTrayecto,
            tipo: this.tipo,
            createdAt: this.createdAt
        };
    }

    toJSON() {
        // mismo que toObject pero pensado para JSON.stringify
        return this.toObject();
    }

    /**
     * Crea una Preferencia a partir de un objeto plano (por ejemplo leído de BD)
     */
    static fromObject(obj = {}) {
        if (!obj) throw new Error('obj requerido');
        return new Preferencia({
            idPreferencia: obj.idPreferencia || obj.id || null,
            idUsuario: obj.idUsuario || obj.idUsuario === 0 ? obj.idUsuario : obj.idUsuario,
            idParada: obj.idParada !== undefined ? obj.idParada : null,
            idTrayecto: obj.idTrayecto !== undefined ? obj.idTrayecto : null,
            tipo: obj.tipo
        });
    }
}

module.exports = Preferencia;