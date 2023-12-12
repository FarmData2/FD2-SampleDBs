describe("Generate the farmOS API keys", () => {
  it("Generate the keys", () => {
    cy.login("admin", "admin");
    cy.visit("admin/config/people/simple_oauth");

    cy.get("#edit-keys").click();
    cy.get("#dir_path").clear();
    cy.get("#dir_path").type("../keys");

    cy.get("[value='Generate']").click();
  });
});
