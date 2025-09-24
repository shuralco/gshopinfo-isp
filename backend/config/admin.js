module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', 'defaultSecret123456789'),
  },
  apiToken: {
    salt: env('API_TOKEN_SALT', 'defaultSalt123456789'),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT', 'defaultTransferSalt123456789'),
    },
  },
});