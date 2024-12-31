/// <reference types="cypress" />
describe("Login Test", () => {
  const apiBaseURL = "http://localhost:4000/api/v1";
  const reactBaseURL = "http://localhost:5173/";
  beforeEach(() => {
    cy.visit(reactBaseURL);
    cy.get("#about").click();
    cy.url().should("include", "/about");
    cy.get("#dashboard").click();
    cy.url().should("include", "/login");
  });

  it("should log in with valid credentials", () => {
    cy.intercept("POST", `${apiBaseURL}/login`).as("postData");

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

  it("should get error message when entering invalid credentials shorter tham 5 chars", () => {
    cy.intercept("POST", `${apiBaseURL}/login`, {
      statusCode: 422,
      body: {
        errors: [
          {
            msg: "test Username must be at least 5 characters long",
          },
          {
            msg: "test Password must be at least 5 characters long",
          },
        ],
      },
    }).as("postData");

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
    cy.get("#error .err-item")
      .first()
      .should("have.text", "test Username must be at least 5 characters long");
    cy.get("#error .err-item")
      .eq(1)
      .should("have.text", "test Password must be at least 5 characters long");
  });

  it("should get error message when entering invalid credentials", () => {
    cy.intercept("POST", `${apiBaseURL}/login`, {
      statusCode: 422,
      body: {
        errors: [
          {
            msg: "test bad username/password",
          },
        ],
      },
    }).as("postData");

    cy.get('input[name="username"]').type("wrong-username");
    cy.get('input[name="password"]').type("wrong-password");
    cy.get('button[type="submit"]').click();
    cy.get("#loader").should("be.visible");
    cy.wait("@postData").then((interception) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      interception.response &&
        expect(interception.response.statusCode).to.equal(422);
      cy.get("#loader").should("not.exist");
    });
    cy.get("#error").children().should("have.length.greaterThan", 0);
    cy.get("#error .err-item")
      .first()
      .should("have.text", "test bad username/password");
  });
});
