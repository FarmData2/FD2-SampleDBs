import * as farmosUtil from "../util/farmosUtil.js";

describe("Test the land utility functions", () => {
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

  it("Get the field and bed land assets", async () => {
    const land = await farmosUtil.getFieldsAndBeds(farm);
    expect(land).to.not.be.null;
    expect(land.length).to.equal(65);

    expect(land[0].attributes.name).to.equal("A");
    expect(land[0].type).to.equal("asset--land")

    expect(land[64].attributes.name).to.equal("Z");
    expect(land[64].type).to.equal("asset--land")
  });

  it("Get the FieldOrBedNameToAsset map", async () => {
    const landNameMap = await farmosUtil.getFieldOrBedNameToAssetMap(farm);
    expect(landNameMap).to.not.be.null;
    expect(landNameMap.size).to.equal(65);

    expect(landNameMap.get("A")).to.not.be.null;
    expect(landNameMap.get("A").type).to.equal("asset--land")

    expect(landNameMap.get("Z")).to.not.be.null;
    expect(landNameMap.get("Z").type).to.equal("asset--land")

    expect(landNameMap.get("CHUAU-1")).to.not.be.null;
    expect(landNameMap.get("CHUAU-1").type).to.equal("asset--land")

    expect(landNameMap.get("CHUAU")).to.be.undefined;
  });

  it("Get the FieldOrBedIdToAsset map", async () => {
    const landIdMap = await farmosUtil.getFieldOrBedIdToAssetMap(farm);
    expect(landIdMap).to.not.be.null;
    expect(landIdMap.size).to.equal(65);

    const landNameMap = await farmosUtil.getFieldOrBedNameToAssetMap(farm);

    const landAId = landNameMap.get("A").id;
    expect(landIdMap.get(landAId).attributes.name).to.equal("A");
    expect(landIdMap.get(landAId).type).to.equal("asset--land")

    const landChuau1Id = landNameMap.get("CHUAU-1").id;
    expect(landIdMap.get(landChuau1Id).attributes.name).to.equal("CHUAU-1");
    expect(landIdMap.get(landChuau1Id).type).to.equal("asset--land")
  });

  it("Get the greenhouse structure assets", async () => {
    const gh = await farmosUtil.getGreenhouses(farm);
    expect(gh).to.not.be.null;
    expect(gh.length).to.equal(5);

    expect(gh[0].attributes.name).to.equal("CHUAU");
    expect(gh[0].type).to.equal("asset--structure")

    expect(gh[4].attributes.name).to.equal("SEEDING BENCH");
    expect(gh[4].type).to.equal("asset--structure")
  });

  it("Get the GreenhouseNameToAsset map", async () => {
    const ghNameMap = await farmosUtil.getGreenhouseNameToAssetMap(farm);
    expect(ghNameMap).to.not.be.null;
    expect(ghNameMap.size).to.equal(5);

    expect(ghNameMap.get("CHUAU")).to.not.be.null;
    expect(ghNameMap.get("CHUAU").type).to.equal("asset--structure")

    expect(ghNameMap.get("SEEDING BENCH")).to.not.be.null;
    expect(ghNameMap.get("SEEDING BENCH").type).to.equal("asset--structure")

    expect(ghNameMap.get("A")).to.be.undefined;
  });

  it("Get the GreenhouseIdToAsset map", async () => {
    const ghIdMap = await farmosUtil.getGreenhouseIdToAssetMap(farm);
    expect(ghIdMap).to.not.be.null;
    expect(ghIdMap.size).to.equal(5);

    const ghNameMap = await farmosUtil.getGreenhouseNameToAssetMap(farm);

    const chuauId = ghNameMap.get("CHUAU").id;
    expect(ghIdMap.get(chuauId).attributes.name).to.equal("CHUAU");
    expect(ghIdMap.get(chuauId).type).to.equal("asset--structure")

    const sbId = ghNameMap.get("SEEDING BENCH").id;
    expect(ghIdMap.get(sbId).attributes.name).to.equal("SEEDING BENCH");
    expect(ghIdMap.get(sbId).type).to.equal("asset--structure")
  });

});
