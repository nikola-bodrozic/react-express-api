/// <reference types="cypress" />
describe("Toggle Test", () => {
    const baseURL = "http://localhost";
    const apiBaseURL = `${baseURL}:4000/api/v1`;
    const reactBaseURL = `${baseURL}:5173/`

    beforeEach(() => {
        cy.visit(reactBaseURL + "slider");

        cy.intercept('GET', `${apiBaseURL}/slider`, {
            statusCode: 200,
            body: { america: false, asia: false }
        }).as('getInitialState');

        cy.intercept('PUT', `${apiBaseURL}/slider`, {
            statusCode: 200,
            body: { success: true }
        }).as('saveState');
    });

    it('should show loading state initially', () => {
        cy.get('.loading').should('be.visible');
        cy.get('.loading').contains('Loading slider states');
    });

    it('should render toggles with initial state', () => {
        cy.get('#world .slider').should('have.class', 'slider-off');
        cy.get('#america .slider').should('have.class', 'slider-off');
        cy.get('#asia .slider').should('have.class', 'slider-off');
    });

    it('should toggle all sliders when parent is clicked', () => {
        cy.get('#world').click();
        cy.get('@saveState').should('have.property', 'response');

        cy.get('#world .slider').should('have.class', 'slider-on');
        cy.get('#america .slider').should('have.class', 'slider-on');
        cy.get('#asia .slider').should('have.class', 'slider-on');

        cy.get('@saveState').its('request.body').should('deep.equal', {
            america: true,
            asia: true
        });
    });

    it('should toggle individual sliders', () => {
        cy.get('#america').click();
        cy.get('@saveState').its('request.body').should('deep.equal', {
            america: true,
            asia: false
        });

        cy.get('#asia').click();
        cy.get('@saveState').its('request.body').should('deep.equal', {
            america: true,
            asia: true
        });
    });


    it('should sync parent toggle when all children are toggled', () => {
        cy.get('#america').click();
        cy.get('#world .slider').should('have.class', 'slider-off');

        cy.get('#asia').click();
        cy.get('#world .slider').should('have.class', 'slider-on');
    });
});