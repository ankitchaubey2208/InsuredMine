function cleanText(value) {
  if (value === undefined || value === null) {
    return '';
  }

  return String(value).trim();
}

function lower(value) {
  return cleanText(value).toLowerCase();
}

function parseDate(value) {
  const input = cleanText(value);
  if (!input) {
    return null;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input);
  if (!match) {
    const parsed = new Date(input);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const [year, month, day] = match.slice(1).map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  const isExactDate = parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day;
  return isExactDate ? parsed : null;
}

function userKey(row) {
  const email = lower(row.email);
  if (email) {
    return `email:${email}`;
  }

  return [
    'fallback',
    lower(row.firstname),
    cleanText(row.dob),
    cleanText(row.phone),
    lower(row.address)
  ].join(':');
}

function normalizeRow(row, rowNumber) {
  const normalized = {
    agentName: cleanText(row.agent),
    userKey: userKey(row),
    firstName: cleanText(row.firstname),
    dob: parseDate(row.dob),
    address: cleanText(row.address),
    phoneNumber: cleanText(row.phone),
    state: cleanText(row.state),
    zipCode: cleanText(row.zip),
    email: lower(row.email),
    gender: cleanText(row.gender),
    userType: cleanText(row.userType),
    accountName: cleanText(row.account_name),
    categoryName: cleanText(row.category_name),
    companyName: cleanText(row.company_name),
    policyNumber: cleanText(row.policy_number),
    policyStartDate: parseDate(row.policy_start_date),
    policyEndDate: parseDate(row.policy_end_date)
  };

  const required = ['agentName', 'firstName', 'accountName', 'categoryName', 'companyName', 'policyNumber'];
  const missing = required.filter((field) => !normalized[field]);
  if (missing.length) {
    return { error: `Row ${rowNumber}: missing ${missing.join(', ')}` };
  }

  normalized.accountKey = `${normalized.userKey}|${normalized.accountName.toLowerCase()}`;
  return { value: normalized };
}

module.exports = { normalizeRow, parseDate, userKey };
