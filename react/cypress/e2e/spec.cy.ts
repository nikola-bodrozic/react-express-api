describe('Login Test', () => {
  it('should log in with valid credentials', () => {
    // Visit the login page
    cy.visit('http://localhost:5173/')  // Replace with your app's login URL

    cy.get('#about').click()
    cy.url().should('include', '/about')

    cy.get('#login').click()
    cy.url().should('include', '/login')
    cy.get('input[name="username"]').type('username1')  // Replace with the actual selector and username
    cy.get('input[name="password"]').type('pass1')  // Replace with the actual selector and password
    cy.get('button[type="submit"]').click()
    cy.wait(1000)
    cy.url().should('include', '/dashboard')  // Replace with the expected URL after login
    cy.get('#name-holder').should('contain', 'Hello Name 1')
  })
})
