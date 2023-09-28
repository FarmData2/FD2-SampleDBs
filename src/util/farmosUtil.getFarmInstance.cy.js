import * as farmosUtil from "../util/farmosUtil.js";

describe('Test getFarmOSInstance', () => {

  var farm = null;
  before(async () => {
    farm = await farmosUtil.getFarmOSInstance('http://farmos','farm','admin','admin')
  });

  beforeEach(() => {
    cy.restoreLocalStorage()
  });

  afterEach(() => {
    cy.saveLocalStorage();  
  });

  it('Get a farm instance', () => {
    expect(farm).to.not.be.null
    expect(farm.remote.getToken()).to.not.be.null
    expect(farm.schema.get()).to.not.be.null
  });

  it('Check farmOS instance content', async () => {
    expect(farm).to.not.be.null

    const resp = await farm.remote.info()
    
    expect(resp.data.meta.farm).to.not.be.null    
    expect(resp.data.meta.farm.name).to.equal('Sample Farm')
    expect(resp.data.meta.farm.version).to.equal('2.x')

  });
});