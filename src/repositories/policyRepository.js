const { User, Policy } = require('../models');

const POLICY_POPULATES = Object.freeze([
  { path: 'user', select: 'firstName dob address phoneNumber state zipCode email gender userType' },
  { path: 'agent', select: 'agentName' },
  { path: 'account', select: 'accountName' },
  { path: 'category', select: 'categoryName' },
  { path: 'company', select: 'companyName' }
]);

async function findPoliciesByUserPattern(pattern) {
  const users = await User.find(
    { $or: [{ firstName: pattern }, { email: pattern }] },
    '_id'
  ).limit(100).lean();

  if (!users.length) {
    return [];
  }

  return Policy.find({ user: { $in: users.map(({ _id }) => _id) } })
    .populate(POLICY_POPULATES)
    .sort({ policyStartDate: -1, _id: 1 })
    .lean();
}

function aggregatePoliciesByUser({ page, limit }) {
  return Policy.aggregate([
    { $group: {
      _id: '$user',
      policyCount: { $sum: 1 },
      policies: { $push: {
        _id: '$_id',
        policyNumber: '$policyNumber',
        policyStartDate: '$policyStartDate',
        policyEndDate: '$policyEndDate',
        account: '$account',
        category: '$category',
        company: '$company',
        agent: '$agent'
      } }
    } },
    { $sort: { policyCount: -1, _id: 1 } },
    { $facet: {
      metadata: [{ $count: 'totalUsers' }],
      items: [
        { $skip: (page - 1) * limit },
        { $limit: limit },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
        { $unwind: '$user' },
        { $lookup: { from: 'accounts', localField: 'policies.account', foreignField: '_id', as: 'accounts' } },
        { $lookup: { from: 'lobs', localField: 'policies.category', foreignField: '_id', as: 'categories' } },
        { $lookup: { from: 'carriers', localField: 'policies.company', foreignField: '_id', as: 'companies' } },
        { $lookup: { from: 'agents', localField: 'policies.agent', foreignField: '_id', as: 'agents' } },
        { $project: {
          _id: 0,
          user: { _id: '$user._id', firstName: '$user.firstName', email: '$user.email', userType: '$user.userType' },
          policyCount: 1,
          policies: 1,
          accounts: { _id: 1, accountName: 1 },
          categories: { _id: 1, categoryName: 1 },
          companies: { _id: 1, companyName: 1 },
          agents: { _id: 1, agentName: 1 }
        } }
      ]
    } }
  ]).then(([result]) => ({
    items: result?.items || [],
    totalUsers: result?.metadata[0]?.totalUsers || 0
  }));
}

module.exports = { findPoliciesByUserPattern, aggregatePoliciesByUser };
