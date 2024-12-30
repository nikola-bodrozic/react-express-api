/// <reference types="cypress" />
describe("Login Test", () => {
  beforeEach(() => {
    cy.visit("http://localhost:5173/");
    cy.get("#about").click();
    cy.url().should("include", "/about");
    cy.get("#dashboard").click();
    cy.url().should("include", "/login");
  });

  it("should get error message when entering invalid credentials", () => {
    cy.intercept("POST", "http://localhost:4000/api/v1/login").as("postData");

    cy.get('input[name="username"]').type("u1");
    cy.get('input[name="password"]').type("p1");
    cy.get('button[type="submit"]').click();
    cy.get("#loader").should("be.visible");
    cy.wait("@postData").then((interception) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      interception.response &&
        expect(interception.response.statusCode).to.equal(422);
      cy.get("#loader").should("not.exist");
    });
    cy.get("#error").children().should("have.length.greaterThan", 0);
  });

  it("should log in with valid credentials", () => {
    cy.intercept("POST", "http://localhost:4000/api/v1/login").as("postData");

    cy.get('input[name="username"]').type("username1");
    cy.get('input[name="password"]').type("pass1");
    cy.get('button[type="submit"]').click();
    cy.get("#loader").should("be.visible");
    cy.wait("@postData").then((interception) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      interception.response &&
        expect(interception.response.statusCode).to.equal(200);
      cy.get("#loader").should("not.exist");
    });
    cy.url().should("include", "/dashboard");
    cy.get("#msg").should("contain", "welcome to dasboard");
  });
});
