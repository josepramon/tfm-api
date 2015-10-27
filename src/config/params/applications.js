module.exports = {
  /**
   * Applications with access to the API
   *
   * The key is the application ID.
   * Defines wich roles have access to that applications.
   * (This is used mostly to prevent regular users login in in the admins app
   * and viceversa. Anyway, this is mostly for usability reasons (not for
   * security ones) because once logged, any API request provably will return an
   * error because each API endpoint has privileges checks).
   *
   * @type {Object}
   */
  applications: {
    usersAPP: {
      allowedRoles: ['USER']
    },

    adminsAPP: {
      allowedRoles: ['ADMIN', 'MANAGER']
    }
  }
};
