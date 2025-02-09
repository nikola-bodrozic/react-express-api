/// <reference types="cypress" />
describe("Login Test", () => {
  const baseURL = "http://localhost";
  const apiBaseURL = `${baseURL}:4000/api/v1`;
  const reactBaseURL = `${baseURL}:5173/`

  beforeEach(() => {
    cy.visit(reactBaseURL);
  });

  afterEach(() => {
    cy.wait(2000);
  });

  it("should log in with valid credentials and show dasboard", () => {
    cy.intercept("POST", `${apiBaseURL}/login`).as("postLoginData");
    cy.intercept("GET", `${apiBaseURL}/dashboard`).as("getDashData");
    
    cy.get("#about").click();
    cy.url().should("include", "/about");
    cy.get("#dashboard").click();
    cy.url().should("include", "/login");
    cy.get('input[name="username"]').type("username1");
    cy.get('input[name="password"]').type("password123");
    cy.get('button[type="submit"]').click();
    cy.get("#loader").should("be.visible");
    cy.wait("@postLoginData");
    cy.url().should("include", "/dashboard");
    cy.get("#loader").should("not.exist");
    cy.get("#dashLoader").should("contain.text", "Loading...");
    cy.wait("@getDashData")
    cy.get("#msg").should("contain.text", "welcome to dashboard");
    cy.get(".pieHolder").should("exist");
    cy.get(".pieHolder").should("have.length.above", 1);
    cy.get("#dashLoader").should("not.exist");
    cy.wait(4000)
    cy.get("#logout").click();
    cy.get(".pieHolder").should("not.exist");
    cy.url().should("include", "/");
    cy.get("#login").should("contain.text", "Login");
  });
});
