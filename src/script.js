
const fs = require("fs").promises;

async function viewPolicies() {
  let policiesFile = await fs.readFile("./json/policies.json", "utf8");

  let policies = JSON.parse(policiesFile).filter((policy) => {
    return !policy.provisional;
  });


  for (let key in policies) {
    let policy = policies[key];
    console.log(key);
    console.log(policy.id);
    console.log(policy.name);
    console.log(policy.description);
    console.log('==========');
  }
}


viewPolicies();
