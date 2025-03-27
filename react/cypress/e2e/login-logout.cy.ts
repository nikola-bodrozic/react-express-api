/// <reference types="cypress" />
describe("Login Test", () => {
  const baseURL = "http://localhost";
  const apiBaseURL = `${baseURL}:4000/api/v1`;
  const reactBaseURL = `${baseURL}:5173/`

  before(() => {
    // load fixturess
    cy.fixture("mock").then(data => this.data = data)
  })

  beforeEach(() => {
    cy.visit(reactBaseURL);
  });

  afterEach(() => {
    cy.wait(2000);
  });

  it("should log in with valid credentials and show dasboard", () => {
    cy.intercept("POST", `${apiBaseURL}/login`, this.data.loginInfo).as("postLoginData");
    cy.intercept("GET", `${apiBaseURL}/dashboard`, this.data.dashBoardInfo).as("getDashData");
    cy.intercept('POST', '/api/v1/logout', {
      statusCode: 200,
      body: { message: 'Logout successful' }
    }).as('logout');

    cy.get("#dashboard").click();
    cy.url().should("include", "/login");
    cy.get('input[name="username"]').type("testuser");
    cy.get('input[name="password"]').type(Cypress.env('password'), {log: false})
    cy.get('button[type="submit"]').click();
    cy.get("#loader").should("be.visible");
    cy.wait("@postLoginData");
    cy.url().should("include", "/dashboard");
    cy.get("#loader").should("not.exist");
    cy.get("#dashLoader").should("contain.text", "Loading...");
    cy.wait("@getDashData");
    cy.get("#msg").should("contain.text", this.data.dashBoardInfo.body.message);
    console.log(this.data.loginInfo.body.user.username)
    cy.get(".pieHolder").should("exist");
    cy.get(".pieHolder").should("have.length", this.data.dashBoardInfo.body.pieDataArr.length);
    cy.wait(2000)
    cy.get('#logout').click();
    cy.wait('@logout').its('response.statusCode').should('eq', 200);
    cy.url().should('include', '/');
    cy.get('h2').should('be.visible');
    cy.get("h2").should("contain.text","Home");
  });

  it("should get error message when entering invalid credentials shorter tham 5 chars", () => {
    cy.intercept("POST", `${apiBaseURL}/login`, {
      statusCode: 401,
      body: this.data.shortCreds,
    }).as("postLoginData");
    cy.get("#dashboard").click();
    cy.url().should("include", "/login");
    cy.get('input[name="username"]').type("u1");
    cy.get('input[name="password"]').type("p1");
    cy.get('button[type="submit"]').click();
    cy.get("#loader").should("be.visible");
    cy.wait("@postLoginData");
    cy.get("#loader").should("not.exist");
    cy.get("#error").children().should("have.length.greaterThan", 0);
    // first child
    cy.get("#error .err-item")
      .first()
      .should("have.text", this.data.shortCreds.errors[0].msg);
    // n-th child  
    cy.get("#error .err-item")
      .eq(1)
      .should("have.text", this.data.shortCreds.errors[1].msg);
  });

  it("should get error message when entering invalid credentials", () => {
    cy.intercept("POST", `${apiBaseURL}/login`, {
      statusCode: 422,
      body: this.data.badCreds,
    }).as("postLoginData");
    cy.get("#dashboard").click();
    cy.url().should("include", "/login");
    cy.get('input[name="username"]').type("wrong-username");
    cy.get('input[name="password"]').type("wrong-password");
    cy.get('button[type="submit"]').click();
    cy.get("#loader").should("be.visible");
    cy.wait("@postLoginData");
    cy.get("#loader").should("not.exist");
    cy.get("#error").children().should("have.length.greaterThan", 0);
    cy.get("#error .err-item")
      .first()
      .should("have.text", this.data.badCreds.errors[0].msg);
  });
});
