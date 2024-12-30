describe('Login Test', () => {
  it('should log in with valid credentials', () => {
    cy.intercept('POST', 'http://localhost:4000/api/v1/login', (req) => {
    }).as('postData');

    cy.visit('http://localhost:5173/')

    cy.get('#about').click()
    cy.url().should('include', '/about')

    cy.get('#dashboard').click()
    cy.url().should('include', '/login')
    cy.get('input[name="username"]').type('username1')
    cy.get('input[name="password"]').type('pass1')
    cy.get('button[type="submit"]').click()
    cy.wait('@postData').then((interception) => {
      cy.get('#loader').should('be.visible');
      expect(interception.response.statusCode).to.equal(200);
    });
    cy.url().should('include', '/dashboard')
    cy.get('#msg').should('contain', 'welcome to dasboard')
  })
})

