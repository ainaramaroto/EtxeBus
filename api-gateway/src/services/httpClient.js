const axios = require('axios');

function createHttpClient({ baseURL, timeout }) {
  const instance = axios.create({
    baseURL,
    timeout,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response) {
        const wrapped = new Error(
          error.response.data?.message ||
            error.response.data?.error ||
            'Error recibido del microservicio'
        );
        wrapped.status = error.response.status;
        wrapped.details = error.response.data;
        throw wrapped;
      }

      if (error.request) {
        const wrapped = new Error('No se obtuvo respuesta del microservicio');
        wrapped.status = 504;
        throw wrapped;
      }

      throw error;
    }
  );

  return instance;
}

module.exports = createHttpClient;
