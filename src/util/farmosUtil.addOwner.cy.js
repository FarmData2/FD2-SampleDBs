import * as farmosUtil from "../util/farmosUtil.js";

describe("Test the addOwner function", () => {
  var farm = null;
  before(async () => {
    farm = await farmosUtil.getFarmOSInstance(
      "http://farmos",
      "farm",
      "admin",
      "admin"
    );
  });

  beforeEach(() => {
    cy.restoreLocalStorage();
  });

  afterEach(() => {
    cy.saveLocalStorage();
  });

  it("Add owner to object w/o relationships.owner", async () => {
    const usernameMap = await farmosUtil.getUsernameToUserMap(farm);

    const quantity = farm.log.create({ type: "quantity--standard" });

    let error = false;
    try {
      const obj = farmosUtil.addOwnerRelationship(
        quantity,
        usernameMap.get("manager1").id
      );
    } catch (e) {
      error = e instanceof ReferenceError;
    }

    expect(error).to.be.true;
  });

  it("Add 1 owner to object with relationships.owner", async () => {
    const usernameMap = await farmosUtil.getUsernameToUserMap(farm);

    const field = farm.asset.create({ type: "asset--land" });
    const obj = farmosUtil.addOwnerRelationship(
      field,
      usernameMap.get("manager1").id
    );

    expect(obj).to.equal(field);
    expect(obj.relationships.owner.length).to.equal(1);
    expect(obj.relationships.owner[0].id).to.equal(usernameMap.get("manager1").id);
  });

  it("Add 2 owners to object with relationships.owner", async () => {
    const usernameMap = await farmosUtil.getUsernameToUserMap(farm);

    const field = farm.asset.create({ type: "asset--land" });
    const obj1 = farmosUtil.addOwnerRelationship(
      field,
      usernameMap.get("manager1").id
    );
    const obj2 = farmosUtil.addOwnerRelationship(
      field,
      usernameMap.get("manager2").id
    );

    expect(obj1).to.equal(field);
    expect(obj2).to.equal(obj1);

    expect(field.relationships.owner.length).to.equal(2);

    expect(field.relationships.owner[0].id).to.equal(usernameMap.get("manager1").id);
    expect(field.relationships.owner[1].id).to.equal(usernameMap.get("manager2").id);
  });
});
