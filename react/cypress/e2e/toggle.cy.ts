/// <reference types="cypress" />
describe("Toggle Test", () => {
    const baseURL = "http://localhost";
    const reactBaseURL = `${baseURL}:5173/`

    beforeEach(() => {
        cy.visit(reactBaseURL + "slider");
    });

    it('should initialize with all toggles in off state', () => {
        cy.get('#world .slider').should('have.class', 'slider-off');
        cy.get('#america .slider').should('have.class', 'slider-off');
        cy.get('#asia .slider').should('have.class', 'slider-off');
    });

    it('should toggle all switches when parent is clicked', () => {
        // Toggle parent on
        cy.get('#world').click();
        cy.get('#world .slider').should('have.class', 'slider-on');
        cy.get('#america .slider').should('have.class', 'slider-on');
        cy.get('#asia .slider').should('have.class', 'slider-on');

        // Toggle parent off
        cy.get('#world').click();
        cy.get('#world .slider').should('have.class', 'slider-off');
        cy.get('#america .slider').should('have.class', 'slider-off');
        cy.get('#asia .slider').should('have.class', 'slider-off');
    });

    it('should toggle individual child switches independently', () => {
        // Toggle America
        cy.get('#america').click();
        cy.get('#america .slider').should('have.class', 'slider-on');
        // Verify others remain unchanged
        cy.get('#world .slider').should('have.class', 'slider-off');
        cy.get('#asia .slider').should('have.class', 'slider-off');

        // Toggle Asia
        cy.get('#asia').click();
        cy.get('#asia .slider').should('have.class', 'slider-on');
    });

    it('should set parent to off when any child is off', () => {
        // Turn all on via parent
        cy.get('#world').click();

        // Turn America off
        cy.get('#america').click();

        // Verify parent is off
        cy.get('#world .slider').should('have.class', 'slider-off');
        // Asia should remain on
        cy.get('#asia .slider').should('have.class', 'slider-on');
    });

    it('should only set parent to on when all children are on', () => {
        // Turn America on
        cy.get('#america').click();
        cy.get('#world .slider').should('have.class', 'slider-off');

        // Turn Asia on
        cy.get('#asia').click();
        cy.get('#world .slider').should('have.class', 'slider-on');
    });
});