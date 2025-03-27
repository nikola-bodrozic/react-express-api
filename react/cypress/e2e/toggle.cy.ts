/// <reference types="cypress" />
describe("Toggle Test", () => {
    const baseURL = "http://localhost";
    const apiBaseURL = `${baseURL}:4000/api/v1`;
    const reactBaseURL = `${baseURL}:5173/`

    before(() => {
        // load fixturess
        cy.fixture("mock").then(data => this.data = data)
    })

    beforeEach(() => {
        cy.visit(reactBaseURL + "slider");
    });

    describe('Parent Toggle Functionality', () => {
        it('should toggle all switches when parent is clicked', () => {
            // Toggle parent on
            cy.get('#world').click();
            cy.get('.slider-on').should('have.length', 3);

            // Toggle parent off
            cy.get('#world').click();
            cy.get('.slider-off').should('have.length', 3);
        });
    });

    describe('Child Toggle Functionality', () => {
        it('should toggle individual child switches', () => {
            // Toggle America
            cy.get('#america').click();
            cy.contains('.toggle-label', 'America')
                .prev()
                .find('.slider')
                .should('have.class', 'slider-on');

            // Parent should remain off
            cy.contains('.toggle-label', 'World News')
                .prev()
                .find('.slider')
                .should('have.class', 'slider-off');
        });

        it('should set parent to off when any child is off', () => {
            // Turn all on
            cy.contains('.toggle-label', 'World News').parent().click();

            // Turn America off
            cy.contains('.toggle-label', 'America').parent().click();

            // Verify parent is off
            cy.contains('.toggle-label', 'World News')
                .prev()
                .find('.slider')
                .should('have.class', 'slider-off');
        });

        it('should only set parent to on when all children are on', () => {
            // Turn America on
            cy.get('#america').click();

            // Parent should still be off
            cy.contains('.toggle-label', 'World News')
                .prev()
                .find('.slider')
                .should('have.class', 'slider-off');

            // Turn Asia on
            cy.get('#asia').click();

            // Now parent should be on
            cy.contains('.toggle-label', 'World News')
                .prev()
                .find('.slider')
                .should('have.class', 'slider-on');
        });
    });
});