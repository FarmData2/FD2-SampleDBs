describe('Configure the new farmOS instance.', () => {

  it('Setup Database', () => {
    cy.visit('http://farmos/core/install.php')

    cy.get('#edit-driver-pgsql').click()
    cy.get('#edit-pgsql-database').type('farm')
    cy.get('#edit-pgsql-username').type('farm')
    cy.get('#edit-pgsql-password').type('farm')

    cy.get('#edit-pgsql--2 > .claro-details__summary').click()
    cy.get('#edit-pgsql-host').clear().type('db')

    cy.get('#edit-save').click()
  })

  it('Configure Site', () => {
    cy.visit('http://farmos/core/install.php')

    cy.get('#edit-site-name').type('test farm')
    cy.get('#edit-site-mail').type('test@no.such.farm.org')
    cy.get('#edit-account-name').type('admin')
    cy.get('#edit-account-pass-pass1').type('admin')
    cy.get('#edit-account-pass-pass2').type('admin')
    cy.get('#edit-site-default-country').select('United States')
    cy.get('#edit-enable-update-status-emails').click()
    cy.get('#edit-submit').click()
  })

  it('Enable Modules', () => {
    cy.visit('http://farmos/core/install.php')

    cy.get('#edit-submit').click()

    // Wait a good long time here for the modules to install.
    cy.get('.page-title', {timeout: 5*60000}).should('have.text', 'Dashboard')
  })
})