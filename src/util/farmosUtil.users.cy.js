import * as farmosUtil from "../util/farmosUtil.js";

describe('Test the user utility functions', () => {

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

  it('Get the users', async () => {
    const users = await farmosUtil.getUsers(farm)
    
    expect(users).to.not.be.null

    expect(users[0].attributes.name).to.equal("admin")
    expect(users[0].type).to.equal("user--user")

    expect(users[1].attributes.name).to.equal("guest")
    expect(users[1].type).to.equal("user--user")

    expect(users[2].attributes.name).to.equal("manager1")
    expect(users[2].type).to.equal("user--user")

    expect(users[4].attributes.name).to.equal("worker1")
    expect(users[4].type).to.equal("user--user")

    expect(users.length).to.equal(9)
  });

  it('Get the usernameMap', async () => {
    const usernameMap = await farmosUtil.getUsernameToUserMap(farm) 
    expect(usernameMap).to.not.be.null

    expect(usernameMap.get("Anonymous")).to.be.undefined

    expect(usernameMap.get("admin")).to.not.be.null
    expect(usernameMap.get("admin").id).to.not.be.null
    expect(usernameMap.get("admin").type).to.equal("user--user")

    expect(usernameMap.get("guest")).to.not.be.null
    expect(usernameMap.get("guest").id).to.not.be.null
    expect(usernameMap.get("guest").type).to.equal("user--user")

    expect(usernameMap.size).to.equal(9)
  })

  it('Get the useridMap', async () => {
    const userIdMap = await farmosUtil.getUserIdToUserMap(farm) 
    expect(userIdMap).to.not.be.null

    const usernameMap = await farmosUtil.getUsernameToUserMap(farm) 

    expect(usernameMap.get("Anonymous")).to.be.undefined

    const adminId = usernameMap.get("admin").id
    expect(userIdMap.get(adminId).attributes.display_name).to.equal("admin")
    expect(userIdMap.get(adminId).type).to.equal("user--user")
    
    const managerId = usernameMap.get("manager1").id
    expect(userIdMap.get(managerId).attributes.display_name).to.equal("manager1")
    expect(userIdMap.get(managerId).type).to.equal("user--user")

    const guestId = usernameMap.get("guest").id
    expect(userIdMap.get(guestId).attributes.display_name).to.equal("guest")
    expect(userIdMap.get(guestId).type).to.equal("user--user")

    expect(userIdMap.size).to.equal(9)
  })
})