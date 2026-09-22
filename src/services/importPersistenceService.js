const { Agent, User, Account, Lob, Carrier, Policy } = require('../models');

function uniqueBy(rows, key) {
  return [...new Map(rows.map((row) => [row[key], row])).values()];
}

function idsBy(docs, key) {
  return new Map(docs.map((doc) => [doc[key], doc._id]));
}

function upsertOperation(filter, values) {
  return { updateOne: { filter, update: { $set: values }, upsert: true } };
}

async function upsertReferenceData(rows) {
  const agents = uniqueBy(rows, 'agentName');
  const users = uniqueBy(rows, 'userKey');
  const categories = uniqueBy(rows, 'categoryName');
  const companies = uniqueBy(rows, 'companyName');

  await Promise.all([
    Agent.bulkWrite(agents.map((row) => upsertOperation(
      { agentName: row.agentName },
      { agentName: row.agentName }
    )), { ordered: false }),
    User.bulkWrite(users.map((row) => upsertOperation(
      { userKey: row.userKey },
      {
        userKey: row.userKey,
        firstName: row.firstName,
        dob: row.dob,
        address: row.address,
        phoneNumber: row.phoneNumber,
        state: row.state,
        zipCode: row.zipCode,
        email: row.email || undefined,
        gender: row.gender,
        userType: row.userType
      }
    )), { ordered: false }),
    Lob.bulkWrite(categories.map((row) => upsertOperation(
      { categoryName: row.categoryName },
      { categoryName: row.categoryName }
    )), { ordered: false }),
    Carrier.bulkWrite(companies.map((row) => upsertOperation(
      { companyName: row.companyName },
      { companyName: row.companyName }
    )), { ordered: false })
  ]);
}

async function loadReferenceIds(rows) {
  const [agents, users, categories, companies] = await Promise.all([
    Agent.find({ agentName: { $in: [...new Set(rows.map((row) => row.agentName))] } }, '_id agentName').lean(),
    User.find({ userKey: { $in: [...new Set(rows.map((row) => row.userKey))] } }, '_id userKey').lean(),
    Lob.find({ categoryName: { $in: [...new Set(rows.map((row) => row.categoryName))] } }, '_id categoryName').lean(),
    Carrier.find({ companyName: { $in: [...new Set(rows.map((row) => row.companyName))] } }, '_id companyName').lean()
  ]);

  return {
    agentIds: idsBy(agents, 'agentName'),
    userIds: idsBy(users, 'userKey'),
    categoryIds: idsBy(categories, 'categoryName'),
    companyIds: idsBy(companies, 'companyName')
  };
}

async function importRows(rows) {
  await upsertReferenceData(rows);
  const references = await loadReferenceIds(rows);
  const { agentIds, userIds, categoryIds, companyIds } = references;

  const accounts = uniqueBy(rows, 'accountKey');
  await Account.bulkWrite(accounts.map((row) => upsertOperation(
    { accountKey: row.accountKey },
    { accountKey: row.accountKey, accountName: row.accountName, user: userIds.get(row.userKey) }
  )), { ordered: false });

  const accountDocuments = await Account.find(
    { accountKey: { $in: accounts.map((row) => row.accountKey) } },
    '_id accountKey'
  ).lean();
  const accountIds = idsBy(accountDocuments, 'accountKey');

  const policies = uniqueBy(rows, 'policyNumber');
  const result = await Policy.bulkWrite(policies.map((row) => upsertOperation(
    { policyNumber: row.policyNumber },
    {
      policyNumber: row.policyNumber,
      policyStartDate: row.policyStartDate,
      policyEndDate: row.policyEndDate,
      agent: agentIds.get(row.agentName),
      user: userIds.get(row.userKey),
      account: accountIds.get(row.accountKey),
      category: categoryIds.get(row.categoryName),
      company: companyIds.get(row.companyName)
    }
  )), { ordered: false });

  return {
    sourceRows: rows.length,
    policiesProcessed: policies.length,
    inserted: result.upsertedCount,
    updated: result.modifiedCount,
    matched: result.matchedCount,
    entities: {
      agents: agentIds.size,
      users: userIds.size,
      accounts: accountIds.size,
      categories: categoryIds.size,
      carriers: companyIds.size
    }
  };
}

module.exports = { importRows, uniqueBy };
