describe('Login Test', () => {
  it('should log in with valid credentials', () => {
    
    cy.visit('http://localhost:5173/')

    cy.get('#about').click()
    cy.url().should('include', '/about')

    cy.get('#dashboard').click()
    cy.url().should('include', '/login')
    cy.get('input[name="username"]').type('username1')
    cy.get('input[name="password"]').type('pass1')
    cy.get('button[type="submit"]').click()
    cy.wait(1000)

    cy.url().should('include', '/dashboard')
    cy.get('#name-holder').should('contain', 'Hello Name 1')
    cy.get('#msg').should('contain', 'welcome to dasboard')
  })

})

