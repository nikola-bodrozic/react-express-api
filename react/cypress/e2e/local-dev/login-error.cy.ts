describe('Login Test', () => {
  it('should log in with valid credentials', () => {
    
    cy.visit('http://localhost:5173/')

    cy.get('#about').click()
    cy.url().should('include', '/about')

    cy.get('#dashboard').click()
    cy.url().should('include', '/login')
    cy.get('input[name="username"]').type('u1')
    cy.get('input[name="password"]').type('p1')
    cy.get('button[type="submit"]').click()
    cy.get('#loader').should('be.visible');
    cy.wait(1000)
    cy.get('#error').children().should('have.length.greaterThan', 0);
  })
})

