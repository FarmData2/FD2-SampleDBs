// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

/**
 * This command will log into farmOS if we are currently connecting to it.
 * That is if the tests are running with a base url of http://farmos then
 * the user is logged in.  If the test are running with any other base url
 * then no login is performed.
 */
Cypress.Commands.add('login', (user, password) => {
  let baseURL = Cypress.config().baseUrl
  if (baseURL.includes('http://farmos')) {
    cy.request({
      method: 'POST',
      url: '/user/login',
      form: true,
      body: {
        name: user,
        pass: password,
        form_id: 'user_login_form',
      },
    })
  }
})

/**
 * Cypress clears the local storage between tests.  This work around
 * can be used to copy the local storage at the end of each test 
 * (i.e. in an afterEach) and then restore it at the start of the 
 * the next test (i.e. in a beforeEach).
 * 
 * This work around was created by Michal Pietraszko (pietmichal on GitHub):
 * https://github.com/cypress-io/cypress/issues/461#issuecomment-392070888
 */
let LOCAL_STORAGE_MEMORY = {};

Cypress.Commands.add("saveLocalStorage", () => {
  Object.keys(localStorage).forEach(key => {
    LOCAL_STORAGE_MEMORY[key] = localStorage[key];
  });
});

Cypress.Commands.add("restoreLocalStorage", () => {
  Object.keys(LOCAL_STORAGE_MEMORY).forEach(key => {
    localStorage.setItem(key, LOCAL_STORAGE_MEMORY[key]);
  });
});