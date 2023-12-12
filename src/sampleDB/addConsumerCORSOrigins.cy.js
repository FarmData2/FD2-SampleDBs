describe("Add CORS origins to the farm consumer", () => {
  it("Add CORS origins", () => {
    cy.login("admin", "admin");
    cy.visit(
      "admin/config/services/consumer/34/edit?destination=/admin/config/services/consumer"
    );
    cy.get("#edit-allowed-origins-0-value").clear();
    cy.get("#edit-allowed-origins-0-value").type("http://localhost:5173");
    cy.get("#edit-submit").click();
    cy.visit(
      "admin/config/services/consumer/34/edit?destination=/admin/config/services/consumer"
    );

    cy.get("#edit-allowed-origins-1-value").clear();
    cy.get("#edit-allowed-origins-1-value").type("http://localhost:5174");
    cy.get("#edit-submit").click();
    cy.visit(
      "admin/config/services/consumer/34/edit?destination=/admin/config/services/consumer"
    );

    cy.get("#edit-allowed-origins-2-value").clear();
    cy.get("#edit-allowed-origins-2-value").type("http://localhost:5175");
    cy.get("#edit-submit").click();
    cy.visit(
      "admin/config/services/consumer/34/edit?destination=/admin/config/services/consumer"
    );    
    
    cy.get("#edit-allowed-origins-3-value").clear();
    cy.get("#edit-allowed-origins-3-value").type("http://localhost:4173");
    cy.get("#edit-submit").click();
    cy.visit(
      "admin/config/services/consumer/34/edit?destination=/admin/config/services/consumer"
    );

    cy.get("#edit-allowed-origins-4-value").clear();
    cy.get("#edit-allowed-origins-4-value").type("http://localhost:4174");
    cy.get("#edit-submit").click();
    cy.visit(
      "admin/config/services/consumer/34/edit?destination=/admin/config/services/consumer"
    );

    cy.get("#edit-allowed-origins-5-value").clear();
    cy.get("#edit-allowed-origins-5-value").type("http://localhost:4175");
    cy.get("#edit-submit").click();
  });
});
